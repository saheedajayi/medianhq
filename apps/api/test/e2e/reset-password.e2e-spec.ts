import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { PwnedPasswordService } from '../../src/modules/auth/pwned-password.service';
import { AuthRateLimiterService } from '../../src/modules/auth/auth-rate-limiter.service';
import { EmailService } from '../../src/modules/email/email.service';
import { SecurityAuditService } from '../../src/modules/auth/security-audit.service';
import type { Prisma } from '@prisma/client';

type TestUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: null;
  passwordHash: string;
  sessionVersion: number;
  emailVerifiedAt: Date;
  menteeProfile: null;
  mentorProfile: null;
};

type TestToken = {
  id: string;
  email: string;
  token: string;
  type: string;
  expiresAt: Date;
  createdAt: Date;
};

type AuthServiceInternal = {
  hashPassword(password: string): string;
};

type ResponseBody = {
  message?: string;
  success?: boolean;
  valid?: boolean;
};

describe('Password Reset Operations (e2e)', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let rateLimiterService: AuthRateLimiterService;

  const testEmail = 'reset-flow-test@example.com';
  const initialPassword = 'InitialPassword1!';
  const newPassword = 'NewSecretPassword2@';
  const compromisedPassword = 'CompromisedPassword1!';

  let mockUser: TestUser;
  const storedTokens = new Map<string, TestToken>();

  beforeAll(async () => {
    mockUser = {
      id: 'test-user-reset-e2e',
      email: testEmail,
      firstName: 'Reset',
      lastName: 'Tester',
      role: null,
      passwordHash: '',
      sessionVersion: 0,
      emailVerifiedAt: new Date(),
      menteeProfile: null,
      mentorProfile: null,
    };

    const mockAuthRepository = {
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === mockUser.id) {
          return Promise.resolve({ ...mockUser });
        }
        return Promise.resolve(null);
      }),
      findByEmail: jest.fn().mockImplementation((email: string) => {
        if (email.toLowerCase() === mockUser.email.toLowerCase()) {
          return Promise.resolve({ ...mockUser });
        }
        return Promise.resolve(null);
      }),
      findVerificationToken: jest.fn().mockImplementation((email: string) => {
        for (const token of storedTokens.values()) {
          if (token.email === email) {
            return Promise.resolve({ ...token });
          }
        }
        return Promise.resolve(null);
      }),
      findVerificationTokenByToken: jest
        .fn()
        .mockImplementation((token: string) => {
          const found = storedTokens.get(token);
          return Promise.resolve(found ? { ...found } : null);
        }),
      upsertVerificationToken: jest
        .fn()
        .mockImplementation(
          (data: Prisma.VerificationTokenUncheckedCreateInput) => {
            const record: TestToken = {
              id: `token-${Date.now()}`,
              email: data.email,
              token: data.token,
              type: data.type,
              expiresAt: new Date(data.expiresAt),
              createdAt: new Date(),
            };
            storedTokens.set(data.token, record);
            return Promise.resolve(record);
          },
        ),
      deleteVerificationToken: jest.fn().mockImplementation((id: string) => {
        for (const [key, value] of storedTokens.entries()) {
          if (value.id === id) {
            storedTokens.delete(key);
            break;
          }
        }
        return Promise.resolve(null);
      }),
      update: jest
        .fn()
        .mockImplementation((id: string, data: any) => {
          if (id !== mockUser.id) return Promise.resolve(null);
          if (
            typeof data.sessionVersion === 'object' &&
            data.sessionVersion &&
            'increment' in data.sessionVersion &&
            typeof data.sessionVersion.increment === 'number'
          ) {
            mockUser.sessionVersion += data.sessionVersion.increment;
          }
          if (typeof data.passwordHash === 'string') {
            mockUser.passwordHash = data.passwordHash;
          }
          return Promise.resolve({ ...mockUser });
        }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthRepository)
      .useValue(mockAuthRepository)
      .overrideProvider(PwnedPasswordService)
      .useValue({
        isCompromised: jest
          .fn()
          .mockImplementation((pw: string) =>
            Promise.resolve(pw === compromisedPassword),
          ),
      })
      .overrideProvider(EmailService)
      .useValue({
        sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
        sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(SecurityAuditService)
      .useValue({
        record: jest.fn().mockResolvedValue(undefined),
        getLogsForUser: jest.fn().mockResolvedValue([]),
        pruneOldLogs: jest.fn().mockResolvedValue(0),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = app.get(AuthService);
    rateLimiterService = app.get(AuthRateLimiterService);
    const authInternal = authService as unknown as AuthServiceInternal;
    mockUser.passwordHash = authInternal.hashPassword(initialPassword);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    rateLimiterService.clear();
  });

  it('keeps reset request responses generic to avoid account enumeration', async () => {
    const nonexistentResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(nonexistentResponse.status).toBe(201);
    expect(nonexistentResponse.body).toEqual({
      success: true,
      message: 'If the email exists, a reset link will be sent.',
    });

    const existingResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: testEmail });

    expect(existingResponse.status).toBe(201);
    expect(existingResponse.body).toEqual({
      success: true,
      message: 'If the email exists, a reset link will be sent.',
    });
  });

  it('enforces IP rate limiting on forgot-password', async () => {
    // Send 5 requests from the same IP (allowed limit)
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .set('X-Forwarded-For', '203.0.113.195')
        .send({ email: `test-${i}@example.com` });
    }

    // 6th attempt from the same IP is blocked with 429
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .set('X-Forwarded-For', '203.0.113.195')
      .send({ email: 'test-another@example.com' });

    expect(response.status).toBe(429);
    const body = response.body as ResponseBody;
    expect(body.message).toContain(
      'Too many password reset requests from this IP',
    );
  });

  it('validates reset tokens and enforces rate limits on validation attempts', async () => {
    // Insert a valid reset token
    const tokenStr = 'sample-valid-token-123';
    storedTokens.set(tokenStr, {
      id: 'token-rec-1',
      email: testEmail,
      token: tokenStr,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });

    // Valid token succeeds
    const validRes = await request(app.getHttpServer()).get(
      `/auth/reset-password/validate?token=${tokenStr}`,
    );
    expect(validRes.status).toBe(200);
    const validBody = validRes.body as ResponseBody;
    expect(validBody.valid).toBe(true);

    // Invalid token returns 400
    const invalidRes = await request(app.getHttpServer()).get(
      '/auth/reset-password/validate?token=non-existent-token',
    );
    expect(invalidRes.status).toBe(400);

    // Rate-limit validation requests from the same IP (>20 requests)
    for (let i = 0; i < 20; i++) {
      await request(app.getHttpServer())
        .get(`/auth/reset-password/validate?token=${tokenStr}`)
        .set('X-Forwarded-For', '203.0.113.88');
    }

    const rateLimitedRes = await request(app.getHttpServer())
      .get(`/auth/reset-password/validate?token=${tokenStr}`)
      .set('X-Forwarded-For', '203.0.113.88');
    expect(rateLimitedRes.status).toBe(429);
  });

  it('rejects expired, reused, and compromised passwords during reset submission', async () => {
    const expiredTokenStr = 'expired-token-xyz';
    storedTokens.set(expiredTokenStr, {
      id: 'token-rec-expired',
      email: testEmail,
      token: expiredTokenStr,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() - 60000), // Expired 1 min ago
      createdAt: new Date(),
    });

    // Expired token is rejected
    const expiredRes = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token: expiredTokenStr,
        password: newPassword,
      });
    expect(expiredRes.status).toBe(400);
    const expiredBody = expiredRes.body as ResponseBody;
    expect(expiredBody.message).toBe('Reset token has expired.');

    // Valid token can only be used once (single-use token deletion prevents replay)
    const activeTokenStr = 'active-single-use-token';
    storedTokens.set(activeTokenStr, {
      id: 'token-single-use',
      email: testEmail,
      token: activeTokenStr,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });

    // First use succeeds
    const firstUseRes = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token: activeTokenStr,
        password: newPassword,
      });
    expect(firstUseRes.status).toBe(201);

    // Replay attempt fails because token was deleted upon first use
    const replayRes = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        token: activeTokenStr,
        password: 'AnotherPassword3#',
      });
    expect(replayRes.status).toBe(400);
    const replayBody = replayRes.body as ResponseBody;
    expect(replayBody.message).toBe('Invalid or expired reset token.');
  });
});
