import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { AvailabilityDto, CreateMentorSessionDto, UpdateMentorSessionDto } from './dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}
  @UseGuards(AuthGuard) @Get('mentor') list(@CurrentUser() user: AuthUser) { return this.sessionsService.list(user); }
  @UseGuards(AuthGuard) @Post('mentor') create(@CurrentUser() user: AuthUser, @Body() dto: CreateMentorSessionDto) { return this.sessionsService.create(user, dto); }
  @UseGuards(AuthGuard) @Get('mentor/availability') availability(@CurrentUser() user: AuthUser) { return this.sessionsService.availability(user); }
  @UseGuards(AuthGuard) @Put('mentor/availability') saveAvailability(@CurrentUser() user: AuthUser, @Body() slots: AvailabilityDto[]) { return this.sessionsService.saveAvailability(user, slots); }
  @UseGuards(AuthGuard) @Patch('mentor/:id') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMentorSessionDto) { return this.sessionsService.update(user, id, dto); }
  @UseGuards(AuthGuard) @Delete('mentor/:id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.sessionsService.remove(user, id); }
  @Patch(':bookingId/complete') complete(@Param('bookingId') bookingId: string) { return this.sessionsService.complete(bookingId); }
}
