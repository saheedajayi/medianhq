import { TaxonomyService } from './taxonomy.service';
import { TaxonomyRepository } from './taxonomy.repository';

describe('TaxonomyService', () => {
  let service: TaxonomyService;
  let repository: Record<keyof TaxonomyRepository, jest.Mock>;

  beforeEach(() => {
    repository = {
      findAllIndustriesWithRoles: jest.fn(),
      findIndustryByName: jest.fn(),
      createIndustry: jest.fn(),
      upsertIndustry: jest.fn(),
      createRole: jest.fn(),
      findRoleByNameAndIndustry: jest.fn(),
    };

    service = new TaxonomyService(repository as unknown as TaxonomyRepository);
  });

  describe('getIndustries', () => {
    it('should filter DB industries to allowed 4 industries and populate default roles for Business if missing', async () => {
      repository.findAllIndustriesWithRoles.mockResolvedValue([
        {
          id: 'ind-1',
          name: 'Finance',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [{ id: 'r-1', name: 'Financial Analyst', industryId: 'ind-1', createdAt: new Date(), updatedAt: new Date() }],
        },
        {
          id: 'ind-2',
          name: 'Healthcare', // Not in allowed list
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
        },
        {
          id: 'ind-3',
          name: 'Technology',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [{ id: 'r-2', name: 'Software Engineer', industryId: 'ind-3', createdAt: new Date(), updatedAt: new Date() }],
        },
      ]);

      const res = await service.getIndustries();

      expect(Object.keys(res.data)).toEqual(['Finance', 'Technology', 'Business', 'Consulting']);
      expect(res.data.Finance).toEqual(['Financial Analyst']);
      expect(res.data.Technology).toEqual(['Software Engineer']);
      expect(res.data.Business).toContain('Business Analyst');
      expect(res.data.Business).toContain('Product Manager');
    });

    it('should return empty object structure if no industries found in database', async () => {
      repository.findAllIndustriesWithRoles.mockResolvedValue([]);

      const res = await service.getIndustries();

      expect(Object.keys(res.data)).toEqual(['Finance', 'Technology', 'Business', 'Consulting']);
      expect(res.data.Business).toContain('Business Analyst');
    });
  });
});
