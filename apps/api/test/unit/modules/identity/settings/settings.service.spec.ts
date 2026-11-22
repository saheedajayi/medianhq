import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SettingsService } from '../../../../../src/modules/identity/settings/settings.service';

describe('SettingsService', () => {
  const mentee = { id: 'u1', role: 'MENTEE' } as never;
  const mentor = { id: 'm1', role: 'MENTOR' } as never;
  const admin = { id: 'a1', role: 'ADMIN' } as never;

  const setup = () => {
    const prisma = {
      user: { update: jest.fn().mockResolvedValue({}) },
      menteeProfile: { upsert: jest.fn().mockResolvedValue({}) },
      mentorProfile: { update: jest.fn().mockResolvedValue({}) },
      workExperience: { findMany: jest.fn().mockResolvedValue([]) },
      education: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const scanner = { scan: jest.fn() };
    const service = new SettingsService(prisma as never, scanner as never);
    return { prisma, scanner, service };
  };

  describe('updateProfile', () => {
    it("saves a mentee's details on the mentee profile", async () => {
      const { prisma, service } = setup();
      await service.updateProfile(mentee, { firstName: ' Ada ', bio: 'Hi' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          firstName: 'Ada',
          menteeProfile: { update: { bio: 'Hi' } },
        },
      });
    });

    it("saves a mentor's details on the mentor profile", async () => {
      const { prisma, service } = setup();
      await service.updateProfile(mentor, {
        gender: 'female',
        location: 'Lagos',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: {
          mentorProfile: { update: { gender: 'Female', location: 'Lagos' } },
        },
      });
    });

    it('is not open to admins', async () => {
      const { prisma, service } = setup();
      await expect(service.updateProfile(admin, { bio: 'Hi' })).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('career info', () => {
    it('is open to mentors as well as mentees', async () => {
      const { service } = setup();
      await expect(service.getCareer(mentor)).resolves.toEqual({
        experiences: [],
        educations: [],
      });
      await expect(service.getCareer(admin)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateCareerGoals', () => {
    it('saves cleaned goals for a mentee', async () => {
      const { prisma, service } = setup();
      await service.updateCareerGoals(mentee, {
        goals: [' Leadership ', 'Leadership', 'Job search'],
        goalDescription: '  ',
        timeframe: '3-6 months',
      });

      const data = {
        goals: ['Leadership', 'Job search'],
        goalDescription: null,
        timeframe: '3-6 months',
      };
      expect(prisma.menteeProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        create: { userId: 'u1', ...data },
        update: data,
      });
    });

    it('needs at least one goal and a listed timeframe', async () => {
      const { service } = setup();
      await expect(
        service.updateCareerGoals(mentee, { goals: [] }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateCareerGoals(mentee, {
          goals: ['Leadership'],
          timeframe: 'soon',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('stays mentee-only', async () => {
      const { service } = setup();
      await expect(
        service.updateCareerGoals(mentor, { goals: ['Leadership'] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateServiceCharge', () => {
    it("saves the mentor's choice", async () => {
      const { prisma, service } = setup();
      await expect(
        service.updateServiceCharge(mentor, { passFeeToMentee: true }),
      ).resolves.toEqual({ success: true, passFeeToMentee: true });
      expect(prisma.mentorProfile.update).toHaveBeenCalledWith({
        where: { userId: 'm1' },
        data: { passFeeToMentee: true },
      });
    });

    it('refuses mentees and anything that is not a yes or no', async () => {
      const { prisma, service } = setup();
      await expect(
        service.updateServiceCharge(mentee, { passFeeToMentee: true }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateServiceCharge(mentor, {
          passFeeToMentee: 'yes' as never,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.mentorProfile.update).not.toHaveBeenCalled();
    });
  });
});
