import { SecurityAuditService } from '../../../../src/modules/auth/security-audit.service';
import { PrismaService } from '../../../../src/database/prisma.service';

type MockPrismaService = {
  securityAuditLog: {
    create: jest.Mock;
    findMany: jest.Mock;
    deleteMany: jest.Mock;
  };
};

describe('SecurityAuditService', () => {
  let service: SecurityAuditService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = {
      securityAuditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    service = new SecurityAuditService(prisma as unknown as PrismaService);
  });

  describe('record', () => {
    it('creates a security audit log entry successfully', async () => {
      prisma.securityAuditLog.create.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        email: 'user@example.com',
        action: 'PASSWORD_CHANGE',
        status: 'SUCCESS',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        metadata: null,
        createdAt: new Date(),
      });

      await expect(
        service.record({
          userId: 'user-1',
          email: 'user@example.com',
          action: 'PASSWORD_CHANGE',
          status: 'SUCCESS',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      ).resolves.toBeUndefined();

      expect(prisma.securityAuditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          email: 'user@example.com',
          action: 'PASSWORD_CHANGE',
          status: 'SUCCESS',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          metadata: undefined,
        },
      });
    });

    it('catches and suppresses database errors without throwing', async () => {
      prisma.securityAuditLog.create.mockRejectedValue(
        new Error('Database offline'),
      );

      await expect(
        service.record({
          userId: 'user-1',
          action: 'FAILED_RECOVERY',
          status: 'FAILURE',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getLogsForUser', () => {
    it('queries logs strictly scoped to the requesting user in descending order', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          action: 'PASSWORD_CHANGE',
          status: 'SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome',
          createdAt: new Date(),
        },
      ];
      prisma.securityAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getLogsForUser('user-1', 10);
      expect(result).toEqual(mockLogs);
      expect(prisma.securityAuditLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          status: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      });
    });

    it('caps limit at 50 records max', async () => {
      prisma.securityAuditLog.findMany.mockResolvedValue([]);
      await service.getLogsForUser('user-1', 100);

      expect(prisma.securityAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });
  });

  describe('pruneOldLogs', () => {
    it('deletes logs older than retention period', async () => {
      prisma.securityAuditLog.deleteMany.mockResolvedValue({
        count: 42,
      });

      const deletedCount = await service.pruneOldLogs(90);
      expect(deletedCount).toBe(42);
      expect(prisma.securityAuditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });
    });
  });
});
