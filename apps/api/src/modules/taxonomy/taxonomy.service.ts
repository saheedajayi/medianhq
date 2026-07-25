import { Injectable } from '@nestjs/common';
import { TaxonomyRepository } from './taxonomy.repository';

@Injectable()
export class TaxonomyService {
  constructor(private readonly taxonomyRepository: TaxonomyRepository) {}

  async getIndustries() {
    const industries = await this.taxonomyRepository.findAllIndustriesWithRoles();
    
    // Transform to a dictionary for the frontend { "Technology": ["Role1", "Role2"] }
    const result: Record<string, string[]> = {};
    for (const ind of industries) {
      result[ind.name] = ind.roles.map(r => r.name).sort();
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
