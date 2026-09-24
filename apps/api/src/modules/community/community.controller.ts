import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  listPosts(@Query('category') category?: string) {
    return this.communityService.listPosts(category);
  }

  @Get('posts/:id')
  getPostDetails(@Param('id') id: string) {
    return this.communityService.getPostDetails(id);
  }

  @UseGuards(AuthGuard)
  @Post('posts')
  createPost(
    @CurrentUser() user: AuthUser,
    @Body() dto: { title: string; content: string; category?: string; tags?: string[] },
  ) {
    return this.communityService.createPost(user, dto);
  }

  @UseGuards(AuthGuard)
  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: AuthUser,
    @Param('id') postId: string,
    @Body('content') content: string,
  ) {
    return this.communityService.addComment(user, postId, content);
  }

  @UseGuards(AuthGuard)
  @Post('posts/:id/like')
  toggleLike(@CurrentUser() user: AuthUser, @Param('id') postId: string) {
    return this.communityService.toggleLike(user, postId);
  }
}
