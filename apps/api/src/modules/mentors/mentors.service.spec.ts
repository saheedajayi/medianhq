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
      findMentorById: jest.fn(),
      buildExploreWhereClause: jest.fn(),
      findExploreMentors: jest.fn(),
      countExploreMentors: jest.fn(),
      findFeaturedMentors: jest.fn(),
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
        status: MentorStatus.PENDING_REVIEW,
      };

      repository.findUserForOnboarding.mockResolvedValue(mockUser);
      repository.upsertProfileByUserId.mockResolvedValue(mockProfile);

      const result = await service.apply('user-1', validDto);

      expect(repository.findUserForOnboarding).toHaveBeenCalledWith('user-1');
      expect(repository.upsertProfileByUserId).toHaveBeenCalledWith('user-1', validDto);
      expect(result).toEqual({
        success: true,
        message: 'Application submitted successfully',
        profile: mockProfile,
      });
    });

    it('should throw ForbiddenException if user email is not verified', async () => {
      const mockUser = {
        emailVerifiedAt: null,
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: null,
      };

      repository.findUserForOnboarding.mockResolvedValue(mockUser);

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.upsertProfileByUserId).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is already a mentee', async () => {
      const mockUser = {
        emailVerifiedAt: new Date(),
        role: UserRole.MENTEE,
        menteeProfile: { id: 'mentee-1' },
        mentorProfile: null,
      };

      repository.findUserForOnboarding.mockResolvedValue(mockUser);

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.upsertProfileByUserId).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if mentor application is already approved', async () => {
      const mockUser = {
        emailVerifiedAt: new Date(),
        role: UserRole.MENTOR,
        menteeProfile: null,
        mentorProfile: { id: 'mentor-1', status: MentorStatus.APPROVED },
      };

      repository.findUserForOnboarding.mockResolvedValue(mockUser);

      await expect(service.apply('user-1', validDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.upsertProfileByUserId).not.toHaveBeenCalled();
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

  describe('explore', () => {
    it('should return paginated explore mentors', async () => {
      const mockMentors = [
        {
          id: 'mentor-1',
          userId: 'user-1',
          headline: 'Leading product design',
          bio: 'Passionate about mentoring',
          industry: 'Technology',
          experience: '5-10 years',
          company: 'Andela',
          jobTitle: 'Senior Designer',
          location: 'London',
          pricePerSession: 0,
          currency: 'NGN',
          user: {
            id: 'user-1',
            firstName: 'Abdulrahman',
            lastName: 'Hassan',
            email: 'abdul@example.com',
            mentorBookings: [],
          },
        },
      ];

      repository.buildExploreWhereClause.mockReturnValue({ status: 'APPROVED' });
      repository.findExploreMentors.mockResolvedValue(mockMentors);
      repository.countExploreMentors.mockResolvedValue(1);

      const result = await service.explore({ category: 'Tech' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Abdulrahman Hassan');
      expect(result.data[0].category).toBe('Tech');
      expect(result.data[0].price).toBe('Free');
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      });
    });
  });

  describe('getFeatured', () => {
    it('should return featured mentors', async () => {
      const mockMentors = [
        {
          id: 'mentor-1',
          industry: 'Finance',
          jobTitle: 'VP Finance',
          company: 'Paystack',
          location: 'Lagos',
          pricePerSession: 25000,
          currency: 'NGN',
          user: {
            firstName: 'Amina',
            lastName: 'Yusuf',
            mentorBookings: [],
          },
        },
      ];

      repository.findFeaturedMentors.mockResolvedValue(mockMentors);

      const result = await service.getFeatured(2);

      expect(result).toHaveLength(1);
      expect(result[0].isFeatured).toBe(true);
      expect(result[0].category).toBe('Finance');
      expect(result[0].price).toBe('₦25,000');
    });
  });

  describe('getMentorProfile', () => {
    it('should return mentor profile by ID', async () => {
      const mockMentor = {
        id: 'mentor-1',
        bio: 'Mentor bio',
        experience: '5-10 years',
        company: 'Moniepoint',
        jobTitle: 'Engineering Director',
        location: 'Lagos',
        pricePerSession: 0,
        currency: 'NGN',
        user: {
          firstName: 'Chidinma',
          lastName: 'Okafor',
          mentorBookings: [
            {
              review: {
                id: 'rev-1',
                rating: 5,
                comment: 'Great session!',
                author: { id: 'u2', firstName: 'Tunde', lastName: 'A' },
                createdAt: new Date(),
              },
            },
          ],
        },
      };

      repository.findMentorById.mockResolvedValue(mockMentor);

      const result = await service.getMentorProfile('mentor-1');

      expect(result.name).toBe('Chidinma Okafor');
      expect(result.rating).toBe(5);
      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].comment).toBe('Great session!');
    });
  });
});
