import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  BookingsService,
  type ExtendedCreateBookingDto,
  type MenteeFeedbackDto,
} from './bookings.service';
import { BookingEventsService } from '../booking-notifications/booking-events.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly bookingEvents: BookingEventsService,
  ) {}

  /** Stays open and says when this user's bookings change, so pages needn't poll */
  @UseGuards(AuthGuard)
  @Sse('events')
  events(@CurrentUser() user: AuthUser) {
    return this.bookingEvents.streamFor(user.id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: ExtendedCreateBookingDto) {
    return this.bookingsService.create(user, dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.bookingsService.mine(user);
  }

  /** Bookable start times for a mentor over the next two weeks */
  @UseGuards(AuthGuard)
  @Get('availability/:mentorId')
  availability(
    @Param('mentorId') mentorId: string,
    @Query('duration') duration?: string,
    @Query('excludeBookingId') excludeBookingId?: string,
  ) {
    return this.bookingsService.getAvailableDays({
      mentorId,
      durationMinutes: duration ? Number(duration) : undefined,
      excludeBookingId,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getById(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bookingsService.getById(user, id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.cancel(user, id, reason);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/reschedule')
  reschedule(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('startsAt') startsAt: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.reschedule(user, id, startsAt, reason);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/accept')
  accept(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bookingsService.accept(user, id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/decline')
  decline(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.decline(user, id, reason);
  }

  /** The mentor's review of the mentee, with action items and follow-up notes */
  @UseGuards(AuthGuard)
  @Post(':id/feedback')
  submitFeedback(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MenteeFeedbackDto,
  ) {
    return this.bookingsService.submitFeedback(user, id, dto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/room-token')
  getRoomToken(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bookingsService.getRoomToken(user, id);
  }
}
