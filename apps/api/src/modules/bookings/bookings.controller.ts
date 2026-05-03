import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('me')
  mine() {
    return this.bookingsService.mine();
  }
}
