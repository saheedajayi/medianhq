import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistAudience } from '@prisma/client';
import { WaitlistService } from './waitlist.service';
import { WaitlistRepository } from './waitlist.repository';
import { EmailService } from '../email/email.service';

describe('WaitlistService', () => {
  let service: WaitlistService;
  let repository: jest.Mocked<WaitlistRepository>;

  const mockRepository = {
    countDistinctEmails: jest.fn(),
    findByEmail: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findAllForExport: jest.fn(),
    findLatest: jest.fn(),
    countByAudience: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailService = {
    sendWaitlistConfirmation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        {
          provide: WaitlistRepository,
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
    repository = module.get(WaitlistRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportCsv', () => {
    it('should generate properly formatted CSV string with headers and escaped fields', async () => {
      const mockEntries = [
        {
          id: 'w-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          audience: WaitlistAudience.MENTOR,
          currentRole: 'Senior Engineer',
          company: 'Acme, Inc.',
          expertise: 'Engineering, Leadership',
          levelOfExperience: null,
          location: 'San Francisco, CA',
          createdAt: new Date('2026-08-10T12:00:00.000Z'),
          updatedAt: new Date('2026-08-10T12:00:00.000Z'),
        },
        {
          id: 'w-2',
          firstName: 'Jane "Jay"',
          lastName: 'Smith',
          email: 'jane@example.com',
          audience: WaitlistAudience.MENTEE,
          currentRole: 'Product Manager',
          company: null,
          expertise: null,
          levelOfExperience: '3-5 years',
          location: 'New York',
          createdAt: new Date('2026-08-11T09:30:00.000Z'),
          updatedAt: new Date('2026-08-11T09:30:00.000Z'),
        },
      ];

      repository.findAllForExport.mockResolvedValue(mockEntries as any);

      const csv = await service.exportCsv();

      const lines = csv.split('\r\n');
      expect(lines.length).toBe(3);

      expect(lines[0]).toBe(
        '"ID","First Name","Last Name","Email","Audience","Current Role","Company","Expertise","Level of Experience","Location","Created At"',
      );

      // Mentor line check
      expect(lines[1]).toContain('"w-1"');
      expect(lines[1]).toContain('"John"');
      expect(lines[1]).toContain('"Doe"');
      expect(lines[1]).toContain('"Mentor"');
      expect(lines[1]).toContain('"Acme, Inc."');
      expect(lines[1]).toContain('"Engineering, Leadership"');

      // Mentee line check with escaped quotes ("Jane ""Jay""")
      expect(lines[2]).toContain('"w-2"');
      expect(lines[2]).toContain('"Jane ""Jay"""');
      expect(lines[2]).toContain('"Mentee"');
      expect(lines[2]).toContain('"3-5 years"');
    });

    it('should return headers only when waitlist is empty', async () => {
      repository.findAllForExport.mockResolvedValue([]);

      const csv = await service.exportCsv();

      expect(csv).toBe(
        '"ID","First Name","Last Name","Email","Audience","Current Role","Company","Expertise","Level of Experience","Location","Created At"',
      );
    });
  });
});
