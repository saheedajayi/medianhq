export interface TaxonomyData {
  [industry: string]: string[];
}

export interface CreateRolePayload {
  industryName: string;
  roleName: string;
}
