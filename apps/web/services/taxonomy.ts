import { apiClient } from './api-client';

export interface TaxonomyData {
  [industry: string]: string[];
}

export const taxonomyService = {
  getIndustries: async () => {
    const res = await apiClient.get<TaxonomyData>('/taxonomy/industries');
    return res.data;
  },

  createRole: async (industryName: string, roleName: string) => {
    const res = await apiClient.post(`/taxonomy/industries/${encodeURIComponent(industryName)}/roles`, {
      name: roleName,
    });
    return res;
  },
};
