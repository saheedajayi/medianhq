import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
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
