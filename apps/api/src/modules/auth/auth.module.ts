import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { EmailModule } from '../email/email.module';

import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { GoogleOAuthGuard, LinkedInOAuthGuard } from './guards/oauth.guard';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';
import { PwnedPasswordService } from './pwned-password.service';
import { AuthRateLimiterService } from './auth-rate-limiter.service';
import { SecurityAuditService } from './security-audit.service';

@Global()
@Module({
  imports: [EmailModule, PassportModule.register({ session: false })],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    GoogleStrategy,
    LinkedInStrategy,
    GoogleOAuthGuard,
    LinkedInOAuthGuard,
    OAuthExceptionFilter,
    PwnedPasswordService,
    AuthRateLimiterService,
    SecurityAuditService,
  ],
  exports: [AuthService, AuthRateLimiterService, SecurityAuditService],
})
export class AuthModule {}
