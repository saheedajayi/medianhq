import { Injectable } from '@nestjs/common';
import { TaxonomyRepository } from './taxonomy.repository';

const ALLOWED_INDUSTRIES = new Set(['Finance', 'Technology', 'Business', 'Consulting']);

const DEFAULT_BUSINESS_ROLES = [
  'Business Analyst',
  'Business Development Manager',
  'Entrepreneur / Founder',
  'Product Manager',
  'Operations Manager',
  'Strategy Associate',
  'General Manager',
  'CEO',
];

@Injectable()
export class TaxonomyService {
  constructor(private readonly taxonomyRepository: TaxonomyRepository) {}

  async getIndustries() {
    const industries = await this.taxonomyRepository.findAllIndustriesWithRoles();
    
    // Filter dictionary to only include Finance, Technology, Business, Consulting
    const result: Record<string, string[]> = {
      Finance: [],
      Technology: [],
      Business: DEFAULT_BUSINESS_ROLES,
      Consulting: [],
    };

    for (const ind of industries) {
      if (ALLOWED_INDUSTRIES.has(ind.name)) {
        const roles = ind.roles.map((r: { name: string }) => r.name).sort();
        result[ind.name] = roles.length > 0 ? roles : (result[ind.name] || []);
      }
    }
    
    return { data: result };
  }

  async createIndustry(name: string) {
    const existing = await this.taxonomyRepository.findIndustryByName(name);
    
    if (existing) {
      return existing; // Idempotent
    }
    
    return this.taxonomyRepository.createIndustry(name);
  }

  async createRoleByIndustryName(industryName: string, roleName: string) {
    // Upsert the industry just in case it doesn't exist
    const industry = await this.taxonomyRepository.upsertIndustry(industryName);

    try {
      return await this.taxonomyRepository.createRole(industry.id, roleName);
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already exists
        return this.taxonomyRepository.findRoleByNameAndIndustry(roleName, industry.id);
      }
      throw error;
    }
  }
}
