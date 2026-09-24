import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return userConvs.map((uc) => {
      const other = uc.conversation.participants.find((p) => p.userId !== user.id)?.user;
      const lastMessage = uc.conversation.messages[0];

      const unreadCount = 0; // Placeholder — add unread tracking field if needed

      return {
        id: uc.conversationId,
        participant: other
          ? {
              id: other.id,
              name: `${other.firstName} ${other.lastName}`.trim(),
              avatar: `https://i.pravatar.cc/150?u=${other.id}`,
              role: other.mentorProfile?.jobTitle || other.menteeProfile?.currentRole || 'User',
            }
          : null,
        lastMessage: lastMessage
          ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
          : null,
        unreadCount,
        updatedAt: uc.conversation.updatedAt,
      };
    });
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

    return message;
  }

  async editMessage(user: AuthUser, messageId: string, dto: { content: string }) {
    if (!dto.content?.trim()) {
      throw new BadRequestException('Message content cannot be empty.');
    }

    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found.');
    if (message.senderId !== user.id) throw new ForbiddenException('You can only edit your own messages.');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content.trim() },
    });
  }

  async deleteMessage(user: AuthUser, messageId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found.');
    if (message.senderId !== user.id) throw new ForbiddenException('You can only delete your own messages.');

    await this.prisma.message.delete({ where: { id: messageId } });
    return { success: true };
  }

  async markConversationRead(user: AuthUser, conversationId: string) {
    const isParticipant = await this.prisma.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    });

    if (!isParticipant) throw new NotFoundException('Conversation not found or access denied.');

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: user.id }, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  async reportMessage(user: AuthUser, dto: { messageId: string; reason: string; note?: string }) {
    if (!dto.messageId || !dto.reason) {
      throw new BadRequestException('messageId and reason are required.');
    }

    const message = await this.prisma.message.findUnique({ where: { id: dto.messageId } });
    if (!message) throw new NotFoundException('Message not found.');

    // Log the report — in a full implementation this would save to a Report model
    console.log(`[MessageReport] User ${user.id} reported message ${dto.messageId}. Reason: ${dto.reason}. Note: ${dto.note ?? 'N/A'}`);

    return { success: true };
  }
}

