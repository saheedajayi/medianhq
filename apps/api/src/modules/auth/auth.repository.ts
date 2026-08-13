import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const MENTEE_PROFILE_SELECT = {
  id: true,
  gender: true,
  location: true,
  bio: true,
  avatarUrl: true,
};

const MENTOR_PROFILE_SELECT = {
  id: true,
  status: true,
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        menteeProfile: { select: MENTEE_PROFILE_SELECT },
        mentorProfile: { select: MENTOR_PROFILE_SELECT },
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        menteeProfile: { select: MENTEE_PROFILE_SELECT },
        mentorProfile: { select: MENTOR_PROFILE_SELECT },
      },
    });
  }

  findByOAuthId(provider: 'google' | 'linkedin', providerId: string) {
    return this.prisma.user.findUnique({
      where: provider === 'google' ? { googleId: providerId } : { linkedinId: providerId },
      include: {
        menteeProfile: { select: MENTEE_PROFILE_SELECT },
        mentorProfile: { select: MENTOR_PROFILE_SELECT },
      },
    });
  }

  findIdByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      include: {
        menteeProfile: { select: MENTEE_PROFILE_SELECT },
        mentorProfile: { select: MENTOR_PROFILE_SELECT },
      },
    });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  upsertVerificationToken(data: Prisma.VerificationTokenUncheckedCreateInput) {
    return this.prisma.verificationToken.upsert({
      where: {
        email_type: {
          email: data.email,
          type: data.type,
        },
      },
      create: data,
      update: data,
    });
  }

  findVerificationToken(email: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    return this.prisma.verificationToken.findUnique({
      where: {
        email_type: {
          email,
          type,
        },
      },
    });
  }

  findVerificationTokenByToken(token: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
    return this.prisma.verificationToken.findFirst({
      where: {
        token,
        type,
      },
    });
  }

  deleteVerificationToken(id: string) {
    return this.prisma.verificationToken.delete({
      where: { id },
    });
  }
}
