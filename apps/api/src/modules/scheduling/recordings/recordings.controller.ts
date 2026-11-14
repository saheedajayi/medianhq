import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../../identity/auth/guards/auth.guard';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import type { RecordingConsentDto } from './dto/recordings.dto';
import { RecordingsService } from './recordings.service';

@Controller()
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @UseGuards(AuthGuard)
  @Get('bookings/:id/recording')
  status(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recordingsService.getStatus(user, id);
  }

  @UseGuards(AuthGuard)
  @Patch('bookings/:id/recording-consent')
  setConsent(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RecordingConsentDto,
  ) {
    return this.recordingsService.setConsent(user, id, dto);
  }

  // Only LiveKit can call this: the service checks its signed token over the body
  @Post('livekit/webhook')
  webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('authorization') authorization?: string,
  ) {
    return this.recordingsService.handleWebhook(
      request.rawBody?.toString('utf8') ?? '',
      authorization,
    );
  }
}
