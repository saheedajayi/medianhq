import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateReviewDto) {
    if (!dto.bookingId) {
      throw new BadRequestException('bookingId is required.');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${dto.bookingId}' not found.`);
    }

    if (booking.menteeId !== user.id) {
      throw new ForbiddenException('Only the mentee on this booking can write a review.');
    }

    const review = await this.prisma.review.upsert({
      where: { bookingId: dto.bookingId },
      create: {
        bookingId: dto.bookingId,
        authorId: user.id,
        rating: Number(dto.rating) || 5,
        comment: dto.comment || '',
        npsScore: typeof dto.npsScore === 'number' ? dto.npsScore : null,
      },
      update: {
        rating: Number(dto.rating) || 5,
        comment: dto.comment || '',
        npsScore: typeof dto.npsScore === 'number' ? dto.npsScore : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Mark booking as completed if not already
    if (booking.status !== BookingStatus.COMPLETED) {
      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: { status: BookingStatus.COMPLETED },
      });
    }

    return {
      success: true,
      review,
    };
  }

  async findByMentor(mentorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        booking: {
          OR: [{ mentorId }, { mentor: { mentorProfile: { id: mentorId } } }],
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const count = reviews.length;
    const avgRating =
      count > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
        : 5.0;

    return {
      count,
      avgRating,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        authorName: `${r.author.firstName} ${r.author.lastName}`.trim(),
        authorAvatar: `https://i.pravatar.cc/150?u=${r.author.id}`,
        createdAt: r.createdAt,
      })),
    };
  }
}
