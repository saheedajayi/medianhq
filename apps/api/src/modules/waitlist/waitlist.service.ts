import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma, WaitlistAudience } from '@prisma/client';
import { EmailService } from '../email/email.service';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistRepository } from './waitlist.repository';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly waitlistRepository: WaitlistRepository,
    private readonly emailService: EmailService,
  ) {}

  async getStats() {
    return {
      totalPeople: await this.waitlistRepository.countDistinctEmails(),
    };
  }

  async create(dto: CreateWaitlistEntryDto) {
    const data = this.normalize(dto);
    const existingEntry = await this.waitlistRepository.findByEmail(data.email);

    if (existingEntry) {
      throw new ConflictException('This email is already on the waitlist.');
    }

    let entry: Awaited<ReturnType<WaitlistRepository['create']>>;

    try {
      entry = await this.waitlistRepository.create(data);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This email is already on the waitlist.');
      }

      throw error;
    }

    void this.sendConfirmationEmail(data);

    return {
      message: "You're on the waitlist. We'll be in touch soon.",
      data: {
        entry,
      },
    };
  }

  private async sendConfirmationEmail(data: Prisma.WaitlistEntryCreateInput) {
    try {
      await this.emailService.sendWaitlistConfirmation({
        email: data.email,
        firstName: data.firstName,
        audience: data.audience,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send waitlist confirmation email to ${data.email}.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private normalize(
    dto: CreateWaitlistEntryDto,
  ): Prisma.WaitlistEntryCreateInput {
    const firstName = this.requiredString(dto.firstName, 'firstName');
    const lastName = this.requiredString(dto.lastName, 'lastName');
    const email = this.requiredString(dto.email, 'email').toLowerCase();
    const currentRole = this.requiredString(dto.currentRole, 'currentRole');
    const location = this.optionalString(dto.location);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid email is required.');
    }

    if (!Object.values(WaitlistAudience).includes(dto.audience)) {
      throw new BadRequestException('A valid waitlist audience is required.');
    }

    const expertise =
      dto.audience === WaitlistAudience.MENTOR
        ? this.requiredString(dto.expertise, 'expertise')
        : this.optionalString(dto.expertise);
    const company =
      dto.audience === WaitlistAudience.MENTOR
        ? this.requiredString(dto.company, 'company')
        : this.optionalString(dto.company);
    const levelOfExperience =
      dto.audience === WaitlistAudience.MENTEE
        ? this.requiredString(dto.levelOfExperience, 'levelOfExperience')
        : this.optionalString(dto.levelOfExperience);

    return {
      firstName,
      lastName,
      email,
      audience: dto.audience,
      location,
      expertise,
      currentRole,
      company,
      levelOfExperience,
    };
  }

  private requiredString(value: unknown, field: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} is required.`);
    }

    return value.trim();
  }

  private optionalString(value: unknown) {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
