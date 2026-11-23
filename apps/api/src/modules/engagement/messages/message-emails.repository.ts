import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

const PERSON_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  suspendedAt: true,
  settings: { select: { notificationPreferences: true } },
} as const;

@Injectable()
export class MessageEmailsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Messages sent within the window that nobody has read yet, oldest first */
  findUnreadSentBetween(from: Date, to: Date) {
    return this.prisma.message.findMany({
      where: { isRead: false, createdAt: { gt: from, lte: to } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        createdAt: true,
        conversation: {
          select: {
            participants: { select: { user: { select: PERSON_SELECT } } },
          },
        },
      },
    });
  }

  /** Unread messages to the same person in the same chat, sent in [from, before) */
  countUnreadBefore(
    conversationId: string,
    recipientId: string,
    from: Date,
    before: Date,
  ) {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: recipientId },
        isRead: false,
        createdAt: { gte: from, lt: before },
      },
    });
  }
}
