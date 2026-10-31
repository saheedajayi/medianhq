import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const TOUCH_INTERVAL_MS = 5 * 60 * 1000;
// Matches how long a refresh token can keep a browser signed in
const VISIBLE_FOR_MS = 30 * 24 * 60 * 60 * 1000;

type DeviceContext = {
  userAgent?: string;
  ipAddress?: string;
  location?: string | null;
};

/** "Mozilla/5.0 (Macintosh; ...) Chrome/120" -> "Chrome on Mac" */
export function describeDevice(userAgent?: string | null) {
  const ua = userAgent ?? '';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Chrome\/|CriOS\//.test(ua)
        ? 'Chrome'
        : /Firefox\/|FxiOS\//.test(ua)
          ? 'Firefox'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Unknown browser';
  const device = /iPhone/.test(ua)
    ? 'iPhone'
    : /iPad/.test(ua)
      ? 'iPad'
      : /Android/.test(ua)
        ? 'Android'
        : /Macintosh/.test(ua)
          ? 'Mac'
          : /Windows/.test(ua)
            ? 'Windows'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'unknown device';

  return {
    label: `${browser} on ${device}`,
    isMobile: ['iPhone', 'Android'].includes(device),
  };
}

/**
 * Records which browsers a user is signed in on. Failures are logged, never
 * thrown: losing a device row must not stop anyone using their account.
 */
@Injectable()
export class DeviceSessionsService {
  private readonly logger = new Logger(DeviceSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async track(userId: string, deviceId: string, context: DeviceContext) {
    try {
      const existing = await this.prisma.deviceSession.findUnique({
        where: { id: deviceId },
      });
      if (
        existing?.userId === userId &&
        Date.now() - existing.lastActiveAt.getTime() < TOUCH_INTERVAL_MS
      ) {
        return;
      }

      const data = {
        userId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        location: context.location ?? existing?.location,
        lastActiveAt: new Date(),
      };
      await this.prisma.deviceSession.upsert({
        where: { id: deviceId },
        create: { id: deviceId, ...data },
        update: data,
      });
    } catch (error) {
      this.logger.warn(`Could not record device session: ${error}`);
    }
  }

  async list(userId: string, currentDeviceId?: string) {
    const sessions = await this.prisma.deviceSession.findMany({
      where: {
        userId,
        lastActiveAt: { gte: new Date(Date.now() - VISIBLE_FOR_MS) },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return sessions
      .map((session) => ({
        id: session.id,
        ...describeDevice(session.userAgent),
        location: session.location,
        lastActiveAt: session.lastActiveAt,
        isCurrent: session.id === currentDeviceId,
      }))
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  }

  async removeOthers(userId: string, currentDeviceId?: string) {
    await this.removeWhere({
      userId,
      ...(currentDeviceId && { id: { not: currentDeviceId } }),
    });
  }

  async removeAll(userId: string) {
    await this.removeWhere({ userId });
  }

  async removeDevice(deviceId: string) {
    await this.removeWhere({ id: deviceId });
  }

  private async removeWhere(where: { userId?: string; id?: string | { not: string } }) {
    try {
      await this.prisma.deviceSession.deleteMany({ where });
    } catch (error) {
      this.logger.warn(`Could not remove device sessions: ${error}`);
    }
  }
}
