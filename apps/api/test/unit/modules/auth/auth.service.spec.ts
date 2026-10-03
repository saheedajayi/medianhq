import { BadRequestException } from '@nestjs/common';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { AuthRepository } from '../../../../src/modules/auth/auth.repository';
import { EmailService } from '../../../../src/modules/email/email.service';
import { PwnedPasswordService } from '../../../../src/modules/auth/pwned-password.service';
import { AuthRateLimiterService } from '../../../../src/modules/auth/auth-rate-limiter.service';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let emailService: jest.Mocked<EmailService>;
  let pwnedPasswordService: jest.Mocked<PwnedPasswordService>;
  let rateLimiterService: AuthRateLimiterService;

  beforeEach(() => {
    authRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByOAuthId: jest.fn(),
      findIdByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsertVerificationToken: jest.fn(),
      findVerificationToken: jest.fn(),
      findVerificationTokenByToken: jest.fn(),
      deleteVerificationToken: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    emailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendPasswordChangedEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    pwnedPasswordService = {
      isCompromised: jest.fn().mockResolvedValue(false),
    };

    rateLimiterService = new AuthRateLimiterService();

    const securityAuditService = {
      record: jest.fn().mockResolvedValue(undefined),
      getLogsForUser: jest.fn().mockResolvedValue([]),
      pruneOldLogs: jest.fn().mockResolvedValue(0),
    } as any;

    authService = new AuthService(
      authRepository,
      emailService,
      pwnedPasswordService,
      rateLimiterService,
      securityAuditService,
    );
  });

  describe('validateResetToken', () => {
    it('throws BadRequestException if token is missing or empty', async () => {
      await expect(authService.validateResetToken('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if token is not found in database', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue(null);

      await expect(
        authService.validateResetToken('invalid-token'),
      ).rejects.toThrow(
        'This password reset link is invalid or has already been used.',
      );
    });

    it('throws BadRequestException if token has expired', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: 'user@example.com',
        token: 'expired-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() - 60000), // Expired 1 min ago
        createdAt: new Date(),
      } as any);

      await expect(
        authService.validateResetToken('expired-token'),
      ).rejects.toThrow(
        'This password reset link has expired. Please request a new one.',
      );
    });

    it('throws BadRequestException if token is whitespace only', async () => {
      await expect(authService.validateResetToken('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns { valid: true } if token is valid and not expired', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: 'user@example.com',
        token: 'valid-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60000), // Expires in 1 min
        createdAt: new Date(),
      } as any);

      const result = await authService.validateResetToken('valid-token');
      expect(result).toEqual({ valid: true });
    });
  });

  describe('forgotPassword', () => {
    it('returns uniform generic message if email does not exist', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      });
      expect(authRepository.upsertVerificationToken).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('generates token with 15-minute TTL and sends reset email for existing user', async () => {
      process.env.WEB_ORIGIN = 'https://app.medianhq.com';
      authRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
      } as any);
      authRepository.findVerificationToken.mockResolvedValue(null);

      const result = await authService.forgotPassword({
        email: 'john@example.com',
      });

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      });

      expect(authRepository.upsertVerificationToken).toHaveBeenCalledWith({
        email: 'john@example.com',
        token: expect.any(String),
        type: 'PASSWORD_RESET',
        expiresAt: expect.any(Date),
      });

      // Verify 15-minute TTL
      const upsertArgs = authRepository.upsertVerificationToken.mock.calls[0][0];
      const diffMs = new Date(upsertArgs.expiresAt).getTime() - Date.now();
      expect(diffMs).toBeGreaterThan(14 * 60 * 1000);
      expect(diffMs).toBeLessThanOrEqual(15 * 60 * 1000);

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
        resetLink: expect.stringContaining('https://app.medianhq.com/reset-password/'),
      });
    });

    it('respects 60-second cooldown and does not spam emails on rapid repeat requests', async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
      } as any);
      // Existing token issued 20 seconds ago
      authRepository.findVerificationToken.mockResolvedValue({
        id: 'existing-token',
        createdAt: new Date(Date.now() - 20000),
      } as any);

      const result = await authService.forgotPassword({
        email: 'john@example.com',
      });

      expect(result).toEqual({
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      });
      // Should not generate or send another email
      expect(authRepository.upsertVerificationToken).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('enforces account-level rate limiting after exceeding allowed requests', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      for (let i = 0; i < 5; i++) {
        await authService.forgotPassword({ email: 'spammer@example.com' });
      }

      // 6th attempt should be blocked with 429
      await expect(
        authService.forgotPassword({ email: 'spammer@example.com' }),
      ).rejects.toThrow('Too many password reset requests for this account. Please try again later.');
    });
  });

  describe('resetPassword', () => {
    it('increments the session version so existing sessions are invalidated', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: 'user@example.com',
        token: 'valid-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
      } as any);
      authRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        sessionVersion: 2,
      } as any);

      await authService.resetPassword({
        token: 'valid-token',
        password: 'ValidPassword1!',
      });

      expect(authRepository.update).toHaveBeenCalledWith('user-1', {
        passwordHash: expect.stringMatching(/^scrypt:/),
        sessionVersion: { increment: 1 },
      });
      // Verifies single-use deletion
      expect(authRepository.deleteVerificationToken).toHaveBeenCalledWith('token-1');
    });

    it('rejects a malformed or empty reset token', async () => {
      await expect(
        authService.resetPassword({
          token: '   ',
          password: 'ValidPassword1!',
        }),
      ).rejects.toThrow('Reset token is required.');
    });

    it('rejects an expired reset token', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-expired',
        email: 'user@example.com',
        token: 'expired-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() - 10000), // expired 10s ago
        createdAt: new Date(),
      } as any);

      await expect(
        authService.resetPassword({
          token: 'expired-token',
          password: 'ValidPassword1!',
        }),
      ).rejects.toThrow('Reset token has expired.');
    });

    it('rejects a reused or non-existent reset token', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword({
          token: 'reused-token',
          password: 'ValidPassword1!',
        }),
      ).rejects.toThrow('Invalid or expired reset token.');
    });

    it('rejects a password that matches the current password', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: 'user@example.com',
        token: 'valid-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
      } as any);
      authRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: (authService as any).hashPassword('ValidPassword1!'),
      } as any);

      await expect(
        authService.resetPassword({
          token: 'valid-token',
          password: 'ValidPassword1!',
        }),
      ).rejects.toThrow(
        'Your new password must be different from your current password.',
      );

      expect(authRepository.update).not.toHaveBeenCalled();
      expect(authRepository.deleteVerificationToken).not.toHaveBeenCalled();
    });

    it('rejects a compromised password', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: 'user@example.com',
        token: 'valid-token',
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
      } as any);
      authRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      } as any);
      pwnedPasswordService.isCompromised.mockResolvedValue(true);

      await expect(
        authService.resetPassword({
          token: 'valid-token',
          password: 'ValidPassword1!',
        }),
      ).rejects.toThrow(
        'Choose a password that has not appeared in a data breach.',
      );

      expect(authRepository.update).not.toHaveBeenCalled();
    });

    it.each([
      ['lowercase', 'validpassword1!'],
      ['uppercase', 'VALIDPASSWORD1!'],
      ['number', 'ValidPassword!'],
      ['special character', 'ValidPassword1'],
    ])(
      'rejects a password without a %s through the API',
      async (_, password) => {
        authRepository.findVerificationTokenByToken.mockResolvedValue({
          id: 'token-1',
          email: 'user@example.com',
          token: 'valid-token',
          type: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + 60000),
          createdAt: new Date(),
        } as any);
        authRepository.findByEmail.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
        } as any);

        await expect(
          authService.resetPassword({ token: 'valid-token', password }),
        ).rejects.toThrow(BadRequestException);

        expect(authRepository.update).not.toHaveBeenCalled();
      },
    );
  });

  describe('refreshAccessToken', () => {
    it('rejects a refresh token issued before the session version changed', async () => {
      const refreshToken = (authService as any).signRefreshToken({
        id: 'user-1',
        sessionVersion: 0,
      });
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        sessionVersion: 1,
      } as any);

      await expect(
        authService.refreshAccessToken(refreshToken),
      ).rejects.toThrow('Authentication is required.');
    });
  });

  describe('getCurrentUser', () => {
    it('rejects an access token issued before the session version changed', async () => {
      const accessToken = (authService as any).signAccessToken({
        id: 'user-1',
        sessionVersion: 0,
        role: null,
      });
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        sessionVersion: 1,
      } as any);

      await expect(authService.getCurrentUser(accessToken)).rejects.toThrow(
        'Authentication is required.',
      );
    });
  });

  describe('changePassword', () => {
    const currentPassword = 'CurrentPassword1!';

    it('requires the current password', async () => {
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        passwordHash: (authService as any).hashPassword(currentPassword),
      } as any);

      await expect(
        authService.changePassword('user-1', {
          currentPassword: 'IncorrectPassword1!',
          password: 'NewPassword1!',
        }),
      ).rejects.toThrow('Current password is incorrect.');

      expect(authRepository.update).not.toHaveBeenCalled();
    });

    it('rejects reusing the current password', async () => {
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        passwordHash: (authService as any).hashPassword(currentPassword),
      } as any);

      await expect(
        authService.changePassword('user-1', {
          currentPassword,
          password: currentPassword,
        }),
      ).rejects.toThrow(
        'Your new password must be different from your current password.',
      );

      expect(authRepository.update).not.toHaveBeenCalled();
    });

    it('rejects a compromised password', async () => {
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        passwordHash: (authService as any).hashPassword(currentPassword),
      } as any);
      pwnedPasswordService.isCompromised.mockResolvedValue(true);

      await expect(
        authService.changePassword('user-1', {
          currentPassword,
          password: 'PwnedPassword1!',
        }),
      ).rejects.toThrow(
        'Choose a password that has not appeared in a data breach.',
      );

      expect(authRepository.update).not.toHaveBeenCalled();
    });

    it('rejects password changes if account has no password set', async () => {
      authRepository.findById.mockResolvedValue({
        id: 'user-1',
        passwordHash: null,
      } as any);

      await expect(
        authService.changePassword('user-1', {
          currentPassword,
          password: 'NewPassword1!',
        }),
      ).rejects.toThrow('Password changes are unavailable for this account.');

      expect(authRepository.update).not.toHaveBeenCalled();
    });

    it('updates the password and invalidates every active session', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        passwordHash: (authService as any).hashPassword(currentPassword),
        sessionVersion: 1,
      };
      authRepository.findById.mockResolvedValue(user as any);

      const oldToken = (authService as any).signAccessToken(user);
      await expect(authService.getCurrentUser(oldToken)).resolves.toBeDefined();

      await expect(
        authService.changePassword('user-1', {
          currentPassword,
          password: 'NewPassword1!',
        }),
      ).resolves.toEqual({
        success: true,
        message: 'Password changed. Please sign in again.',
      });

      expect(authRepository.update).toHaveBeenCalledWith('user-1', {
        passwordHash: expect.stringMatching(/^scrypt:/),
        sessionVersion: { increment: 1 },
      });

      // Simulate session version increment in DB
      user.sessionVersion = 2;
      await expect(authService.getCurrentUser(oldToken)).rejects.toThrow(
        'Authentication is required.',
      );
    });
  });

  describe('oauthLogin', () => {
    it('normalizes email and links to existing user', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: null,
        emailVerifiedAt: new Date(),
        mentorProfile: null,
        menteeProfile: null,
      };

      authRepository.findByOAuthId.mockResolvedValue(null);
      authRepository.findByEmail.mockResolvedValue(existingUser as any);
      authRepository.findById.mockResolvedValue(existingUser as any);

      const profile = {
        providerId: 'google-123',
        email: 'John.Doe@Example.COM',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
      };

      const result = await authService.oauthLogin(profile);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
      expect(authRepository.update).toHaveBeenCalledWith('user-1', {
        googleId: 'google-123',
      });
      expect(result.user.email).toBe('john.doe@example.com');
    });
  });

  describe('revokeOtherSessions', () => {
    it('increments sessionVersion and issues new tokens for the current session', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: null,
        sessionVersion: 1,
        emailVerifiedAt: new Date(),
        mentorProfile: null,
        menteeProfile: null,
      };

      authRepository.findById.mockResolvedValue(user as any);
      authRepository.update.mockResolvedValue({
        ...user,
        sessionVersion: 2,
      } as any);

      const result = await authService.revokeOtherSessions('user-1', {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });

      expect(authRepository.update).toHaveBeenCalledWith('user-1', {
        sessionVersion: { increment: 1 },
      });
      expect(result.sessionToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe('user-1');
    });
  });

  describe('notification failure resilience', () => {
    it('completes changePassword successfully even if email sending fails', async () => {
      const currentPassword = 'CurrentPassword1!';
      const newPassword = 'NewSecretPassword2@';
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: null,
        sessionVersion: 1,
        passwordHash: '',
        emailVerifiedAt: new Date(),
        mentorProfile: null,
        menteeProfile: null,
      };
      user.passwordHash = (authService as any).hashPassword(currentPassword);

      authRepository.findById.mockResolvedValue(user as any);
      authRepository.update.mockResolvedValue({ ...user, sessionVersion: 2 } as any);
      emailService.sendPasswordChangedEmail.mockRejectedValue(
        new Error('Resend provider outage'),
      );

      const result = await authService.changePassword('user-1', {
        currentPassword,
        password: newPassword,
      });

      expect(result.success).toBe(true);
      expect(authRepository.update).toHaveBeenCalled();
    });

    it('completes resetPassword successfully even if email sending fails', async () => {
      const token = 'valid-token';
      const newPassword = 'BrandNewPassword1!';
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: null,
        sessionVersion: 1,
        passwordHash: (authService as any).hashPassword('OldPassword1!'),
        emailVerifiedAt: new Date(),
        mentorProfile: null,
        menteeProfile: null,
      };

      authRepository.findVerificationTokenByToken.mockResolvedValue({
        id: 'token-1',
        email: user.email,
        token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
      } as any);
      authRepository.findByEmail.mockResolvedValue(user as any);
      authRepository.update.mockResolvedValue({ ...user, sessionVersion: 2 } as any);
      authRepository.deleteVerificationToken.mockResolvedValue({} as any);
      emailService.sendPasswordChangedEmail.mockRejectedValue(
        new Error('Network error sending email'),
      );

      const result = await authService.resetPassword({
        token,
        password: newPassword,
      });

      expect(result.success).toBe(true);
      expect(authRepository.update).toHaveBeenCalled();
      expect(authRepository.deleteVerificationToken).toHaveBeenCalledWith('token-1');
    });
  });
});

