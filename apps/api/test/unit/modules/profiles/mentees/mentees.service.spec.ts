import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { MenteesService } from '../../../../../src/modules/profiles/mentees/mentees.service';
import { MenteesRepository } from '../../../../../src/modules/profiles/mentees/mentees.repository';
import type { CreateMenteeProfileDto } from '../../../../../src/modules/profiles/mentees/dto/create-mentee-profile.dto';

describe('MenteesService', () => {
  let service: MenteesService;
  let repository: Record<keyof MenteesRepository, jest.Mock>;

  beforeEach(() => {
    repository = {
      findUserForOnboarding: jest.fn(),
      createProfile: jest.fn(),
      updateProfileByUserId: jest.fn(),
      hasSharedBooking: jest.fn(),
      findMenteeForProfile: jest.fn(),
      countCompletedSessions: jest.fn(),
    };

    service = new MenteesService(
      repository as unknown as MenteesRepository,
      { scan: jest.fn() } as never,
    );
  });

  const validDto: CreateMenteeProfileDto = {
    goals: ['Career Growth'],
    goalDescription: 'Want to advance to Lead level',
    currentRole: 'Junior Developer',
    industry: 'Technology',
    timeframe: '6 months',
  };

  it('should create mentee profile if user has no existing profile', async () => {
    repository.findUserForOnboarding.mockResolvedValue({
      emailVerifiedAt: new Date(),
      role: UserRole.MENTEE,
      menteeProfile: null,
    });

    const mockCreated = {
      id: 'mentee-1',
      userId: 'user-1',
      careerStage: null,
      goals: ['Career Growth'],
      goalDescription: 'Want to advance to Lead level',
      currentRole: 'Junior Developer',
      industry: 'Technology',
      timeframe: '6 months',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.createProfile.mockResolvedValue(mockCreated);

    const result = await service.createProfile('user-1', validDto);

    expect(result).toEqual({
      success: true,
      message: 'Mentee profile saved successfully',
      profile: mockCreated,
    });
    expect(repository.createProfile).toHaveBeenCalledWith({
      user: { connect: { id: 'user-1' } },
      goals: validDto.goals,
      goalDescription: validDto.goalDescription,
      currentRole: validDto.currentRole,
      industry: validDto.industry,
      timeframe: validDto.timeframe,
    });
  });

  it('should update mentee profile if profile already exists', async () => {
    repository.findUserForOnboarding.mockResolvedValue({
      emailVerifiedAt: new Date(),
      role: UserRole.MENTEE,
      menteeProfile: { id: 'mentee-1' },
    });

    const mockUpdated = {
      id: 'mentee-1',
      userId: 'user-1',
      careerStage: null,
      goals: ['Career Growth'],
      goalDescription: 'Updated goal',
      currentRole: 'Developer',
      industry: 'Technology',
      timeframe: '12 months',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.updateProfileByUserId.mockResolvedValue(mockUpdated);

    const result = await service.createProfile('user-1', {
      ...validDto,
      goalDescription: 'Updated goal',
    });

    expect(result).toEqual({
      success: true,
      message: 'Mentee profile updated successfully',
      profile: mockUpdated,
    });
    expect(repository.updateProfileByUserId).toHaveBeenCalledWith('user-1', {
      goals: validDto.goals,
      goalDescription: 'Updated goal',
      currentRole: validDto.currentRole,
      industry: validDto.industry,
      timeframe: validDto.timeframe,
    });
  });

  it('should throw ForbiddenException if user role is MENTOR', async () => {
    repository.findUserForOnboarding.mockResolvedValue({
      emailVerifiedAt: new Date(),
      role: UserRole.MENTOR,
      menteeProfile: null,
    });

    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      'A mentee profile cannot be created for a mentor user.',
    );
  });

  describe('getProfile', () => {
    const mentor = { id: 'mentor-1', role: UserRole.MENTOR };
    const mentee = {
      id: 'mentee-1',
      firstName: 'Tolu',
      lastName: 'Ade',
      menteeProfile: {
        avatarUrl: null,
        location: 'Lagos',
        bio: 'Learning product design.',
        currentRole: 'Junior Designer',
      },
      workExperiences: [
        { id: 'w1', company: 'Andela', isCurrent: true, skills: ['Figma'] },
        {
          id: 'w2',
          company: 'Kuda',
          isCurrent: false,
          skills: ['Figma', 'Research'],
        },
      ],
      socialLinks: [],
      menteeBookings: [
        {
          feedback: {
            id: 'f1',
            rating: 4,
            comment: 'Came prepared.',
            createdAt: new Date('2026-01-01'),
            author: {
              firstName: 'Ada',
              lastName: 'Obi',
              mentorProfile: { avatarUrl: 'https://example.com/a.png' },
            },
          },
        },
        {
          feedback: {
            id: 'f2',
            rating: 5,
            comment: null,
            createdAt: new Date('2026-02-01'),
            author: { firstName: 'Ben', lastName: 'Eze', mentorProfile: null },
          },
        },
      ],
    };

    it('refuses a mentor who has no booking with the mentee', async () => {
      repository.hasSharedBooking.mockResolvedValue(false);

      await expect(service.getProfile(mentor, 'mentee-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.hasSharedBooking).toHaveBeenCalledWith(
        'mentor-1',
        'mentee-1',
      );
      expect(repository.findMenteeForProfile).not.toHaveBeenCalled();
    });

    it('refuses another mentee without checking bookings', async () => {
      await expect(
        service.getProfile(
          { id: 'mentee-2', role: UserRole.MENTEE },
          'mentee-1',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(repository.hasSharedBooking).not.toHaveBeenCalled();
      expect(repository.findMenteeForProfile).not.toHaveBeenCalled();
    });

    it('shows the profile to a mentor the mentee has booked', async () => {
      repository.hasSharedBooking.mockResolvedValue(true);
      repository.findMenteeForProfile.mockResolvedValue(mentee);
      repository.countCompletedSessions.mockResolvedValue(3);

      const result = await service.getProfile(mentor, 'mentee-1');

      expect(result).toMatchObject({
        id: 'mentee-1',
        name: 'Tolu Ade',
        role: 'Junior Designer',
        company: 'Andela',
        location: 'Lagos',
        expertise: ['Figma', 'Research'],
        sessionCount: 3,
        rating: 4.5,
        reviewCount: 2,
      });
      expect(result.reviews[0]).toMatchObject({
        authorName: 'Ada Obi',
        authorAvatar: 'https://example.com/a.png',
        comment: 'Came prepared.',
      });
    });

    it('lets a mentee load their own profile', async () => {
      repository.findMenteeForProfile.mockResolvedValue(mentee);
      repository.countCompletedSessions.mockResolvedValue(0);

      const result = await service.getProfile(
        { id: 'mentee-1', role: UserRole.MENTEE },
        'mentee-1',
      );

      expect(result.name).toBe('Tolu Ade');
      expect(repository.hasSharedBooking).not.toHaveBeenCalled();
    });

    it('reports a missing mentee as not found', async () => {
      repository.hasSharedBooking.mockResolvedValue(true);
      repository.findMenteeForProfile.mockResolvedValue(null);
      repository.countCompletedSessions.mockResolvedValue(0);

      await expect(service.getProfile(mentor, 'gone')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
