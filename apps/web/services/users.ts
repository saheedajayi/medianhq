import { apiClient } from "./api-client";

const USERS_PATH = "/users";

export const usersService = {
  updateRole(payload: { role: "MENTEE" | "MENTOR" }) {
    return apiClient.patch<{ role: string }>(
      `${USERS_PATH}/me/role`,
      payload
    );
  },
};
