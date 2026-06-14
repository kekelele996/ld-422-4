import { defineStore } from "pinia";
import { projectApi } from "../api/project";
import type { ResearchProject, ResearchProjectDetail } from "../types/project";

export const useProjectStore = defineStore("projects", {
  state: () => ({
    items: [] as ResearchProject[],
    current: null as ResearchProjectDetail | null
  }),
  actions: {
    async load(status = "") {
      this.items = await projectApi.list(status);
    },
    async loadDetail(id: string) {
      this.current = await projectApi.detail(id);
      return this.current;
    },
    async create(payload: Partial<ResearchProject>) {
      const project = await projectApi.create(payload);
      this.items.unshift(project);
      return project;
    }
  }
});
