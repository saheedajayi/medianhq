import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminInvite, AdminRole } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import type { Response } from 'express';
import { AuthService } from '../../identity/auth/auth.service';
import {
  SecurityAuditService,
  type SecurityEventAction,
} from '../../identity/auth/security-audit.service';
import { EmailService } from '../../platform/email/email.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { adminInviteEmail } from './admin-invite-email';
import { AdminInvitesRepository } from './admin-invites.repository';
import { ADMIN_ROLE_LABELS, ADMIN_ROLES } from './admin-roles';
import type {
  AcceptAdminInviteDto,
  AdminInviteItem,
  CreateAdminInviteDto,
} from './dto/admin-invites.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
export const INVITE_EXPIRY_DAYS = 7;
const NAME_MAX_LENGTH = 60;

const INVALID_LINK = 'This invite link is invalid or has expired.';

type InviteWithSender = AdminInvite & {
  invitedBy: { firstName: string; lastName: string } | null;
};

/** Only the hash is stored, so a leaked database row can't be used as a link */
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AdminInvitesService {
  constructor(
    private readonly invitesRepository: AdminInvitesRepository,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly securityAudit: SecurityAuditService,
  ) {}

  async list(now = new Date()): Promise<AdminInviteItem[]> {
    const invites = await this.invitesRepository.findUnusedInvites();
    return invites.map((invite) => this.toItem(invite, now));
  }

  async create(
    dto: CreateAdminInviteDto,
    actor?: AdminActor,
    now = new Date(),
  ) {
    const email = this.readEmail(dto.email);
    const role = oneOf(dto.role, ADMIN_ROLES);
    if (!role) throw new BadRequestException('Choose an admin type.');

    // Emails are unique across all accounts, so an admin needs an address of their own
    if (await this.invitesRepository.findUserIdByEmail(email)) {
      throw new ConflictException(
        'This email already belongs to a Median account. Use a different address for the admin.',
      );
    }
    if (await this.invitesRepository.findOpenInviteForEmail(email, now)) {
      throw new ConflictException(
        'An invite is already waiting for this email. Resend it instead.',
      );
    }

    const token = this.newToken();
    const invite = await this.invitesRepository.createInvite({
      email,
      role,
      tokenHash: hashToken(token),
      invitedById: actor?.id ?? null,
      expiresAt: this.expiryFrom(now),
    });

    await this.sendInvite(invite, token);
    await this.record('ADMIN_INVITED', invite, actor);
    return this.toItem(invite, now);
  }

  /** Sends a new link with a fresh expiry; the old link stops working */
  async resend(inviteId: string, actor?: AdminActor, now = new Date()) {
    const existing = await this.findUnused(inviteId);
    const token = this.newToken();
    const invite = await this.invitesRepository.replaceToken(
      existing.id,
      hashToken(token),
      this.expiryFrom(now),
    );

    await this.sendInvite(invite, token);
    await this.record('ADMIN_INVITE_RESENT', invite, actor);
    return this.toItem(invite, now);
  }

  async revoke(inviteId: string, actor?: AdminActor) {
    const invite = await this.findUnused(inviteId);
    await this.invitesRepository.revokeInvite(invite.id);
    await this.record('ADMIN_INVITE_REVOKED', invite, actor);
    return { inviteId };
  }

  /** What the accept page shows before the invitee fills in the form */
  async getByToken(token: string, now = new Date()) {
    const invite = await this.findOpenByToken(token, now);
    return {
      email: invite.email,
      role: invite.role,
      roleLabel: ADMIN_ROLE_LABELS[invite.role],
      expiresAt: invite.expiresAt,
    };
  }

  /** Creates the admin account and signs them in */
  async accept(
    token: string,
    dto: AcceptAdminInviteDto,
    response: Response,
    now = new Date(),
  ) {
    const invite = await this.findOpenByToken(token, now);
    const firstName = this.readName(dto.firstName, 'First name');
    const lastName = this.readName(dto.lastName, 'Last name');
    const passwordHash = await this.authService.hashNewPassword(
      dto.password ?? '',
    );

    // The address may have signed up some other way since the invite was sent
    if (await this.invitesRepository.findUserIdByEmail(invite.email)) {
      throw new ConflictException(
        'This email already belongs to a Median account. Ask for an invite to a different address.',
      );
    }

    const admin = await this.invitesRepository.acceptInvite(invite, {
      firstName,
      lastName,
      passwordHash,
    });
    if (!admin) throw new BadRequestException(INVALID_LINK);

    await this.securityAudit.record({
      userId: admin.id,
      email: admin.email,
      action: 'ADMIN_INVITE_ACCEPTED',
      status: 'SUCCESS',
      metadata: {
        inviteId: invite.id,
        adminName: `${firstName} ${lastName}`,
        detail: `${invite.email} · ${ADMIN_ROLE_LABELS[invite.role]}`,
      },
    });

    const tokens = await this.authService.issueTokensForUser(admin.id);
    this.authService.setAuthCookies(response, tokens);
    return { user: tokens.user };
  }

  private async findUnused(inviteId: string) {
    const invite = await this.invitesRepository.findUnusedInviteById(inviteId);
    if (!invite) throw new NotFoundException('Invite not found.');
    return invite;
  }

  private async findOpenByToken(token: string, now: Date) {
    const trimmed = token?.trim();
    const invite = trimmed
      ? await this.invitesRepository.findUnusedInviteByTokenHash(
          hashToken(trimmed),
        )
      : null;
    if (!invite || invite.expiresAt <= now) {
      throw new BadRequestException(INVALID_LINK);
    }
    return invite;
  }

  /** A failed email must not undo the invite, which can be resent */
  private sendInvite(invite: InviteWithSender, token: string) {
    return this.emailService
      .sendBookingUpdate({
        email: invite.email,
        ...adminInviteEmail(
          invite.role,
          invite.invitedBy && fullName(invite.invitedBy),
          token,
          INVITE_EXPIRY_DAYS,
        ),
        idempotencyKey: `admin-invite:${invite.id}:${invite.tokenHash}`,
      })
      .catch(() => undefined);
  }

  private record(
    action: SecurityEventAction,
    invite: { id: string; email: string; role: AdminRole },
    actor?: AdminActor,
  ) {
    return this.securityAudit.record({
      email: invite.email,
      action,
      status: 'SUCCESS',
      metadata: {
        inviteId: invite.id,
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
        detail: `${invite.email} · ${ADMIN_ROLE_LABELS[invite.role]}`,
      },
    });
  }

  private newToken() {
    return randomBytes(32).toString('base64url');
  }

  private expiryFrom(now: Date) {
    return new Date(now.getTime() + INVITE_EXPIRY_DAYS * DAY_MS);
  }

  private readEmail(email?: string) {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException('Enter a valid email address.');
    }
    return normalized;
  }

  private readName(value: string | undefined, field: string) {
    const name = value?.trim();
    if (!name) throw new BadRequestException(`${field} is required.`);
    if (name.length > NAME_MAX_LENGTH) {
      throw new BadRequestException(
        `${field} must be ${NAME_MAX_LENGTH} characters or fewer.`,
      );
    }
    return name;
  }

  private toItem(invite: InviteWithSender, now: Date): AdminInviteItem {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.expiresAt > now ? 'PENDING' : 'EXPIRED',
      invitedBy: invite.invitedBy && fullName(invite.invitedBy),
      sentAt: invite.updatedAt,
      expiresAt: invite.expiresAt,
    };
  }
}
