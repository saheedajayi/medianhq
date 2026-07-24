import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { UserRole, type User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser, LoginDto, RegisterDto } from './dto/auth.dto';

type AuthPayload = {
  sessionToken: string;
  user: AuthUser;
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
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<AuthPayload> {
    const input = this.validateRegisterInput(dto);
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account already exists for this email.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: this.hashPassword(input.password),
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
    });

    return {
      sessionToken: this.signToken(user),
      user: this.toAuthUser(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthPayload> {
    const input = this.validateLoginInput(dto);
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      sessionToken: this.signToken(user),
      user: this.toAuthUser(user),
    };
  }

  async getCurrentUser(sessionToken: string | undefined): Promise<AuthUser> {
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication is required.');
    }

    const payload = this.verifyToken(sessionToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return this.toAuthUser(user);
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

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: Boolean(user.emailVerifiedAt),
    };
  }
}
