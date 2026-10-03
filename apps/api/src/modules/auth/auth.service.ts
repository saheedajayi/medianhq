import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { UserRole, type User } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { EmailService } from '../email/email.service';
import { getAccountStage } from './account-stage';
import { PwnedPasswordService } from './pwned-password.service';
import { AuthRateLimiterService } from './auth-rate-limiter.service';
import { SecurityAuditService } from './security-audit.service';
import type {
  AuthUser,
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

export type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export const AUTH_COOKIE_NAME = 'median_session';
export const REFRESH_COOKIE_NAME = 'median_refresh_token';
export const ACCESS_COOKIE_MAX_AGE_MS = 1000 * 60 * 15; // 15 mins
export const REFRESH_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Lifetime of a password-reset token (15 minutes).
 * Single-use and cryptographically random (256-bit entropy).
 */
export const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Cooldown between successive password-reset requests for the same account (60 seconds).
 */
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;

type AuthPayload = {
  sessionToken: string;
  refreshToken: string;
  user: AuthUser;
  emailSent: boolean;
};

type SessionPayload = {
  sub: string;
  sessionVersion: number;
  role?: UserRole;
  accountStage?: string;
  exp: number;
  type?: 'access' | 'refresh';
};

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15; // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PASSWORD_MIN_LENGTH = 8;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly pwnedPasswordService: PwnedPasswordService,
    private readonly rateLimiterService: AuthRateLimiterService,
    private readonly securityAuditService: SecurityAuditService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const input = await this.validateRegisterInput(dto);
    const existingUser = await this.authRepository.findIdByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('An account already exists for this email.');
    }

    const user = await this.authRepository.create({
      email: input.email,
      passwordHash: this.hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      ...(input.role && { role: input.role }),
    });

    let emailSent = true;
    try {
      await this.generateAndSendVerificationEmail(user);
    } catch (error) {
      emailSent = false;
      this.logger.error(
        `Failed to send verification email during registration for ${user.email}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return {
      sessionToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
      user: this.toAuthUser(user),
      emailSent,
    };
  }

  private async generateAndSendVerificationEmail(
    user: Pick<User, 'email' | 'firstName'>,
  ) {
    const code = randomInt(100000, 1000000).toString(); // 6 digits like '839201'

    await this.authRepository.upsertVerificationToken({
      email: user.email,
      token: code,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 mins
    });

    await this.emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationCode: code,
    });
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const input = this.validateLoginInput(dto);
    const user = await this.authRepository.findByEmail(input.email);

    if (
      !user ||
      !user.passwordHash ||
      !this.verifyPassword(input.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    let emailSent = true;
    if (!user.emailVerifiedAt) {
      try {
        await this.generateAndSendVerificationEmail(user);
      } catch (error) {
        emailSent = false;
        this.logger.error(
          `Failed to send verification email during login for ${user.email}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    return {
      sessionToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
      user: this.toAuthUser(user),
      emailSent,
    };
  }

  async getCurrentUser(sessionToken: string | undefined): Promise<AuthUser> {
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const payload = this.verifyToken(sessionToken);
    const user = await this.authRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return this.toAuthUser(user);
  }

  async oauthLogin(profile: any): Promise<AuthPayload> {
    const { providerId, email, firstName, lastName, provider } = profile;
    const normalizedEmail = email ? this.normalizeEmail(email) : undefined;

    // Check if user exists by OAuth ID
    let user = await this.authRepository.findByOAuthId(provider, providerId);

    if (!user) {
      // Check if user exists by email to link account
      if (normalizedEmail) {
        user = await this.authRepository.findByEmail(normalizedEmail);
      }

      if (user) {
        // Link OAuth ID to existing user
        const updateData =
          provider === 'google'
            ? { googleId: providerId }
            : { linkedinId: providerId };
        await this.authRepository.update(user.id, updateData);
        user = await this.authRepository.findById(user.id);
      } else {
        // Create new user without password and role
        const createData = {
          email: normalizedEmail || `${providerId}@${provider}.com`, // Fallback email
          firstName: firstName || 'User',
          lastName: lastName || '',
          emailVerifiedAt: new Date(), // Implicitly verified by OAuth
          [provider === 'google' ? 'googleId' : 'linkedinId']: providerId,
        };
        user = await this.authRepository.create(createData);
      }
    }

    return {
      sessionToken: this.signAccessToken(user!),
      refreshToken: this.signRefreshToken(user!),
      user: this.toAuthUser(user!),
      emailSent: true,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const normalizedCode = dto.code?.trim().toUpperCase();

    const tokenRecord = await this.authRepository.findVerificationToken(
      normalizedEmail,
      'EMAIL_VERIFICATION',
    );

    if (!tokenRecord || tokenRecord.token !== normalizedCode) {
      throw new BadRequestException('Invalid verification code.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired.');
    }

    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    await this.authRepository.update(user.id, {
      emailVerifiedAt: new Date(),
    });

    await this.authRepository.deleteVerificationToken(tokenRecord.id);

    const updatedUser = await this.authRepository.findById(user.id);
    if (!updatedUser) {
      throw new BadRequestException('User not found.');
    }

    return {
      sessionToken: this.signAccessToken(updatedUser),
      refreshToken: this.signRefreshToken(updatedUser),
      user: this.toAuthUser(updatedUser),
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);
    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      // Don't leak existence
      return { success: true, message: 'Verification code sent.' };
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified.');
    }

    await this.generateAndSendVerificationEmail(user);

    return { success: true, message: 'Verification code sent.' };
  }

  async forgotPassword(dto: ForgotPasswordDto, context?: AuthRequestContext) {
    const normalizedEmail = this.normalizeEmail(dto.email);

    // Account rate-limiting: max 5 requests per 15 minutes per account
    this.rateLimiterService.checkLimit(
      `forgot-account:${normalizedEmail}`,
      5,
      15 * 60 * 1000,
      'Too many password reset requests for this account. Please try again later.',
    );

    const user = await this.authRepository.findByEmail(normalizedEmail);
    if (!user) {
      // Do not leak user existence, record audit event
      await this.securityAuditService.record({
        email: normalizedEmail,
        action: 'RECOVERY_REQUEST',
        status: 'SUCCESS',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
      return {
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      };
    }

    // Cooldown check: prevent sending another reset email within 60s
    const existingToken = await this.authRepository.findVerificationToken(
      user.email,
      'PASSWORD_RESET',
    );
    if (
      existingToken &&
      Date.now() - new Date(existingToken.createdAt).getTime() < PASSWORD_RESET_COOLDOWN_MS
    ) {
      await this.securityAuditService.record({
        userId: user.id,
        email: user.email,
        action: 'RECOVERY_REQUEST',
        status: 'SUCCESS',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { throttled: true },
      });
      return {
        success: true,
        message: 'If the email exists, a reset link will be sent.',
      };
    }

    const token = randomBytes(32).toString('hex');
    await this.authRepository.upsertVerificationToken({
      email: user.email,
      token,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });

    await this.securityAuditService.record({
      userId: user.id,
      email: user.email,
      action: 'RECOVERY_REQUEST',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    const webOrigin = process.env.WEB_ORIGIN;
    if (!webOrigin) {
      throw new Error('WEB_ORIGIN environment variable is required.');
    }

    const resetLink = `${webOrigin}/reset-password/${token}`;

    try {
      await this.emailService.sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetLink,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email for ${user.email}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return {
      success: true,
      message: 'If the email exists, a reset link will be sent.',
    };
  }

  async validateResetToken(token: string, context?: AuthRequestContext) {
    const trimmedToken = token?.trim();
    if (!trimmedToken) {
      await this.securityAuditService.record({
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'missing_token' },
      });
      throw new BadRequestException('Reset token is required.');
    }

    const tokenRecord = await this.authRepository.findVerificationTokenByToken(
      trimmedToken,
      'PASSWORD_RESET',
    );

    if (!tokenRecord) {
      await this.securityAuditService.record({
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'invalid_or_used_token' },
      });
      throw new BadRequestException(
        'This password reset link is invalid or has already been used.',
      );
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.securityAuditService.record({
        email: tokenRecord.email,
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'expired_token' },
      });
      throw new BadRequestException(
        'This password reset link has expired. Please request a new one.',
      );
    }

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto, context?: AuthRequestContext) {
    const trimmedToken = dto.token?.trim();
    if (!trimmedToken) {
      await this.securityAuditService.record({
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'missing_token' },
      });
      throw new BadRequestException('Reset token is required.');
    }

    const tokenRecord = await this.authRepository.findVerificationTokenByToken(
      trimmedToken,
      'PASSWORD_RESET',
    );

    if (!tokenRecord) {
      await this.securityAuditService.record({
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'invalid_or_used_token' },
      });
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.securityAuditService.record({
        email: tokenRecord.email,
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'expired_token' },
      });
      throw new BadRequestException('Reset token has expired.');
    }

    const user = await this.authRepository.findByEmail(tokenRecord.email);
    if (!user) {
      await this.securityAuditService.record({
        email: tokenRecord.email,
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'user_not_found' },
      });
      throw new BadRequestException('User not found.');
    }

    const password = this.validatePassword(dto.password);
    await this.assertPasswordIsNotCompromised(password);

    if (user.passwordHash && this.verifyPassword(password, user.passwordHash)) {
      await this.securityAuditService.record({
        userId: user.id,
        email: user.email,
        action: 'FAILED_RECOVERY',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'password_reuse' },
      });
      throw new BadRequestException(
        'Your new password must be different from your current password.',
      );
    }

    const passwordHash = this.hashPassword(password);
    await this.authRepository.update(user.id, {
      passwordHash,
      sessionVersion: { increment: 1 },
    });
    await this.authRepository.deleteVerificationToken(tokenRecord.id);

    await this.securityAuditService.record({
      userId: user.id,
      email: user.email,
      action: 'PASSWORD_RESET',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    try {
      await this.emailService.sendPasswordChangedEmail({
        email: user.email,
        firstName: user.firstName,
        changedAt: new Date(),
        deviceInfo: context?.userAgent,
        ipAddress: context?.ipAddress,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password-changed email to ${user.email}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return { success: true, message: 'Password has been reset.' };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    context?: AuthRequestContext,
  ) {
    const user = await this.authRepository.findById(userId);
    if (!user?.passwordHash) {
      throw new BadRequestException(
        'Password changes are unavailable for this account.',
      );
    }

    const currentPassword = this.validateRequiredText(
      dto.currentPassword,
      'Current password',
    );
    if (!this.verifyPassword(currentPassword, user.passwordHash)) {
      await this.securityAuditService.record({
        userId: user.id,
        email: user.email,
        action: 'PASSWORD_CHANGE',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'wrong_current_password' },
      });
      throw new BadRequestException('Current password is incorrect.');
    }

    const password = this.validatePassword(dto.password);
    if (this.verifyPassword(password, user.passwordHash)) {
      await this.securityAuditService.record({
        userId: user.id,
        email: user.email,
        action: 'PASSWORD_CHANGE',
        status: 'FAILURE',
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason: 'password_reuse' },
      });
      throw new BadRequestException(
        'Your new password must be different from your current password.',
      );
    }
    await this.assertPasswordIsNotCompromised(password);

    await this.authRepository.update(user.id, {
      passwordHash: this.hashPassword(password),
      sessionVersion: { increment: 1 },
    });

    await this.securityAuditService.record({
      userId: user.id,
      email: user.email,
      action: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    try {
      await this.emailService.sendPasswordChangedEmail({
        email: user.email,
        firstName: user.firstName,
        changedAt: new Date(),
        deviceInfo: context?.userAgent,
        ipAddress: context?.ipAddress,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password-changed email to ${user.email}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return {
      success: true,
      message: 'Password changed. Please sign in again.',
    };
  }

  async revokeOtherSessions(
    userId: string,
    context?: AuthRequestContext,
  ): Promise<{
    sessionToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const updatedUser = await this.authRepository.update(userId, {
      sessionVersion: { increment: 1 },
    });

    await this.securityAuditService.record({
      userId: user.id,
      email: user.email,
      action: 'SESSIONS_REVOKED',
      status: 'SUCCESS',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return {
      sessionToken: this.signAccessToken(updatedUser),
      refreshToken: this.signRefreshToken(updatedUser),
      user: this.toAuthUser(updatedUser),
    };
  }

  async getSecurityEvents(userId: string) {
    return this.securityAuditService.getLogsForUser(userId);
  }

  private async validateRegisterInput(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const password = this.validatePassword(dto.password);
    await this.assertPasswordIsNotCompromised(password);
    const firstName = this.validateRequiredText(dto.firstName, 'First name');
    const lastName = this.validateRequiredText(dto.lastName, 'Last name');

    if (dto.role && !Object.values(UserRole).includes(dto.role)) {
      throw new BadRequestException('A valid role is required.');
    }

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin accounts cannot self-register.');
    }

    return {
      email,
      password,
      firstName,
      lastName,
      role: dto.role,
    };
  }

  private validateLoginInput(dto: LoginDto) {
    return {
      email: this.normalizeEmail(dto.email),
      password: this.validateRequiredText(dto.password, 'Password'),
    };
  }

  private normalizeEmail(email: string) {
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      throw new BadRequestException('Enter a valid email address.');
    }

    return normalizedEmail;
  }

  private validatePassword(password: string) {
    const normalizedPassword = this.validateRequiredText(password, 'Password');

    if (normalizedPassword.length < PASSWORD_MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
    }

    if (!/[A-Z]/.test(normalizedPassword)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter.',
      );
    }

    if (!/[a-z]/.test(normalizedPassword)) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter.',
      );
    }

    if (!/[0-9]/.test(normalizedPassword)) {
      throw new BadRequestException(
        'Password must contain at least one number.',
      );
    }

    if (!/[^A-Za-z0-9]/.test(normalizedPassword)) {
      throw new BadRequestException(
        'Password must contain at least one special character.',
      );
    }

    return normalizedPassword;
  }

  private async assertPasswordIsNotCompromised(password: string) {
    if (await this.pwnedPasswordService.isCompromised(password)) {
      throw new BadRequestException(
        'Choose a password that has not appeared in a data breach.',
      );
    }
  }

  private validateRequiredText(value: string, fieldName: string) {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return normalizedValue;
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');

    return `scrypt:${salt}:${hash}`;
  }

  private verifyPassword(password: string, passwordHash: string) {
    const [algorithm, salt, storedHash] = passwordHash.split(':');

    if (algorithm !== 'scrypt' || !salt || !storedHash) {
      return false;
    }

    const hash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      hash.length === storedHashBuffer.length &&
      timingSafeEqual(hash, storedHashBuffer)
    );
  }

  async refreshAccessToken(refreshToken: string | undefined): Promise<{
    sessionToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.sessionVersion !== payload.sessionVersion) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return {
      sessionToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
      user: this.toAuthUser(user),
    };
  }

  async issueTokensForUser(userId: string): Promise<{
    sessionToken: string;
    refreshToken: string;
    user: AuthUser;
  }> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return {
      sessionToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
      user: this.toAuthUser(user),
    };
  }

  setAuthCookies(
    response: Response,
    tokens: { sessionToken: string; refreshToken: string },
  ) {
    const options = this.getCookieOptions();

    response.cookie(AUTH_COOKIE_NAME, tokens.sessionToken, {
      ...options,
      maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    });

    response.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      ...options,
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  clearAuthCookies(response: Response) {
    const options = this.getCookieOptions();
    response.clearCookie(AUTH_COOKIE_NAME, options);
    response.clearCookie(REFRESH_COOKIE_NAME, options);
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      secure: isProduction,
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  private signToken(user: User) {
    return this.signAccessToken(user);
  }

  private signAccessToken(user: User, accountStage?: string) {
    const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS;
    const stage = accountStage || getAccountStage(user);
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        sessionVersion: user.sessionVersion,
        role: user.role,
        accountStage: stage,
        type: 'access',
        exp: expiresAt,
      }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', this.getTokenSecret())
      .update(payload)
      .digest('base64url');

    return `${payload}.${signature}`;
  }

  private signRefreshToken(user: User) {
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS;
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        sessionVersion: user.sessionVersion,
        type: 'refresh',
        exp: expiresAt,
      }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', this.getRefreshTokenSecret())
      .update(payload)
      .digest('base64url');

    return `${payload}.${signature}`;
  }

  private verifyRefreshToken(token: string): SessionPayload {
    const [payload, signature] = token.split('.');

    if (!payload || !signature) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const expectedSignature = createHmac('sha256', this.getRefreshTokenSecret())
      .update(payload)
      .digest('base64url');
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    let decodedPayload: Partial<SessionPayload>;

    try {
      decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as Partial<SessionPayload>;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const sessionVersion = decodedPayload.sessionVersion;

    if (
      !decodedPayload.sub ||
      typeof sessionVersion !== 'number' ||
      !Number.isInteger(sessionVersion) ||
      sessionVersion < 0 ||
      decodedPayload.type !== 'refresh' ||
      !decodedPayload.exp ||
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    return {
      sub: decodedPayload.sub,
      sessionVersion,
      exp: decodedPayload.exp,
      type: 'refresh',
    };
  }

  private verifyToken(token: string): SessionPayload {
    const [payload, signature] = token.split('.');

    if (!payload || !signature) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const expectedSignature = createHmac('sha256', this.getTokenSecret())
      .update(payload)
      .digest('base64url');
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Authentication is required.');
    }

    let decodedPayload: Partial<SessionPayload>;

    try {
      decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as Partial<SessionPayload>;
    } catch {
      throw new UnauthorizedException('Authentication is required.');
    }

    const sessionVersion = decodedPayload.sessionVersion;

    if (
      !decodedPayload.sub ||
      typeof sessionVersion !== 'number' ||
      !Number.isInteger(sessionVersion) ||
      sessionVersion < 0 ||
      (decodedPayload.role &&
        !Object.values(UserRole).includes(decodedPayload.role)) ||
      (decodedPayload.type && decodedPayload.type !== 'access') ||
      !decodedPayload.exp ||
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return {
      sub: decodedPayload.sub,
      sessionVersion,
      role: decodedPayload.role,
      accountStage: decodedPayload.accountStage,
      exp: decodedPayload.exp,
      type: 'access',
    };
  }

  private getTokenSecret() {
    return process.env.AUTH_TOKEN_SECRET ?? 'median-dev-auth-token-secret';
  }

  private getRefreshTokenSecret() {
    return (
      process.env.REFRESH_TOKEN_SECRET ??
      `${this.getTokenSecret()}_refresh_secret`
    );
  }

  private toAuthUser(user: any): AuthUser {
    const hasMenteeProfile = Boolean(user.menteeProfile);
    const isProfileComplete = Boolean(
      user.menteeProfile &&
      (user.menteeProfile.gender ||
        user.menteeProfile.location ||
        user.menteeProfile.bio),
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      hasMenteeProfile,
      hasMentorProfile: Boolean(user.mentorProfile),
      mentorStatus: user.mentorProfile?.status,
      accountStage: getAccountStage(user),
      createdAt: user.createdAt,
      isProfileComplete,
      menteeProfile: user.menteeProfile
        ? {
            gender: user.menteeProfile.gender,
            location: user.menteeProfile.location,
            bio: user.menteeProfile.bio,
            avatarUrl: user.menteeProfile.avatarUrl,
          }
        : null,
    };
  }
}
