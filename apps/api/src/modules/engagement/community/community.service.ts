import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { ContentScannerService } from '../../platform/moderation/content-scanner.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentScanner: ContentScannerService,
  ) {}

  async listPosts(category?: string) {
    const where = {
      ...(category && category !== 'All' && { category }),
      // A deactivated or leaving account's posts stay hidden until it comes back
      author: { deactivatedAt: null, deletionScheduledFor: null },
    };
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
        role:
          p.author.mentorProfile?.jobTitle ||
          p.author.menteeProfile?.currentRole ||
          'Member',
      },
      commentCount: p._count.comments,
      likeCount: p._count.likes,
    }));
  }

  async createPost(
    user: AuthUser,
    dto: { title: string; content: string; category?: string; tags?: string[] },
  ) {
    if (!dto.title || !dto.content) {
      throw new BadRequestException('title and content are required.');
    }

    const post = await this.prisma.communityPost.create({
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
    this.contentScanner.scan({
      contentType: 'FORUM_POST',
      contentId: post.id,
      contentField: 'Post',
      content: `${post.title}\n${post.content}`,
      authorId: user.id,
    });
    return post;
  }

  async getPostDetails(id: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        comments: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
          },
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

    const comment = await this.prisma.communityComment.create({
      data: {
        postId,
        authorId: user.id,
        content,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    this.contentScanner.scan({
      contentType: 'FORUM_POST',
      contentId: comment.id,
      contentField: 'Comment',
      content: comment.content,
      authorId: user.id,
    });
    return comment;
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
