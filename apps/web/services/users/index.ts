import { apiClient } from "@/services/api-client";
import type { UpdateRolePayload, UpdateRoleResponse } from "./types";

const USERS_PATH = "/users";

export const usersService = {
  updateRole(payload: UpdateRolePayload) {
    return apiClient.patch<UpdateRoleResponse>(`${USERS_PATH}/me/role`, payload);
  },
};

export type { UpdateRolePayload, UpdateRoleResponse } from "./types";
