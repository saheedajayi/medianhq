import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthRateLimiterService } from '../../identity/auth/auth-rate-limiter.service';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import type { AdminActor } from '../common/admin-actor';
import { AdminInvitesService } from './admin-invites.service';
import type {
  AcceptAdminInviteDto,
  CreateAdminInviteDto,
} from './dto/admin-invites.dto';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const clientIp = (request: Request) => {
  const forwarded = request.headers['x-forwarded-for'];
  return typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : request.ip || '127.0.0.1';
};

/** Sending and managing invites, for signed-in admins */
@Controller('admin/invites')
@UseGuards(AdminGuard)
@AdminSectionAccess('settings')
export class AdminInvitesController {
  constructor(private readonly invitesService: AdminInvitesService) {}

  @Get()
  list() {
    return this.invitesService.list();
  }

  @Post()
  create(@Body() dto: CreateAdminInviteDto, @CurrentUser() admin?: AdminActor) {
    return this.invitesService.create(dto, admin);
  }

  @Post(':inviteId/resend')
  resend(
    @Param('inviteId') inviteId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.invitesService.resend(inviteId, admin);
  }

  @Patch(':inviteId/revoke')
  revoke(
    @Param('inviteId') inviteId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.invitesService.revoke(inviteId, admin);
  }
}

/** Opening and accepting an invite, for the person invited, who has no account yet */
@Controller('admin-invites')
export class AdminInviteAcceptanceController {
  constructor(
    private readonly invitesService: AdminInvitesService,
    private readonly rateLimiter: AuthRateLimiterService,
  ) {}

  @Get(':token')
  getByToken(@Param('token') token: string, @Req() request: Request) {
    this.rateLimiter.checkLimit(
      `admin-invite-view:${clientIp(request)}`,
      20,
      FIFTEEN_MINUTES_MS,
      'Too many attempts. Please try again later.',
    );
    return this.invitesService.getByToken(token);
  }

  @Post(':token/accept')
  accept(
    @Param('token') token: string,
    @Body() dto: AcceptAdminInviteDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.rateLimiter.checkLimit(
      `admin-invite-accept:${clientIp(request)}`,
      5,
      FIFTEEN_MINUTES_MS,
      'Too many attempts. Please try again later.',
    );
    return this.invitesService.accept(token, dto, response);
  }
}
