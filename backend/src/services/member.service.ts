import { members, projects, users } from "../prisma/seeds/seed.ts";
import type { ProjectMember, User } from "../types/interfaces.ts";
import { ApiError } from "../utils/response.ts";

export const memberService = {
  list(projectId = "") {
    return members.filter((member) => !projectId || member.projectId === projectId).map((member) => ({
      ...member,
      user: users.find((user) => user.id === member.userId)
    }));
  },

  listUsers() {
    return users;
  },

  add(projectId: string, userId: string, role: ProjectMember["role"], currentUser: User) {
    const project = projects.find((p) => p.id === projectId);
    if (!project) throw new ApiError(404, "PROJECT_NOT_FOUND", "项目不存在");
    if (project.leaderId !== currentUser.id && currentUser.role !== "Admin") {
      throw new ApiError(403, "FORBIDDEN", "只有项目负责人或管理员可以添加成员");
    }

    const user = users.find((u) => u.id === userId);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "用户不存在");

    const existing = members.find((m) => m.projectId === projectId && m.userId === userId);
    if (existing) throw new ApiError(400, "MEMBER_EXISTS", "该用户已是项目成员");

    const member: ProjectMember = {
      id: `mb-${Date.now()}`,
      projectId,
      userId,
      role,
      joinedAt: new Date().toISOString().slice(0, 10)
    };
    members.push(member);
    return { ...member, user };
  },

  updateRole(memberId: string, role: ProjectMember["role"], currentUser: User) {
    const member = members.find((m) => m.id === memberId);
    if (!member) throw new ApiError(404, "MEMBER_NOT_FOUND", "成员不存在");

    const project = projects.find((p) => p.id === member.projectId);
    if (!project) throw new ApiError(404, "PROJECT_NOT_FOUND", "项目不存在");
    if (project.leaderId !== currentUser.id && currentUser.role !== "Admin") {
      throw new ApiError(403, "FORBIDDEN", "只有项目负责人或管理员可以调整角色");
    }

    member.role = role;
    return { ...member, user: users.find((u) => u.id === member.userId) };
  },

  remove(memberId: string, currentUser: User) {
    const index = members.findIndex((m) => m.id === memberId);
    if (index === -1) throw new ApiError(404, "MEMBER_NOT_FOUND", "成员不存在");

    const member = members[index];
    const project = projects.find((p) => p.id === member.projectId);
    if (!project) throw new ApiError(404, "PROJECT_NOT_FOUND", "项目不存在");
    if (project.leaderId !== currentUser.id && currentUser.role !== "Admin") {
      throw new ApiError(403, "FORBIDDEN", "只有项目负责人或管理员可以移除成员");
    }

    members.splice(index, 1);
    return { success: true };
  }
};
