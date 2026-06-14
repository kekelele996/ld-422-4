import type { User } from "../types/interfaces.ts";
import { memberService } from "../services/member.service.ts";
import type { ProjectMember } from "../types/interfaces.ts";

export const memberController = {
  list(query: URLSearchParams) {
    return memberService.list(query.get("projectId") ?? "");
  },
  listUsers() {
    return memberService.listUsers();
  },
  add(user: User, body: Record<string, unknown>) {
    const projectId = String(body.projectId ?? "");
    const userId = String(body.userId ?? "");
    const role = body.role as ProjectMember["role"];
    return memberService.add(projectId, userId, role, user);
  },
  updateRole(user: User, memberId: string, body: Record<string, unknown>) {
    const role = body.role as ProjectMember["role"];
    return memberService.updateRole(memberId, role, user);
  },
  remove(user: User, memberId: string) {
    return memberService.remove(memberId, user);
  }
};
