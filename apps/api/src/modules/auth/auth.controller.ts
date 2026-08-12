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
      emailSent: payload.emailSent,
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
      emailSent: payload.emailSent,
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const payload = await this.authService.oauthLogin(req.user);
    this.setAuthCookie(res, payload.sessionToken);

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
    this.setAuthCookie(res, payload.sessionToken);

    const baseUrl = process.env.WEB_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${baseUrl}${this.getDestination(payload.user)}`);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.verifyEmail(dto);
    this.setAuthCookie(response, payload.sessionToken);

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

  private setAuthCookie(response: Response, sessionToken: string) {
    response.cookie(AUTH_COOKIE_NAME, sessionToken, {
      ...this.getCookieOptions(),
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      secure: isProduction,
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
