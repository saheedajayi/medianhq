import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { ContentScannerService } from '../../platform/moderation/content-scanner.service';
import type { AuthUser } from '../auth/dto/auth.dto';

export type UpdateSettingsDto = {
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  timezone?: string;
  notificationPreferences?: Record<
    string,
    { email?: boolean; inApp?: boolean }
  >;
};

export type UpdateProfileDto = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
};

export type ServiceChargeDto = {
  passFeeToMentee?: boolean;
};

export type CareerGoalsDto = {
  goals?: string[];
  goalDescription?: string | null;
  timeframe?: string | null;
};

type CareerDates = {
  startMonth: number;
  startYear: number;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
  skills?: string[];
  tools?: string[];
};

export type WorkExperienceDto = CareerDates & {
  role: string;
  company: string;
  industry?: string | null;
  contribution?: string | null;
};

export type EducationDto = CareerDates & {
  fieldOfStudy: string;
  school: string;
  learnings?: string | null;
};

export type SocialLinksDto = {
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  links?: { title: string; url: string }[];
};

const NOTIFICATION_TYPES = [
  'bookingUpdates',
  'cancellations',
  'sessionReminders',
  'messages',
  'actionItems',
  'community',
  'achievements',
  // The onboarding series and other tips from Mide
  'tips',
];
const GOAL_TIMEFRAMES = ['1-3 months', '3-6 months', '6+ months'];
const MAX_GOAL_DESCRIPTION_LENGTH = 200;
const MAX_LIST_ITEMS = 20;
const MAX_CUSTOM_LINKS = 10;
const CAREER_ORDER = [
  { isCurrent: 'desc' as const },
  { startYear: 'desc' as const },
  { startMonth: 'desc' as const },
];

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentScanner: ContentScannerService,
  ) {}

  async getMySettings(user: AuthUser) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: true,
        marketingEmails: false,
        timezone: 'Africa/Lagos',
      },
      update: {},
    });

    const userDetails = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        mentorProfile: true,
        menteeProfile: true,
      },
    });

    return {
      settings,
      profile: userDetails,
    };
  }

  async updateMySettings(user: AuthUser, dto: UpdateSettingsDto) {
    const updated = await this.prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: dto.emailNotifications ?? true,
        marketingEmails: dto.marketingEmails ?? false,
        timezone: dto.timezone ?? 'Africa/Lagos',
        // A first save of notification choices must not be dropped
        ...(dto.notificationPreferences !== undefined && {
          notificationPreferences: await this.mergeNotificationPreferences(
            user.id,
            dto.notificationPreferences,
          ),
        }),
      },
      update: {
        ...(dto.emailNotifications !== undefined && {
          emailNotifications: dto.emailNotifications,
        }),
        ...(dto.marketingEmails !== undefined && {
          marketingEmails: dto.marketingEmails,
        }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.notificationPreferences !== undefined && {
          notificationPreferences: await this.mergeNotificationPreferences(
            user.id,
            dto.notificationPreferences,
          ),
        }),
      },
    });

    return {
      success: true,
      settings: updated,
    };
  }

  async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
    this.ensureMember(user);

    const firstName = dto.firstName?.trim();
    const lastName = dto.lastName?.trim();
    if (dto.firstName !== undefined && !firstName) {
      throw new BadRequestException('First name is required.');
    }
    if (dto.lastName !== undefined && !lastName) {
      throw new BadRequestException('Last name is required.');
    }
    if ((firstName?.length ?? 0) > 50 || (lastName?.length ?? 0) > 50) {
      throw new BadRequestException('Names cannot exceed 50 characters.');
    }

    const gender = dto.gender?.trim();
    if (gender && !['male', 'female'].includes(gender.toLowerCase())) {
      throw new BadRequestException('Gender must be Male or Female.');
    }
    const bio = dto.bio?.trim();
    if (bio && bio.split(/\s+/).length > 300) {
      throw new BadRequestException('Bio must be less than 300 words.');
    }
    const avatarUrl = dto.avatarUrl?.trim();
    if (avatarUrl && !avatarUrl.startsWith('https://')) {
      throw new BadRequestException('Profile picture must be an https URL.');
    }

    const profile = {
      ...(gender && {
        gender: gender[0].toUpperCase() + gender.slice(1).toLowerCase(),
      }),
      ...(dto.location !== undefined && {
        location: dto.location.trim() || null,
      }),
      ...(dto.bio !== undefined && { bio: bio || null }),
      ...(avatarUrl && { avatarUrl }),
    };
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        // The same fields live on whichever profile the person's role uses
        ...(user.role === UserRole.MENTOR
          ? { mentorProfile: { update: profile } }
          : { menteeProfile: { update: profile } }),
      },
    });
    if (bio) {
      this.contentScanner.scan({
        contentType: 'PROFILE_TEXT',
        contentId: user.id,
        contentField: 'Bio',
        content: bio,
        authorId: user.id,
      });
    }

    return { success: true };
  }

  /** The goals a mentee picked at onboarding, editable from settings */
  async updateCareerGoals(user: AuthUser, dto: CareerGoalsDto) {
    this.ensureMentee(user);

    const goals = this.cleanList(dto.goals, 'Goals');
    const goalDescription = dto.goalDescription?.trim() || null;
    if ((goalDescription?.length ?? 0) > MAX_GOAL_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `Keep your goal to ${MAX_GOAL_DESCRIPTION_LENGTH} characters or fewer.`,
      );
    }
    const timeframe = dto.timeframe?.trim() || null;
    if (timeframe && !GOAL_TIMEFRAMES.includes(timeframe)) {
      throw new BadRequestException('Pick one of the listed timeframes.');
    }

    const data = { goals, goalDescription, timeframe };
    await this.prisma.menteeProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });
    if (goalDescription) {
      this.contentScanner.scan({
        contentType: 'PROFILE_TEXT',
        contentId: user.id,
        contentField: 'Goal',
        content: goalDescription,
        authorId: user.id,
      });
    }

    return { success: true, ...data };
  }

  async getCareer(user: AuthUser) {
    this.ensureMember(user);
    const [experiences, educations] = await Promise.all([
      this.prisma.workExperience.findMany({
        where: { userId: user.id },
        orderBy: CAREER_ORDER,
      }),
      this.prisma.education.findMany({
        where: { userId: user.id },
        orderBy: CAREER_ORDER,
      }),
    ]);
    return { experiences, educations };
  }

  createExperience(user: AuthUser, dto: WorkExperienceDto) {
    this.ensureMember(user);
    return this.prisma.workExperience.create({
      data: { userId: user.id, ...this.cleanExperience(dto) },
    });
  }

  async updateExperience(user: AuthUser, id: string, dto: WorkExperienceDto) {
    this.ensureMember(user);
    await this.assertOwned(
      this.prisma.workExperience.findFirst({ where: { id, userId: user.id } }),
    );
    return this.prisma.workExperience.update({
      where: { id },
      data: this.cleanExperience(dto),
    });
  }

  async deleteExperience(user: AuthUser, id: string) {
    this.ensureMember(user);
    await this.prisma.workExperience.deleteMany({
      where: { id, userId: user.id },
    });
    return { success: true };
  }

  createEducation(user: AuthUser, dto: EducationDto) {
    this.ensureMember(user);
    return this.prisma.education.create({
      data: { userId: user.id, ...this.cleanEducation(dto) },
    });
  }

  async updateEducation(user: AuthUser, id: string, dto: EducationDto) {
    this.ensureMember(user);
    await this.assertOwned(
      this.prisma.education.findFirst({ where: { id, userId: user.id } }),
    );
    return this.prisma.education.update({
      where: { id },
      data: this.cleanEducation(dto),
    });
  }

  async deleteEducation(user: AuthUser, id: string) {
    this.ensureMember(user);
    await this.prisma.education.deleteMany({ where: { id, userId: user.id } });
    return { success: true };
  }

  async getSocialLinks(user: AuthUser) {
    this.ensureMember(user);
    return this.prisma.socialLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Replaces every link at once, since the screen saves them together */
  async saveSocialLinks(user: AuthUser, dto: SocialLinksDto) {
    this.ensureMember(user);

    const custom = dto.links ?? [];
    if (custom.length > MAX_CUSTOM_LINKS) {
      throw new BadRequestException(
        `You can add up to ${MAX_CUSTOM_LINKS} extra links.`,
      );
    }
    const rows = [
      { kind: 'LINKEDIN', title: null, url: this.cleanUrl(dto.linkedinUrl) },
      { kind: 'X', title: null, url: this.cleanUrl(dto.twitterUrl) },
      { kind: 'WEBSITE', title: null, url: this.cleanUrl(dto.websiteUrl) },
      ...custom.map((link) => {
        const title = link.title?.trim();
        if (!title) throw new BadRequestException('Every link needs a title.');
        return { kind: 'CUSTOM', title, url: this.cleanUrl(link.url) };
      }),
    ].filter((row) => !!row.url);

    await this.prisma.$transaction([
      this.prisma.socialLink.deleteMany({ where: { userId: user.id } }),
      this.prisma.socialLink.createMany({
        data: rows.map((row) => ({ userId: user.id, ...row })),
      }),
    ]);
    return this.getSocialLinks(user);
  }

  /** Mentors and mentees share the profile, career and socials settings */
  private ensureMember(user: AuthUser) {
    if (user.role !== UserRole.MENTEE && user.role !== UserRole.MENTOR) {
      throw new ForbiddenException(
        'Only mentors and mentees can change these settings.',
      );
    }
  }

  /** Who covers the platform fee by default: the mentor, or the mentee on top of the price */
  async updateServiceCharge(user: AuthUser, dto: ServiceChargeDto) {
    if (user.role !== UserRole.MENTOR) {
      throw new ForbiddenException('Only mentors can change this setting.');
    }
    if (typeof dto?.passFeeToMentee !== 'boolean') {
      throw new BadRequestException('Choose who covers the platform fee.');
    }
    await this.prisma.mentorProfile.update({
      where: { userId: user.id },
      data: { passFeeToMentee: dto.passFeeToMentee },
    });
    return { success: true, passFeeToMentee: dto.passFeeToMentee };
  }

  private ensureMentee(user: AuthUser) {
    if (user.role !== UserRole.MENTEE) {
      throw new ForbiddenException('Only mentees can change these settings.');
    }
  }

  private async assertOwned(lookup: Promise<unknown>) {
    if (!(await lookup)) throw new NotFoundException('Entry not found.');
  }

  private async mergeNotificationPreferences(
    userId: string,
    updates: NonNullable<UpdateSettingsDto['notificationPreferences']>,
  ) {
    const current = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { notificationPreferences: true },
    });
    const merged = {
      ...((current?.notificationPreferences ?? {}) as Record<string, object>),
    };

    for (const [type, value] of Object.entries(updates)) {
      if (!NOTIFICATION_TYPES.includes(type)) {
        throw new BadRequestException(`Unknown notification type: ${type}.`);
      }
      merged[type] = {
        ...merged[type],
        ...(typeof value?.email === 'boolean' && { email: value.email }),
        ...(typeof value?.inApp === 'boolean' && { inApp: value.inApp }),
      };
    }
    return merged as Prisma.InputJsonValue;
  }

  private cleanDates(dto: CareerDates) {
    const isCurrent = !!dto.isCurrent;
    const validMonth = (month: unknown) =>
      Number.isInteger(month) &&
      (month as number) >= 1 &&
      (month as number) <= 12;
    const validYear = (year: unknown) =>
      Number.isInteger(year) &&
      (year as number) >= 1950 &&
      (year as number) <= 2100;

    if (!validMonth(dto.startMonth) || !validYear(dto.startYear)) {
      throw new BadRequestException('Start date is required.');
    }
    if (!isCurrent && (!validMonth(dto.endMonth) || !validYear(dto.endYear))) {
      throw new BadRequestException(
        'End date is required unless this is your present position.',
      );
    }
    if (
      !isCurrent &&
      dto.endYear! * 12 + dto.endMonth! < dto.startYear * 12 + dto.startMonth
    ) {
      throw new BadRequestException(
        'End date cannot be before the start date.',
      );
    }

    return {
      startMonth: dto.startMonth,
      startYear: dto.startYear,
      endMonth: isCurrent ? null : dto.endMonth!,
      endYear: isCurrent ? null : dto.endYear!,
      isCurrent,
      skills: this.cleanList(dto.skills, 'Skills'),
      tools: this.cleanList(dto.tools, 'Tools'),
    };
  }

  private cleanExperience(dto: WorkExperienceDto) {
    return {
      role: this.requireText(dto.role, 'Current role'),
      company: this.requireText(dto.company, 'Company'),
      industry: dto.industry?.trim() || null,
      contribution: dto.contribution?.trim() || null,
      ...this.cleanDates(dto),
    };
  }

  private cleanEducation(dto: EducationDto) {
    return {
      fieldOfStudy: this.requireText(dto.fieldOfStudy, 'Field of study'),
      school: this.requireText(dto.school, 'School'),
      learnings: dto.learnings?.trim() || null,
      ...this.cleanDates(dto),
    };
  }

  private requireText(value: string | undefined, label: string) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) throw new BadRequestException(`${label} is required.`);
    return text;
  }

  private cleanList(values: string[] | undefined, label: string) {
    const list = Array.isArray(values) ? values : [];
    const cleaned = [
      ...new Set(
        list
          .filter((v) => typeof v === 'string')
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ];
    if (cleaned.length === 0)
      throw new BadRequestException(`Add at least one item to ${label}.`);
    if (cleaned.length > MAX_LIST_ITEMS) {
      throw new BadRequestException(
        `${label} cannot have more than ${MAX_LIST_ITEMS} items.`,
      );
    }
    return cleaned;
  }

  private cleanUrl(value: string | undefined) {
    const url = value?.trim();
    if (!url) return '';
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException(
        `"${url}" isn't a valid link. Include https://.`,
      );
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException(
        `"${url}" isn't a valid link. Include https://.`,
      );
    }
    return url;
  }
}
