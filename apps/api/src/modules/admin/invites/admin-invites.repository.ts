import { Injectable } from '@nestjs/common';
import { AdminRole, UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

const INVITE_INCLUDE = {
  invitedBy: { select: { firstName: true, lastName: true } },
} as const;

/** Not yet accepted or revoked; it may still have expired */
const UNUSED = { acceptedAt: null, revokedAt: null } as const;

@Injectable()
export class AdminInvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserIdByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  /** Invites that were never used, newest first, whether or not they have expired */
  findUnusedInvites() {
    return this.prisma.adminInvite.findMany({
      where: UNUSED,
      include: INVITE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOpenInviteForEmail(email: string, now: Date) {
    return this.prisma.adminInvite.findFirst({
      where: { email, ...UNUSED, expiresAt: { gt: now } },
    });
  }

  findUnusedInviteById(inviteId: string) {
    return this.prisma.adminInvite.findFirst({
      where: { id: inviteId, ...UNUSED },
      include: INVITE_INCLUDE,
    });
  }

  findUnusedInviteByTokenHash(tokenHash: string) {
    return this.prisma.adminInvite.findFirst({
      where: { tokenHash, ...UNUSED },
    });
  }

  createInvite(data: {
    email: string;
    role: AdminRole;
    tokenHash: string;
    invitedById: string | null;
    expiresAt: Date;
  }) {
    return this.prisma.adminInvite.create({ data, include: INVITE_INCLUDE });
  }

  /** A fresh token and expiry, so the earlier link stops working */
  replaceToken(inviteId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.adminInvite.update({
      where: { id: inviteId },
      data: { tokenHash, expiresAt },
      include: INVITE_INCLUDE,
    });
  }

  revokeInvite(inviteId: string) {
    return this.prisma.adminInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Marks the invite used and creates the admin in one transaction. The
   * invite is only claimed if it is still unused, so the same link can't
   * create two accounts if it is submitted twice at once.
   */
  acceptInvite(
    invite: { id: string; email: string; role: AdminRole },
    account: { firstName: string; lastName: string; passwordHash: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.adminInvite.updateMany({
        where: { id: invite.id, ...UNUSED },
        data: { acceptedAt: new Date() },
      });
      if (claimed.count === 0) return null;

      return tx.user.create({
        data: {
          email: invite.email,
          firstName: account.firstName,
          lastName: account.lastName,
          passwordHash: account.passwordHash,
          role: UserRole.ADMIN,
          adminRole: invite.role,
          // Following the emailed link proves they own the address
          emailVerifiedAt: new Date(),
        },
        select: { id: true, email: true },
      });
    });
  }
}
