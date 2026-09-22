import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type {
  AuthUser,
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const AUTH_COOKIE_NAME = 'median_session';
const REFRESH_COOKIE_NAME = 'median_refresh_token';
const ACCESS_COOKIE_MAX_AGE_MS = 1000 * 60 * 15; // 15 mins
const REFRESH_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.register(dto);

    this.setAuthCookies(response, payload);

    return {
      user: payload.user,
      emailSent: payload.emailSent,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.login(dto);

    this.setAuthCookies(response, payload);

    return {
      user: payload.user,
      emailSent: payload.emailSent,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.getCookieValue(
      request.headers.cookie,
      REFRESH_COOKIE_NAME,
    );
    const result = await this.authService.refreshAccessToken(refreshToken);

    this.setAuthCookies(response, {
      sessionToken: result.sessionToken,
      refreshToken: result.refreshToken,
    });

    return {
      user: result.user,
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
    this.clearAuthCookies(response);

    return {
      message: 'Logged out.',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const payload = await this.authService.oauthLogin(req.user);
    this.setAuthCookies(res, payload);

    const baseUrl = process.env.WEB_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${baseUrl}${this.getDestination(payload.user)}`);
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {
    // Initiates LinkedIn OAuth
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthRedirect(@Req() req: any, @Res() res: Response) {
    const payload = await this.authService.oauthLogin(req.user);
    this.setAuthCookies(res, payload);

    const baseUrl = process.env.WEB_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${baseUrl}${this.getDestination(payload.user)}`);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.verifyEmail(dto);
    this.setAuthCookies(response, payload);

    return { user: payload.user };
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

  private setAuthCookies(
    response: Response,
    tokens: { sessionToken: string; refreshToken: string },
  ) {
    const options = this.getCookieOptions();

    response.cookie(AUTH_COOKIE_NAME, tokens.sessionToken, {
      ...options,
      maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    });

    response.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      ...options,
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(response: Response) {
    const options = this.getCookieOptions();
    response.clearCookie(AUTH_COOKIE_NAME, options);
    response.clearCookie(REFRESH_COOKIE_NAME, options);
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      secure: isProduction,
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
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

  private getDestination(user: AuthUser) {
    switch (user.accountStage) {
      case 'EMAIL_VERIFICATION':
        return `/email-verification?email=${encodeURIComponent(user.email)}`;
      case 'ROLE_SELECTION':
        return '/role-selection';
      case 'MENTEE_ONBOARDING':
        return '/mentee-onboarding';
      case 'MENTOR_ONBOARDING':
        return '/mentor-onboarding';
      case 'MENTOR_PENDING':
        return '/mentor-submitted';
      case 'READY':
        return '/dashboard';
    }
  }
}
