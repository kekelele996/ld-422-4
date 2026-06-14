import type { ProjectStatus } from "./enums";
import type { ProjectMemberWithUser } from "./member";

export type ResearchProject = {
  id: string;
  name: string;
  projectNo: string;
  leaderId: string;
  direction: "Biology" | "Chemistry" | "Physics" | "Materials" | "CS" | "Other";
  startedAt: string;
  expectedEndAt: string;
  actualEndAt?: string;
  status: ProjectStatus;
  totalBudget: number;
  usedBudget: number;
};

export type ResearchProjectDetail = ResearchProject & {
  members: ProjectMemberWithUser[];
  timeline: Array<{ id: string; title: string; experimentDate: string }>;
};
