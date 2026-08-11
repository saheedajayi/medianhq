import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { MenteesService } from './mentees.service';
import { MenteesRepository } from './mentees.repository';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';

describe('MenteesService', () => {
  let service: MenteesService;
  let repository: Record<keyof MenteesRepository, jest.Mock>;

  beforeEach(() => {
    repository = {
      findUserForOnboarding: jest.fn(),
      createProfile: jest.fn(),
      updateProfileByUserId: jest.fn(),
    };

    service = new MenteesService(repository as unknown as MenteesRepository);
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

  it('should throw ForbiddenException if email is unverified', async () => {
    repository.findUserForOnboarding.mockResolvedValue({
      emailVerifiedAt: null,
      role: UserRole.MENTEE,
      menteeProfile: null,
    });

    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      'Verify your email before starting onboarding.',
    );
  });

  it('should throw ForbiddenException if user role is not MENTEE', async () => {
    repository.findUserForOnboarding.mockResolvedValue({
      emailVerifiedAt: new Date(),
      role: UserRole.MENTOR,
      menteeProfile: null,
    });

    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.createProfile('user-1', validDto)).rejects.toThrow(
      'A mentee role is required to create this profile.',
    );
  });
});
