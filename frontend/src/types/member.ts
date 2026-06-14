import type { UserRole } from "./enums";

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: "PI" | "SubPI" | "Researcher" | "Student" | "Assistant";
  joinedAt: string;
};

export type ProjectMemberWithUser = ProjectMember & {
  user: { id: string; name: string; role: UserRole };
};

export type ProjectMemberRole = ProjectMember["role"];
