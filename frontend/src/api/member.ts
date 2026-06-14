import { API_PATHS } from "../constants/apiPaths";
import { request } from "../utils/request";
import type { ProjectMemberRole, ProjectMemberWithUser } from "../types/member";
import type { User } from "../types";

export const memberApi = {
  list: (projectId = "") => request<ProjectMemberWithUser[]>(`${API_PATHS.members}?projectId=${projectId}`),
  listUsers: () => request<User[]>(API_PATHS.users),
  add: (payload: { projectId: string; userId: string; role: ProjectMemberRole }) =>
    request<ProjectMemberWithUser>(API_PATHS.members, { method: "POST", body: JSON.stringify(payload) }),
  updateRole: (memberId: string, role: ProjectMemberRole) =>
    request<ProjectMemberWithUser>(`${API_PATHS.members}/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role })
    }),
  remove: (memberId: string) =>
    request<{ success: boolean }>(`${API_PATHS.members}/${memberId}`, { method: "DELETE" })
};
