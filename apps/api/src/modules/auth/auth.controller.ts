import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard, LinkedInOAuthGuard } from './guards/oauth.guard';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';
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
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from './auth.service';

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
  @UseGuards(GoogleOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async googleAuth() {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const payload = await this.authService.oauthLogin(req.user);
    this.setAuthCookies(res, payload);

    const baseUrl = process.env.WEB_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${baseUrl}${this.getDestination(payload.user)}`);
  }

  @Get('linkedin')
  @UseGuards(LinkedInOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  async linkedinAuth() {
    // Initiates LinkedIn OAuth
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedInOAuthGuard)
  @UseFilters(OAuthExceptionFilter)
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

  @Get('reset-password/validate')
  validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setAuthCookies(
    response: Response,
    tokens: { sessionToken: string; refreshToken: string },
  ) {
    this.authService.setAuthCookies(response, tokens);
  }

  private clearAuthCookies(response: Response) {
    this.authService.clearAuthCookies(response);
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
      case 'READY':
        return '/dashboard';
    }
  }
}
