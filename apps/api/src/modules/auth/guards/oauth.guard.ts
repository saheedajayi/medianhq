import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId || clientId === 'placeholder-id') {
      const res = context.switchToHttp().getResponse<Response>();
      const baseUrl =
        this.configService.get<string>('WEB_ORIGIN') || 'http://localhost:3000';
      res.redirect(
        `${baseUrl}/signin?error=${encodeURIComponent(
          'Google authentication is not configured yet.',
        )}`,
      );
      return false;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Google authentication failed.',
        )
      );
    }
    return user;
  }
}

@Injectable()
export class LinkedInOAuthGuard extends AuthGuard('linkedin') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    if (!clientId || clientId === 'placeholder-id') {
      const res = context.switchToHttp().getResponse<Response>();
      const baseUrl =
        this.configService.get<string>('WEB_ORIGIN') || 'http://localhost:3000';
      res.redirect(
        `${baseUrl}/signin?error=${encodeURIComponent(
          'LinkedIn authentication is not configured yet.',
        )}`,
      );
      return false;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'LinkedIn authentication failed.',
        )
      );
    }
    return user;
  }
}
