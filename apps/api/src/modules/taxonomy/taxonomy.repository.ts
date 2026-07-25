import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaxonomyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllIndustriesWithRoles() {
    return this.prisma.industry.findMany({
      include: { roles: true },
      orderBy: { name: 'asc' },
    });
  }

  findIndustryByName(name: string) {
    return this.prisma.industry.findUnique({
      where: { name },
    });
  }

  createIndustry(name: string) {
    return this.prisma.industry.create({
      data: { name },
    });
  }

  upsertIndustry(name: string) {
    return this.prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  createRole(industryId: string, name: string) {
    return this.prisma.role.create({
      data: {
        name,
        industryId,
      },
    });
  }

  findRoleByNameAndIndustry(name: string, industryId: string) {
    return this.prisma.role.findUnique({
      where: { name_industryId: { name, industryId } },
    });
  }
}
