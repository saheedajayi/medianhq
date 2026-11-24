import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { Prisma } from '@prisma/client';

/** Recorded against the affected user when an admin acts on their account */
export const ADMIN_ACCOUNT_ACTIONS = [
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_REINSTATED',
  'ACCOUNT_FLAGGED',
  'ACCOUNT_UNFLAGGED',
  'APPLICATION_REVIEWER_ASSIGNED',
  'APPLICATION_CHECKLIST_UPDATED',
  'APPLICATION_NOTE_SAVED',
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'ADMIN_INVITED',
  'ADMIN_INVITE_RESENT',
  'ADMIN_INVITE_REVOKED',
  'ADMIN_INVITE_ACCEPTED',
  'REFUND_RETRIED',
  'REFUND_REJECTED',
  'REFUND_INFO_REQUESTED',
  'PAYOUT_APPROVED',
  'PAYOUT_REJECTED',
  'ADMIN_ACCESS_CHANGED',
  'RECORDING_VIEWED',
  'EMAIL_SENT_BY_ADMIN',
] as const;

/** How long a user can see their own security events */
export const SECURITY_EVENT_RETENTION_DAYS = 90;

export type SecurityEventAction =
  | (typeof ADMIN_ACCOUNT_ACTIONS)[number]
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGE'
  | 'RECOVERY_REQUEST'
  | 'FAILED_RECOVERY'
  | 'SESSION_INVALIDATION'
  | 'SESSIONS_REVOKED';

export type RecordSecurityEventInput = {
  userId?: string;
  email?: string;
  action: SecurityEventAction;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a security event. Fails gracefully so audit failures never block auth actions.
   */
  async record(input: RecordSecurityEventInput): Promise<void> {
    try {
      await this.prisma.securityAuditLog.create({
        data: {
          userId: input.userId,
          email: input.email,
          action: input.action,
          status: input.status,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: input.metadata,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record security audit log for action ${input.action}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Retrieves a user's own security events from the last 90 days (access-controlled to owner).
   */
  async getLogsForUser(userId: string, limit = 20) {
    return this.prisma.securityAuditLog.findMany({
      // Admin actions on the account are for the admin log, not the user's own list
      where: {
        userId,
        action: { notIn: [...ADMIN_ACCOUNT_ACTIONS] },
        createdAt: {
          gte: new Date(
            Date.now() - SECURITY_EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
          ),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
      select: {
        id: true,
        action: true,
        status: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });
  }

  /**
   * Enforces data retention by purging records older than retentionDays (default: 90 days).
   */
  async pruneOldLogs(retentionDays = 90): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000,
    );
    const result = await this.prisma.securityAuditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    return result.count;
  }
}
