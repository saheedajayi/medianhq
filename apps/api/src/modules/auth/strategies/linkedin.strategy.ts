import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('LINKEDIN_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email'],
    });
  }

  userProfile(accessToken: string, done: (err?: any, profile?: any) => void) {
    (this as any)._oauth2.get(
      'https://api.linkedin.com/v2/userinfo',
      accessToken,
      (err: any, body: any) => {
        if (err) {
          return done(err);
        }

        try {
          const json = typeof body === 'string' ? JSON.parse(body) : body;
          const profile = {
            provider: 'linkedin',
            id: json.sub,
            displayName: json.name,
            name: {
              givenName: json.given_name,
              familyName: json.family_name,
            },
            emails: json.email ? [{ value: json.email }] : [],
            photos: json.picture ? [{ value: json.picture }] : [],
            _raw: body,
            _json: json,
          };
          done(null, profile);
        } catch (e) {
          done(e);
        }
      },
    );
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any, info?: any) => void): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      avatarUrl: photos?.[0]?.value,
      provider: 'linkedin',
    };
    done(null, user);
  }
}
