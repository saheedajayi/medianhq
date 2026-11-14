import { apiClient } from "@/services/api-client";
import type { AuthUser } from "@/services/auth";
import type {
  AcceptAdminInvitePayload,
  AdminInvite,
  AdminInvitePreview,
  CreateAdminInvitePayload,
} from "./types";

const INVITES_PATH = "/admin/invites";
// Opened by the person invited, who has no account yet
const ACCEPT_PATH = "/admin-invites";

export const adminInvitesService = {
  getInvites() {
    return apiClient.get<AdminInvite[]>(INVITES_PATH);
  },
  createInvite(payload: CreateAdminInvitePayload) {
    return apiClient.post<AdminInvite>(INVITES_PATH, payload);
  },
  resendInvite(inviteId: string) {
    return apiClient.post<AdminInvite>(`${INVITES_PATH}/${encodeURIComponent(inviteId)}/resend`);
  },
  revokeInvite(inviteId: string) {
    return apiClient.patch(`${INVITES_PATH}/${encodeURIComponent(inviteId)}/revoke`);
  },
  getInvitePreview(token: string) {
    return apiClient.get<AdminInvitePreview>(`${ACCEPT_PATH}/${encodeURIComponent(token)}`);
  },
  acceptInvite(token: string, payload: AcceptAdminInvitePayload) {
    return apiClient.post<{ user: AuthUser }>(`${ACCEPT_PATH}/${encodeURIComponent(token)}/accept`, payload);
  },
};

export type {
  AcceptAdminInvitePayload,
  AdminInvite,
  AdminInvitePreview,
  AdminRoleValue,
  CreateAdminInvitePayload,
} from "./types";
