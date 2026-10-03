import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { Prisma } from '@prisma/client';

export type SecurityEventAction =
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
   * Retrieves security audit events for a specific user (access-controlled to owner).
   */
  async getLogsForUser(userId: string, limit = 20) {
    return this.prisma.securityAuditLog.findMany({
      where: { userId },
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
