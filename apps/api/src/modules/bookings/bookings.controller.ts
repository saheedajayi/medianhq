import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookingsService, type ExtendedCreateBookingDto } from './bookings.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

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
  ) {
    return this.bookingsService.reschedule(user, id, startsAt);
  }
}
