import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { RoomServiceClient, DataPacket_Kind, AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class MessagesService implements OnModuleInit {
  private roomService: RoomServiceClient | null = null;

  constructor(private readonly prisma: PrismaService) { }

  onModuleInit() {
    const rawUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    if (rawUrl && key && secret) {
      const httpUrl = rawUrl.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://');
      this.roomService = new RoomServiceClient(httpUrl, key, secret);
    }
  }

  async getLiveKitToken(user: AuthUser) {
    const key = process.env.LIVEKIT_API_KEY;
    const secret = process.env.LIVEKIT_API_SECRET;
    const rawUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
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
    const userConvs = await this.prisma.conversationUser.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    mentorProfile: true,
                    menteeProfile: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return Promise.all(
      userConvs.map(async (uc) => {
        const other = uc.conversation.participants.find((p) => p.userId !== user.id)?.user;
        const lastMessage = uc.conversation.messages[0];

        let isOnline = false;
        if (other && this.roomService) {
          try {
            const participants = await this.roomService.listParticipants(`user_${other.id}`);
            isOnline = participants && participants.length > 0;
          } catch {
            isOnline = false;
          }
        }

        return {
          id: uc.conversationId,
          participant: other
            ? {
                id: other.id,
                name: `${other.firstName} ${other.lastName}`.trim(),
                avatar: `https://i.pravatar.cc/150?u=${other.id}`,
                role: other.mentorProfile?.jobTitle || other.menteeProfile?.currentRole || 'User',
                isOnline,
              }
            : null,
          lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt } : null,
          updatedAt: uc.conversation.updatedAt,
        };
      }),
    );
  }

  async getMessages(user: AuthUser, conversationId: string) {
    const isParticipant = await this.prisma.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    });

    if (!isParticipant) {
      throw new NotFoundException('Conversation not found or access denied.');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(user: AuthUser, dto: { recipientId: string; content: string }) {
    if (!dto.recipientId || !dto.content) {
      throw new BadRequestException('recipientId and content are required.');
    }

    // Find existing conversation between both users
    const userConversations = await this.prisma.conversationUser.findMany({
      where: { userId: user.id },
      select: { conversationId: true },
    });

    const shared = await this.prisma.conversationUser.findFirst({
      where: {
        userId: dto.recipientId,
        conversationId: { in: userConversations.map((c) => c.conversationId) },
      },
    });

    let conversationId = shared?.conversationId;

    if (!conversationId) {
      const created = await this.prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: user.id }, { userId: dto.recipientId }],
          },
        },
      });
      conversationId = created.id;
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: dto.content,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Real-time dispatch via LiveKit to recipient's personal inbox room
    if (this.roomService) {
      try {
        const payload = JSON.stringify({
          type: 'NEW_MESSAGE',
          message: {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            isRead: message.isRead,
            createdAt: message.createdAt.toISOString(),
          },
        });
        await this.roomService.sendData(
          `user_${dto.recipientId}`,
          Buffer.from(payload),
          DataPacket_Kind.RELIABLE,
        );
      } catch (err) {
        console.warn('[LiveKit] Failed to push real-time message:', err);
      }
    }

    return message;
  }

  async editMessage(user: AuthUser, messageId: string, dto: { content: string }) {
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

    // Real-time dispatch via LiveKit
    if (this.roomService) {
      try {
        const participants = await this.prisma.conversationUser.findMany({
          where: { conversationId: message.conversationId },
        });
        const other = participants.find((p) => p.userId !== user.id);
        if (other) {
          const payload = JSON.stringify({
            type: 'EDIT_MESSAGE',
            message: {
              id: updated.id,
              conversationId: updated.conversationId,
              content: updated.content,
              isEdited: true,
            },
          });
          await this.roomService.sendData(
            `user_${other.userId}`,
            Buffer.from(payload),
            DataPacket_Kind.RELIABLE,
          );
        }
      } catch (err) {
        console.warn('[LiveKit] Failed to push edit notification:', err);
      }
    }

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

    // Real-time dispatch via LiveKit
    if (this.roomService) {
      try {
        const participants = await this.prisma.conversationUser.findMany({
          where: { conversationId: message.conversationId },
        });
        const other = participants.find((p) => p.userId !== user.id);
        if (other) {
          const payload = JSON.stringify({
            type: 'DELETE_MESSAGE',
            messageId,
            conversationId: message.conversationId,
          });
          await this.roomService.sendData(
            `user_${other.userId}`,
            Buffer.from(payload),
            DataPacket_Kind.RELIABLE,
          );
        }
      } catch (err) {
        console.warn('[LiveKit] Failed to push delete notification:', err);
      }
    }

    return { success: true };
  }

  async markConversationRead(user: AuthUser, conversationId: string) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    });
    return { success: true };
  }

  async reportMessage(user: AuthUser, dto: { messageId: string; reason: string; note?: string }) {
    if (!dto.messageId || !dto.reason) {
      throw new BadRequestException('messageId and reason are required.');
    }
    // We log the report for moderation review
    console.log(`[Moderation] Report filed by user ${user.id} on message ${dto.messageId}: ${dto.reason} - note: ${dto.note ?? 'none'}`);
    return { success: true };
  }
}

