import { ConflictException, ForbiddenException } from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import { MentorsService } from './mentors.service';
import { MentorsRepository } from './mentors.repository';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';

describe('MentorsService', () => {
  let service: MentorsService;
  let repository: Record<keyof MentorsRepository, jest.Mock>;

  beforeEach(() => {
    repository = {
      findUserForOnboarding: jest.fn(),
      upsertProfileByUserId: jest.fn(),
      findMenteeProfileByUserId: jest.fn(),
      findApprovedMatches: jest.fn(),
    };

    service = new MentorsService(repository as unknown as MentorsRepository);
  });

  describe('apply', () => {
    const validDto: CreateMentorProfileDto = {
      industry: 'Technology',
      experience: '5-10 years',
      company: 'Acme Corp',
      currentRole: 'Senior Engineer',
      location: 'Lagos, Nigeria',
      bio: 'Passionate about software architecture.',
      cvUrl: 'https://res.cloudinary.com/demo/cv.pdf',
    };

    it('should successfully submit/upsert mentor application', async () => {
      const mockUser = {
        emailVerifiedAt: new Date(),
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: null,
      };

      const mockProfile = {
        id: 'mentor-1',
        userId: 'user-1',
        industry: 'Technology',
        experience: '5-10 years',
        company: 'Acme Corp',
        jobTitle: 'Senior Engineer',
        location: 'Lagos, Nigeria',
        bio: 'Passionate about software architecture.',
        cvUrl: 'https://res.cloudinary.com/demo/cv.pdf',
        headline: null,
        linkedinUrl: null,
        pricePerSession: 0,
        currency: 'NGN',
        status: MentorStatus.PENDING_REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findUserForOnboarding.mockResolvedValue(mockUser);
      repository.upsertProfileByUserId.mockResolvedValue(mockProfile);

      const result = await service.apply('user-1', validDto);

      expect(result).toEqual({
        success: true,
        message: 'Application submitted successfully',
        profile: mockProfile,
      });

      expect(repository.findUserForOnboarding).toHaveBeenCalledWith('user-1');
      expect(repository.upsertProfileByUserId).toHaveBeenCalledWith('user-1', validDto);
    });

    it('should throw ForbiddenException if email is not verified', async () => {
      repository.findUserForOnboarding.mockResolvedValue({
        emailVerifiedAt: null,
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: null,
      });

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        'Verify your email before starting onboarding.',
      );
    });

    it('should throw ForbiddenException if user is registered as a Mentee', async () => {
      repository.findUserForOnboarding.mockResolvedValue({
        emailVerifiedAt: new Date(),
        role: UserRole.MENTEE,
        menteeProfile: { id: 'mentee-1' },
        mentorProfile: null,
      });

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        'Your account is currently registered as a Mentee.',
      );
    });

    it('should throw ConflictException if mentor application is already APPROVED', async () => {
      repository.findUserForOnboarding.mockResolvedValue({
        emailVerifiedAt: new Date(),
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: { id: 'mentor-1', status: MentorStatus.APPROVED },
      });

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        'Your mentor application has already been approved.',
      );
    });

    it('should rethrow errors occurring during upsert operation', async () => {
      repository.findUserForOnboarding.mockResolvedValue({
        emailVerifiedAt: new Date(),
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: null,
      });

      const dbError = new Error('Database connection failed');
      repository.upsertProfileByUserId.mockRejectedValue(dbError);

      await expect(service.apply('user-1', validDto)).rejects.toThrow(dbError);
    });
  });

  describe('getMatches', () => {
    it('should return empty matches list when no approved mentors match', async () => {
      repository.findMenteeProfileByUserId.mockResolvedValue({
        id: 'mentee-1',
        userId: 'user-1',
        industry: 'Finance',
        currentRole: 'Analyst',
        careerStage: null,
        goals: [],
        goalDescription: null,
        timeframe: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      repository.findApprovedMatches.mockResolvedValue([]);

      const result = await service.getMatches('user-1');

      expect(result).toEqual({ data: [] });
      expect(repository.findApprovedMatches).toHaveBeenCalledWith('Finance', 'Analyst');
    });

    it('should map matches correctly and format match percentage', async () => {
      repository.findMenteeProfileByUserId.mockResolvedValue({
        id: 'mentee-1',
        userId: 'user-1',
        industry: 'Technology',
        currentRole: 'Frontend Dev',
        careerStage: null,
        goals: [],
        goalDescription: null,
        timeframe: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      repository.findApprovedMatches.mockResolvedValue([
        {
          id: 'mentor-1',
          userId: 'user-2',
          headline: 'Tech Lead',
          company: 'Google',
          jobTitle: 'Staff Engineer',
          industry: 'Technology',
          firstName: 'Jane',
          lastName: 'Doe',
          score: 80,
        },
        {
          id: 'mentor-2',
          userId: 'user-3',
          headline: null,
          company: null,
          jobTitle: null,
          industry: 'Design',
          firstName: 'John',
          lastName: 'Smith',
          score: 0,
        },
      ]);

      const result = await service.getMatches('user-1');

      expect(result).toEqual({
        data: [
          {
            id: 'mentor-1',
            name: 'Jane Doe',
            role: 'Staff Engineer @ Google',
            sessions: '0 sessions',
            match: '80%',
            image: 'https://i.pravatar.cc/150?u=mentor-1',
          },
          {
            id: 'mentor-2',
            name: 'John Smith',
            role: 'null @ Company',
            sessions: '0 sessions',
            match: '50%',
            image: 'https://i.pravatar.cc/150?u=mentor-2',
          },
        ],
      });
    });
  });
});
