import { apiClient } from "@/services/api-client";
import type { TaxonomyData } from "./types";

const TAXONOMY_PATH = "/taxonomy";

export const taxonomyService = {
  getIndustries() {
    return apiClient.get<TaxonomyData>(`${TAXONOMY_PATH}/industries`);
  },
  createRole(industryName: string, roleName: string) {
    return apiClient.post(
      `${TAXONOMY_PATH}/industries/${encodeURIComponent(industryName)}/roles`,
      { name: roleName }
    );
  },
};

export type { CreateRolePayload, TaxonomyData } from "./types";
