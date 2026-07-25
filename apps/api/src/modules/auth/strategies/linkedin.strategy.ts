import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder-id',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder-secret',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') || 'http://localhost:4000/api/v1/auth/linkedin/callback',
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void): Promise<any> {
    const { id, name, emails } = profile;
    const user = {
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      provider: 'linkedin',
    };
    done(null, user);
  }
}
