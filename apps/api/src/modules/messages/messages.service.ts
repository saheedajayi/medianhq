import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import {
  RoomServiceClient,
  DataPacket_Kind,
  AccessToken,
} from 'livekit-server-sdk';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

type ParticipantUser = {
  id: string;
  firstName: string;
  lastName: string;
  mentorProfile: { avatarUrl: string | null; jobTitle: string | null } | null;
  menteeProfile: {
    avatarUrl: string | null;
    currentRole: string | null;
  } | null;
};

const PARTICIPANT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  mentorProfile: { select: { avatarUrl: true, jobTitle: true } },
  menteeProfile: { select: { avatarUrl: true, currentRole: true } },
} as const;

/** Realtime events pushed to a user's inbox room */
type InboxEvent =
  | { type: 'NEW_MESSAGE'; message: Record<string, unknown> }
  | { type: 'EDIT_MESSAGE'; message: Record<string, unknown> }
  | { type: 'DELETE_MESSAGE'; messageId: string; conversationId: string }
  | { type: 'MESSAGES_DELIVERED'; conversationId: string; deliveredAt: string }
  | { type: 'MESSAGES_READ'; conversationId: string; readAt: string };

@Injectable()
export class MessagesService implements OnModuleInit {
  private readonly logger = new Logger(MessagesService.name);
  private roomService: RoomServiceClient | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const rawUrl =
      process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    if (rawUrl && key && secret) {
      const httpUrl = rawUrl
        .replace(/^wss:\/\//i, 'https://')
        .replace(/^ws:\/\//i, 'http://');
      this.roomService = new RoomServiceClient(httpUrl, key, secret);
    }
  }

  async getLiveKitToken(user: AuthUser) {
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    const rawUrl =
      process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
    if (!key || !secret) {
      throw new BadRequestException('LiveKit credentials not configured.');
    }

    const at = new AccessToken(key, secret, {
      identity: user.id,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'User',
      ttl: '24h',
    });

    const roomName = `user_${user.id}`;
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return {
      token,
      roomName,
      serverUrl: rawUrl,
    };
  }

  async listConversations(user: AuthUser) {
    // Opening the inbox means the app has received everything sent so far. Each
    // database trip is slow, so the independent queries run side by side
    const [, userConvs, unread] = await Promise.all([
      this.markAllDelivered(user.id),
      this.prisma.conversationUser.findMany({
        where: { userId: user.id },
        include: {
          conversation: {
            include: {
              participants: {
                include: { user: { select: PARTICIPANT_SELECT } },
              },
              messages: { take: 1, orderBy: { createdAt: 'desc' } },
            },
          },
        },
        orderBy: { conversation: { updatedAt: 'desc' } },
      }),
      this.prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversation: { participants: { some: { userId: user.id } } },
          senderId: { not: user.id },
          isRead: false,
        },
        _count: { _all: true },
      }),
    ]);
    const unreadByConversation = new Map(
      unread.map((row) => [row.conversationId, row._count._all]),
    );

    return Promise.all(
      userConvs.map(async (uc) => {
        const other = uc.conversation.participants.find(
          (p) => p.userId !== user.id,
        )?.user;
        const lastMessage = uc.conversation.messages[0];

        return {
          id: uc.conversationId,
          participant: other
            ? {
                ...this.toParticipant(other),
                isOnline: await this.isOnline(other.id),
              }
            : null,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
                isRead: lastMessage.isRead,
                deliveredAt: lastMessage.deliveredAt,
              }
            : null,
          unreadCount: unreadByConversation.get(uc.conversationId) ?? 0,
          updatedAt: uc.conversation.updatedAt,
        };
      }),
    );
  }

  /**
   * Opens a chat with someone from a booking: their existing conversation if
   * there is one, otherwise their details so the app can show an empty chat.
   * The conversation itself is created by the first message.
   */
  async getContact(user: AuthUser, otherUserId: string) {
    if (otherUserId === user.id) {
      throw new BadRequestException("You can't message yourself.");
    }
    const other = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: PARTICIPANT_SELECT,
    });
    if (!other) {
      throw new NotFoundException('User not found.');
    }

    const conversationId = await this.findSharedConversation(
      user.id,
      otherUserId,
    );
    if (!conversationId && !(await this.shareBooking(user.id, otherUserId))) {
      throw new ForbiddenException(
        'You can message people you have a booking with.',
      );
    }

    return {
      conversationId,
      participant: {
        ...this.toParticipant(other),
        isOnline: await this.isOnline(other.id),
      },
    };
  }

  async getMessages(user: AuthUser, conversationId: string) {
    await this.assertParticipant(user.id, conversationId);
    const [messages] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      }),
      this.deliverConversation(user.id, conversationId),
    ]);
    return messages;
  }

  async sendMessage(
    user: AuthUser,
    dto: { recipientId: string; content: string },
  ) {
    const content = dto.content?.trim();
    if (!dto.recipientId || !content) {
      throw new BadRequestException('recipientId and content are required.');
    }
    if (dto.recipientId === user.id) {
      throw new BadRequestException("You can't message yourself.");
    }

    let conversationId = await this.findSharedConversation(
      user.id,
      dto.recipientId,
    );

    if (!conversationId) {
      // New chats start from a booking, so strangers can't message each other
      if (!(await this.shareBooking(user.id, dto.recipientId))) {
        throw new ForbiddenException(
          'You can message people you have a booking with.',
        );
      }
      const created = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: user.id }, { userId: dto.recipientId }],
          },
        },
      });
      conversationId = created.id;
    }

    const [message] = await Promise.all([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // The recipient's app answers with a delivered receipt when this arrives.
    // Not awaited: the sender sees "sent" once the message is saved
    void this.push(dto.recipientId, {
      type: 'NEW_MESSAGE',
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        deliveredAt: message.deliveredAt,
        createdAt: message.createdAt.toISOString(),
      },
    });

    return message;
  }

  async editMessage(
    user: AuthUser,
    messageId: string,
    dto: { content: string },
  ) {
    if (!dto.content?.trim()) {
      throw new BadRequestException('Content is required.');
    }
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found.');
    }
    if (message.senderId !== user.id) {
      throw new BadRequestException('You can only edit your own messages.');
    }
    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content },
    });

    this.notifyOtherParticipant(message.conversationId, user.id, {
      type: 'EDIT_MESSAGE',
      message: {
        id: updated.id,
        conversationId: updated.conversationId,
        content: updated.content,
        isEdited: true,
      },
    });

    return updated;
  }

  async deleteMessage(user: AuthUser, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found.');
    }
    if (message.senderId !== user.id) {
      throw new BadRequestException('You can only delete your own messages.');
    }
    await this.prisma.message.delete({
      where: { id: messageId },
    });

    this.notifyOtherParticipant(message.conversationId, user.id, {
      type: 'DELETE_MESSAGE',
      messageId,
      conversationId: message.conversationId,
    });

    return { success: true };
  }

  /** Second grey tick: the recipient's app has the messages */
  async markDelivered(user: AuthUser, conversationId: string) {
    await this.assertParticipant(user.id, conversationId);
    await this.deliverConversation(user.id, conversationId);
    return { success: true };
  }

  /** Green ticks: the recipient opened the chat */
  async markConversationRead(user: AuthUser, conversationId: string) {
    await this.assertParticipant(user.id, conversationId);
    const readAt = new Date();
    const fromOthers = { conversationId, senderId: { not: user.id } };

    // Read implies delivered, for messages that skipped the delivered step
    const [, result] = await Promise.all([
      this.prisma.message.updateMany({
        where: { ...fromOthers, deliveredAt: null },
        data: { deliveredAt: readAt },
      }),
      this.prisma.message.updateMany({
        where: { ...fromOthers, isRead: false },
        data: { isRead: true },
      }),
    ]);

    if (result.count > 0) {
      this.notifyOtherParticipant(conversationId, user.id, {
        type: 'MESSAGES_READ',
        conversationId,
        readAt: readAt.toISOString(),
      });
    }
    return { success: true };
  }

  reportMessage(
    user: AuthUser,
    dto: { messageId: string; reason: string; note?: string },
  ) {
    if (!dto.messageId || !dto.reason) {
      throw new BadRequestException('messageId and reason are required.');
    }
    // We log the report for moderation review
    this.logger.log(
      `[Moderation] Report filed by user ${user.id} on message ${dto.messageId}: ${dto.reason} - note: ${dto.note ?? 'none'}`,
    );
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private toParticipant(user: ParticipantUser) {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatar:
        user.mentorProfile?.avatarUrl || user.menteeProfile?.avatarUrl || null,
      role:
        user.mentorProfile?.jobTitle ||
        user.menteeProfile?.currentRole ||
        'User',
    };
  }

  private async isOnline(userId: string) {
    if (!this.roomService) return false;
    try {
      const participants = await this.roomService.listParticipants(
        `user_${userId}`,
      );
      return participants.length > 0;
    } catch {
      return false;
    }
  }

  private async assertParticipant(userId: string, conversationId: string) {
    const membership = await this.prisma.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) {
      throw new NotFoundException('Conversation not found or access denied.');
    }
  }

  private async findSharedConversation(userId: string, otherUserId: string) {
    const shared = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      select: { id: true },
    });
    return shared?.id ?? null;
  }

  /** A real booking between the two (in either direction), not an abandoned checkout */
  private async shareBooking(userId: string, otherUserId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        status: { not: BookingStatus.PENDING_PAYMENT },
        OR: [
          { mentorId: userId, menteeId: otherUserId },
          { mentorId: otherUserId, menteeId: userId },
        ],
      },
      select: { id: true },
    });
    return !!booking;
  }

  /** Marks one conversation's incoming messages delivered and tells the sender */
  private async deliverConversation(userId: string, conversationId: string) {
    const deliveredAt = new Date();
    const result = await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, deliveredAt: null },
      data: { deliveredAt },
    });
    if (result.count > 0) {
      this.notifyOtherParticipant(conversationId, userId, {
        type: 'MESSAGES_DELIVERED',
        conversationId,
        deliveredAt: deliveredAt.toISOString(),
      });
    }
  }

  /** Pushes to the other person in the background so the response isn't held up */
  private notifyOtherParticipant(
    conversationId: string,
    userId: string,
    event: InboxEvent,
  ) {
    void this.findOtherParticipant(conversationId, userId)
      .then((otherId) => (otherId ? this.push(otherId, event) : undefined))
      .catch((err) =>
        this.logger.warn(
          `[LiveKit] Failed to push ${event.type}: ${String(err)}`,
        ),
      );
  }

  private async findOtherParticipant(conversationId: string, userId: string) {
    const other = await this.prisma.conversationUser.findFirst({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    return other?.userId ?? null;
  }

  /** Marks everything sent to this user as delivered and tells each sender */
  private async markAllDelivered(userId: string) {
    const pending = await this.prisma.message.findMany({
      where: {
        deliveredAt: null,
        senderId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
      select: { id: true, conversationId: true, senderId: true },
    });
    if (pending.length === 0) return;

    const deliveredAt = new Date();
    await this.prisma.message.updateMany({
      where: { id: { in: pending.map((m) => m.id) } },
      data: { deliveredAt },
    });

    const receipts = new Map(
      pending.map((m) => [`${m.senderId}:${m.conversationId}`, m]),
    );
    // Not awaited: the inbox shouldn't wait on realtime pushes
    void Promise.all(
      [...receipts.values()].map((m) =>
        this.push(m.senderId, {
          type: 'MESSAGES_DELIVERED',
          conversationId: m.conversationId,
          deliveredAt: deliveredAt.toISOString(),
        }),
      ),
    );
  }

  /** Best effort: realtime is a nicety, the data is already saved */
  private async push(userId: string, event: InboxEvent) {
    if (!this.roomService) return;
    try {
      await this.roomService.sendData(
        `user_${userId}`,
        Buffer.from(JSON.stringify(event)),
        DataPacket_Kind.RELIABLE,
      );
    } catch (err) {
      this.logger.warn(
        `[LiveKit] Failed to push ${event.type}: ${String(err)}`,
      );
    }
  }
}
