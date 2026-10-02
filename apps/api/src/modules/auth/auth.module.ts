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
  ],
  exports: [AuthService],
})
export class AuthModule {}
