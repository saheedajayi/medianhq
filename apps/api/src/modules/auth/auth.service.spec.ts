import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let emailService: jest.Mocked<EmailService>;

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
    } as unknown as jest.Mocked<EmailService>;

    authService = new AuthService(authRepository, emailService);
  });

  describe('validateResetToken', () => {
    it('throws BadRequestException if token is missing or empty', async () => {
      await expect(authService.validateResetToken('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if token is not found in database', async () => {
      authRepository.findVerificationTokenByToken.mockResolvedValue(null);

      await expect(authService.validateResetToken('invalid-token')).rejects.toThrow(
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

      await expect(authService.validateResetToken('expired-token')).rejects.toThrow(
        'This password reset link has expired. Please request a new one.',
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

      expect(authRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(authRepository.update).toHaveBeenCalledWith('user-1', {
        googleId: 'google-123',
      });
      expect(result.user.email).toBe('john.doe@example.com');
    });
  });
});
