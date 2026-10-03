import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { PwnedPasswordService } from '../../src/modules/auth/pwned-password.service';
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

type AuthServiceInternal = {
  hashPassword(password: string): string;
  signAccessToken(user: unknown): string;
};

type ResponseBody = {
  message?: string;
  success?: boolean;
  user?: { email: string };
  email?: string;
};

describe('Change Password Flow (e2e)', () => {
  let app: INestApplication<App>;
  let authService: AuthService;

  const testEmail = 'security-test@example.com';
  const initialPassword = 'InitialPassword1!';
  const newPassword = 'NewSecretPassword2@';
  const compromisedPassword = 'CompromisedPassword1!';

  let mockUser: TestUser;

  beforeAll(async () => {
    mockUser = {
      id: 'test-user-e2e',
      email: testEmail,
      firstName: 'Security',
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
      findIdByEmail: jest.fn().mockImplementation((email: string) => {
        if (email.toLowerCase() === mockUser.email.toLowerCase()) {
          return Promise.resolve({ id: mockUser.id });
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
          } else if (typeof data.sessionVersion === 'number') {
            mockUser.sessionVersion = data.sessionVersion;
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
        sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
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
    const authInternal = authService as unknown as AuthServiceInternal;
    mockUser.passwordHash = authInternal.hashPassword(initialPassword);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  function getInternal(): AuthServiceInternal {
    return authService as unknown as AuthServiceInternal;
  }

  it('rejects unauthenticated requests to change-password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .send({
        currentPassword: initialPassword,
        password: newPassword,
      });

    expect(response.status).toBe(401);
  });

  it('rejects wrong current password', async () => {
    const sessionToken = getInternal().signAccessToken(mockUser);

    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Cookie', [`median_session=${sessionToken}`])
      .send({
        currentPassword: 'WrongPassword999!',
        password: newPassword,
      });

    const body = response.body as ResponseBody;
    expect(response.status).toBe(400);
    expect(body.message).toBe('Current password is incorrect.');
    expect(mockUser.sessionVersion).toBe(0);
  });

  it('rejects reusing the current password', async () => {
    const sessionToken = getInternal().signAccessToken(mockUser);

    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Cookie', [`median_session=${sessionToken}`])
      .send({
        currentPassword: initialPassword,
        password: initialPassword,
      });

    const body = response.body as ResponseBody;
    expect(response.status).toBe(400);
    expect(body.message).toBe(
      'Your new password must be different from your current password.',
    );
    expect(mockUser.sessionVersion).toBe(0);
  });

  it('rejects a compromised password', async () => {
    const sessionToken = getInternal().signAccessToken(mockUser);

    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Cookie', [`median_session=${sessionToken}`])
      .send({
        currentPassword: initialPassword,
        password: compromisedPassword,
      });

    const body = response.body as ResponseBody;
    expect(response.status).toBe(400);
    expect(body.message).toBe(
      'Choose a password that has not appeared in a data breach.',
    );
    expect(mockUser.sessionVersion).toBe(0);
  });

  it('successfully changes password, clears session cookies, and invalidates existing sessions', async () => {
    const priorSessionVersion = mockUser.sessionVersion;
    const priorSessionToken = getInternal().signAccessToken(mockUser);

    // Verify session token works before change
    const meBefore = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', [`median_session=${priorSessionToken}`]);
    const meBeforeBody = meBefore.body as ResponseBody;
    expect(meBefore.status).toBe(200);
    expect(meBeforeBody.email).toBe(testEmail);

    // Change password
    const response = await request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Cookie', [`median_session=${priorSessionToken}`])
      .send({
        currentPassword: initialPassword,
        password: newPassword,
      });

    const body = response.body as ResponseBody;
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Password changed. Please sign in again.');

    // Verify sessionVersion incremented
    expect(mockUser.sessionVersion).toBe(priorSessionVersion + 1);

    // Verify cookies are cleared in the response
    const setCookieHeaders = response.headers['set-cookie'];
    expect(setCookieHeaders).toBeDefined();
    const cookieString = Array.isArray(setCookieHeaders)
      ? setCookieHeaders.join('; ')
      : setCookieHeaders;
    expect(cookieString).toContain('median_session=;');

    // Session invalidation: Prior session token must now be rejected
    const meAfter = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', [`median_session=${priorSessionToken}`]);
    expect(meAfter.status).toBe(401);

    // Login with old password must fail
    const oldLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: initialPassword,
      });
    expect(oldLoginResponse.status).toBe(401);

    // Login with new password must succeed
    const newLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: newPassword,
      });
    const newLoginBody = newLoginResponse.body as ResponseBody;
    expect(newLoginResponse.status).toBe(201);
    expect(newLoginBody.user?.email).toBe(testEmail);
  });
});
