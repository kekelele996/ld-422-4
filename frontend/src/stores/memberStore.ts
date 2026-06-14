import { defineStore } from "pinia";
import { memberApi } from "../api/member";
import type { ProjectMemberRole, ProjectMemberWithUser } from "../types/member";
import type { User } from "../types";

export const useMemberStore = defineStore("members", {
  state: () => ({
    items: [] as ProjectMemberWithUser[],
    users: [] as User[]
  }),
  actions: {
    async load(projectId = "") {
      this.items = await memberApi.list(projectId);
    },
    async loadUsers() {
      this.users = await memberApi.listUsers();
    },
    async add(projectId: string, userId: string, role: ProjectMemberRole) {
      const member = await memberApi.add({ projectId, userId, role });
      this.items.push(member);
      return member;
    },
    async updateRole(memberId: string, role: ProjectMemberRole) {
      const updated = await memberApi.updateRole(memberId, role);
      const index = this.items.findIndex((m) => m.id === memberId);
      if (index !== -1) this.items[index] = updated;
      return updated;
    },
    async remove(memberId: string) {
      await memberApi.remove(memberId);
      this.items = this.items.filter((m) => m.id !== memberId);
    }
  }
});
