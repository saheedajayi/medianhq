import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AccountService } from './account.service';
import type { DeleteAccountDto } from './dto/account.dto';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Post('deactivate')
  async deactivate(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.accountService.deactivate(user);
    this.authService.clearAuthCookies(response);
    return result;
  }

  /** Starts the grace period. The session stays so the person can still change their mind. */
  @Post('delete')
  scheduleDeletion(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.accountService.scheduleDeletion(user, dto);
  }

  /** "Confirm deletion": signs the account out everywhere and leaves the deletion scheduled */
  @Post('delete/confirm')
  async confirmDeletion(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.accountService.confirmDeletion(user);
    this.authService.clearAuthCookies(response);
    return result;
  }

  @Post('delete/cancel')
  cancelDeletion(@CurrentUser() user: AuthUser) {
    return this.accountService.cancelDeletion(user);
  }
}
