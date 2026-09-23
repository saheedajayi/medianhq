import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async listPosts(category?: string) {
    const where = category && category !== 'All' ? { category } : {};
    const posts = await this.prisma.communityPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mentorProfile: true,
            menteeProfile: true,
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      tags: p.tags,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: `${p.author.firstName} ${p.author.lastName}`.trim(),
        avatar: `https://i.pravatar.cc/150?u=${p.author.id}`,
        role: p.author.mentorProfile?.jobTitle || p.author.menteeProfile?.currentRole || 'Member',
      },
      commentCount: p._count.comments,
      likeCount: p._count.likes,
    }));
  }

  async createPost(user: AuthUser, dto: { title: string; content: string; category?: string; tags?: string[] }) {
    if (!dto.title || !dto.content) {
      throw new BadRequestException('title and content are required.');
    }

    return this.prisma.communityPost.create({
      data: {
        authorId: user.id,
        title: dto.title,
        content: dto.content,
        category: dto.category || 'General',
        tags: dto.tags || [],
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getPostDetails(id: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID '${id}' not found.`);
    }

    return post;
  }

  async addComment(user: AuthUser, postId: string, content: string) {
    if (!content) {
      throw new BadRequestException('Comment content cannot be empty.');
    }

    return this.prisma.communityComment.create({
      data: {
        postId,
        authorId: user.id,
        content,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async toggleLike(user: AuthUser, postId: string) {
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await this.prisma.postLike.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    }

    await this.prisma.postLike.create({
      data: { postId, userId: user.id },
    });
    return { liked: true };
  }
}
