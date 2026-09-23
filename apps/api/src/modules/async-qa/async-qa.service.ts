import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class AsyncQaService {
  constructor(private readonly prisma: PrismaService) {}

  async listQuestions(user: AuthUser) {
    return this.prisma.question.findMany({
      where: {
        OR: [{ authorId: user.id }, { mentorId: user.id }],
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        mentor: { select: { id: true, firstName: true, lastName: true } },
        answers: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async askQuestion(user: AuthUser, dto: { mentorId: string; title: string; content: string }) {
    if (!dto.mentorId || !dto.title || !dto.content) {
      throw new BadRequestException('mentorId, title, and content are required.');
    }

    return this.prisma.question.create({
      data: {
        authorId: user.id,
        mentorId: dto.mentorId,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async answerQuestion(user: AuthUser, questionId: string, content: string) {
    if (!content) {
      throw new BadRequestException('Answer content cannot be empty.');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID '${questionId}' not found.`);
    }

    return this.prisma.answer.create({
      data: {
        questionId,
        authorId: user.id,
        content,
      },
    });
  }
}
