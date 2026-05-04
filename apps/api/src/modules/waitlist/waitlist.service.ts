import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, WaitlistAudience } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWaitlistEntryDto) {
    const data = this.normalize(dto);

    const entry = await this.prisma.waitlistEntry.upsert({
      where: {
        email_audience: {
          email: data.email,
          audience: data.audience,
        },
      },
      create: data,
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        expertise: data.expertise,
        currentRole: data.currentRole,
        company: data.company,
        levelOfExperience: data.levelOfExperience,
      },
      select: {
        id: true,
        email: true,
        audience: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      status: 'ok',
      entry,
    };
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
