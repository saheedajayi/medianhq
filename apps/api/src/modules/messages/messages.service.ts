import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
        lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt } : null,
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
}
