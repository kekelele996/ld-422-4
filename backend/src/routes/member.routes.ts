import { memberController } from "../controllers/member.controller.ts";
import type { User } from "../types/interfaces.ts";

export function memberRoutes(
  method: string,
  path: string,
  query: URLSearchParams,
  user?: User,
  body: Record<string, unknown> = {}
) {
  if (method === "GET" && path === "/api/members") return memberController.list(query);
  if (method === "GET" && path === "/api/users") return memberController.listUsers();
  if (method === "POST" && path === "/api/members") return memberController.add(user as User, body);
  if (method === "PATCH" && path.startsWith("/api/members/")) {
    const memberId = path.split("/").at(-1) ?? "";
    return memberController.updateRole(user as User, memberId, body);
  }
  if (method === "DELETE" && path.startsWith("/api/members/")) {
    const memberId = path.split("/").at(-1) ?? "";
    return memberController.remove(user as User, memberId);
  }
  return undefined;
}
