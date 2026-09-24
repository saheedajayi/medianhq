import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user, dto);
  }

  @Get('mentor/:mentorId')
  findByMentor(@Param('mentorId') mentorId: string) {
    return this.reviewsService.findByMentor(mentorId);
  }
}
