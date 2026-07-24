import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto, VerifyEmailDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

const AUTH_COOKIE_NAME = 'median_session';
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.register(dto);

    this.setAuthCookie(response, payload.sessionToken);

    return {
      user: payload.user,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.login(dto);

    this.setAuthCookie(response, payload.sessionToken);

    return {
      user: payload.user,
    };
  }

  @Get('me')
  me(@Req() request: Request) {
    return this.authService.getCurrentUser(
      this.getCookieValue(request.headers.cookie, AUTH_COOKIE_NAME),
    );
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, this.getCookieOptions());

    return {
      message: 'Logged out.',
    };
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setAuthCookie(response: Response, sessionToken: string) {
    response.cookie(AUTH_COOKIE_NAME, sessionToken, {
      ...this.getCookieOptions(),
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  private getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return undefined;
    }

    return cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.slice(name.length + 1)
      .trim();
  }
}
