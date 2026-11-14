import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthRateLimiterService } from '../../identity/auth/auth-rate-limiter.service';
import { AnalyticsTrackerService } from './analytics-tracker.service';
import {
  BEACON_EVENT_TYPES,
  type AnalyticsBeaconDto,
  type BeaconEventType,
} from './dto/analytics.dto';

const BEACON_LIMIT = 120;
const BEACON_WINDOW_MS = 60 * 1000;

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly tracker: AnalyticsTrackerService,
    private readonly rateLimiter: AuthRateLimiterService,
  ) {}

  /** Page views and booking clicks reported by the web app; open to signed-out visitors */
  @Post('events')
  @HttpCode(202)
  beacon(
    @Req() request: Request,
    @Ip() ip: string,
    @Body() dto: AnalyticsBeaconDto,
  ) {
    this.rateLimiter.checkLimit(
      `analytics:${ip}`,
      BEACON_LIMIT,
      BEACON_WINDOW_MS,
    );

    const type = BEACON_EVENT_TYPES.find((value) => value === dto?.type);
    if (!type) throw new BadRequestException('Unknown event type.');
    const path = typeof dto.path === 'string' ? dto.path : null;
    if (path !== null && !path.startsWith('/')) {
      throw new BadRequestException('path must start with /.');
    }
    const mentorId = typeof dto.mentorId === 'string' ? dto.mentorId : null;
    if (type === ('BOOK_CLICK' satisfies BeaconEventType) && !mentorId) {
      throw new BadRequestException('mentorId is required.');
    }

    this.tracker.track(request, { type, path, mentorId });
    return { received: true };
  }
}
