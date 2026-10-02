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
    fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          return done(
            new Error(`LinkedIn userinfo error ${res.status}: ${text}`),
          );
        }
        const json = await res.json();
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
          _raw: JSON.stringify(json),
          _json: json,
        };
        done(null, profile);
      })
      .catch((err: Error) => done(err));
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
