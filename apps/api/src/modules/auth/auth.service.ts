import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { UserRole, type User } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { EmailService } from '../email/email.service';
import type { AuthUser, LoginDto, RegisterDto, VerifyEmailDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

type AuthPayload = {
  sessionToken: string;
  user: AuthUser;
  emailSent: boolean;
};

type SessionPayload = {
  sub: string;
  role: UserRole;
  exp: number;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_MIN_LENGTH = 8;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const input = this.validateRegisterInput(dto);
    const existingUser = await this.authRepository.findIdByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('An account already exists for this email.');
    }

    const user = await this.authRepository.create({
      email: input.email,
      passwordHash: this.hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
    });

    let emailSent = true;
    try {
      await this.generateAndSendVerificationEmail(user);
    } catch (error) {
      emailSent = false;
      this.logger.error(`Failed to send verification email during registration for ${user.email}`, error instanceof Error ? error.stack : error);
    }

    return {
      sessionToken: this.signToken(user),
      user: this.toAuthUser(user),
      emailSent,
    };
  }

  private async generateAndSendVerificationEmail(user: Pick<User, 'email' | 'firstName'>) {
    const code = randomBytes(3).toString('hex').toUpperCase(); // 6 chars like A1B2C3
    
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

    if (!user || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    let emailSent = true;
    if (!user.emailVerifiedAt) {
      try {
        await this.generateAndSendVerificationEmail(user);
      } catch (error) {
        emailSent = false;
        this.logger.error(`Failed to send verification email during login for ${user.email}`, error instanceof Error ? error.stack : error);
      }
    }

    return {
      sessionToken: this.signToken(user),
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

    return this.toAuthUser(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenRecord = await this.authRepository.findVerificationToken(
      dto.email,
      'EMAIL_VERIFICATION',
    );

    if (!tokenRecord || tokenRecord.token !== dto.code) {
      throw new BadRequestException('Invalid verification code.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired.');
    }

    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    await this.authRepository.update(user.id, {
      emailVerifiedAt: new Date(),
    });

    await this.authRepository.deleteVerificationToken(tokenRecord.id);

    return { success: true, message: 'Email verified successfully.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.authRepository.findByEmail(dto.email);
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      // Do not leak user existence
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
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    });

    const resetLink = `${process.env.WEB_ORIGIN || 'http://localhost:3000'}/reset-password/${token}`;

    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetLink,
    });

    return {
      success: true,
      message: 'If the email exists, a reset link will be sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.authRepository.findVerificationTokenByToken(
      dto.token,
      'PASSWORD_RESET',
    );

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired.');
    }

    const user = await this.authRepository.findByEmail(tokenRecord.email);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const passwordHash = this.hashPassword(this.validatePassword(dto.password));
    await this.authRepository.update(user.id, { passwordHash });
    await this.authRepository.deleteVerificationToken(tokenRecord.id);

    return { success: true, message: 'Password has been reset.' };
  }

  private validateRegisterInput(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const password = this.validatePassword(dto.password);
    const firstName = this.validateRequiredText(dto.firstName, 'First name');
    const lastName = this.validateRequiredText(dto.lastName, 'Last name');

    if (!Object.values(UserRole).includes(dto.role)) {
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

    return normalizedPassword;
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

  private signToken(user: User) {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        role: user.role,
        exp: expiresAt,
      }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', this.getTokenSecret())
      .update(payload)
      .digest('base64url');

    return `${payload}.${signature}`;
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

    if (
      !decodedPayload.sub ||
      !decodedPayload.role ||
      !Object.values(UserRole).includes(decodedPayload.role) ||
      !decodedPayload.exp ||
      decodedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return {
      sub: decodedPayload.sub,
      role: decodedPayload.role,
      exp: decodedPayload.exp,
    };
  }

  private getTokenSecret() {
    return process.env.AUTH_TOKEN_SECRET ?? 'median-dev-auth-token-secret';
  }

  private toAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: Boolean(user.emailVerifiedAt),
      hasMenteeProfile: Boolean(user.menteeProfile),
      hasMentorProfile: Boolean(user.mentorProfile),
      mentorStatus: user.mentorProfile?.status,
    };
  }
}
