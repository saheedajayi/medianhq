import { Injectable } from '@nestjs/common';
import type { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  create(dto: CreateReviewDto) {
    return {
      status: 'PENDING_IMPLEMENTATION',
      review: dto,
    };
  }
}
