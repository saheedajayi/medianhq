import { ForbiddenException } from '@nestjs/common';
import { MessagesService } from '../../../../../src/modules/engagement/messages/messages.service';

// Receipts are pushed in the background after the response
const flushBackgroundWork = () => new Promise((resolve) => setImmediate(resolve));

describe('MessagesService', () => {
  const user = { id: 'me', firstName: 'Ada', lastName: 'Obi' } as never;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let service: MessagesService;
  let pushed: unknown[];

  beforeEach(() => {
    pushed = [];
    prisma = {
      conversation: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      conversationUser: { findUnique: jest.fn(), findFirst: jest.fn() },
      booking: { findFirst: jest.fn() },
      message: { create: jest.fn(), updateMany: jest.fn() },
      user: { findUnique: jest.fn() },
    };
    service = new MessagesService(prisma as never);
    // Capture realtime pushes instead of calling LiveKit
    (service as unknown as { roomService: unknown }).roomService = {
      sendData: jest.fn((room: string, data: Buffer) => {
        pushed.push({ room, ...JSON.parse(data.toString()) });
        return Promise.resolve();
      }),
      listParticipants: jest.fn().mockResolvedValue([]),
    };
  });

  describe('sendMessage', () => {
    it('refuses to start a chat with someone you have no booking with', async () => {
      prisma.conversation.findFirst.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue(null);
      await expect(
        service.sendMessage(user, { recipientId: 'stranger', content: 'Hi' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.conversation.create).not.toHaveBeenCalled();
    });

    it('starts a chat with someone you share a booking with', async () => {
      prisma.conversation.findFirst.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue({ id: 'b1' });
      prisma.conversation.create.mockResolvedValue({ id: 'c1' });
      prisma.message.create.mockResolvedValue({
        id: 'm1',
        conversationId: 'c1',
        senderId: 'me',
        content: 'Hi',
        isRead: false,
        deliveredAt: null,
        createdAt: new Date(),
      });
      const message = await service.sendMessage(user, { recipientId: 'mentor', content: ' Hi ' });
      expect(message.conversationId).toBe('c1');
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: { conversationId: 'c1', senderId: 'me', content: 'Hi' },
      });
      expect(pushed).toEqual([expect.objectContaining({ room: 'user_mentor', type: 'NEW_MESSAGE' })]);
    });

    it('keeps using an existing chat without needing a booking', async () => {
      prisma.conversation.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.message.create.mockResolvedValue({ id: 'm1', conversationId: 'c1', createdAt: new Date() });
      await service.sendMessage(user, { recipientId: 'mentor', content: 'Hi' });
      expect(prisma.booking.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('receipts', () => {
    beforeEach(() => {
      prisma.conversationUser.findUnique.mockResolvedValue({ id: 'membership' });
      prisma.conversationUser.findFirst.mockResolvedValue({ userId: 'sender' });
    });

    it('tells the sender when their messages are read', async () => {
      prisma.message.updateMany.mockResolvedValue({ count: 2 });
      await service.markConversationRead(user, 'c1');
      await flushBackgroundWork();
      expect(pushed).toEqual([
        expect.objectContaining({ room: 'user_sender', type: 'MESSAGES_READ', conversationId: 'c1' }),
      ]);
    });

    it('stays quiet when nothing new was read', async () => {
      prisma.message.updateMany.mockResolvedValue({ count: 0 });
      await service.markConversationRead(user, 'c1');
      await flushBackgroundWork();
      expect(pushed).toEqual([]);
    });

    it('tells the sender when their messages are delivered', async () => {
      prisma.message.updateMany.mockResolvedValue({ count: 1 });
      await service.markDelivered(user, 'c1');
      await flushBackgroundWork();
      expect(pushed).toEqual([
        expect.objectContaining({ room: 'user_sender', type: 'MESSAGES_DELIVERED' }),
      ]);
    });

    it('refuses receipts from outside the conversation', async () => {
      prisma.conversationUser.findUnique.mockResolvedValue(null);
      await expect(service.markConversationRead(user, 'c1')).rejects.toThrow('access denied');
      expect(prisma.message.updateMany).not.toHaveBeenCalled();
    });
  });
});
