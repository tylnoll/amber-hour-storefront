import { getUser, type User } from "@netlify/identity";
import { AdminProfile } from "@/lib/types";

const ADMIN_ROLES = new Set(["admin", "super-admin"]);

export function isAdminUser(user: User) {
  return user.role === "admin" || user.roles?.some((role) => ADMIN_ROLES.has(role)) === true;
}

export async function requireAdminSession() {
  const user = await getUser();
  return user && isAdminUser(user) ? user : null;
}

export function getAdminProfile(user: User): AdminProfile {
  const roles = Array.from(new Set([...(user.roles ?? []), ...(user.role ? [user.role] : [])]));

  return {
    username: user.email ?? user.id,
    displayName: user.name ?? user.email?.split("@")[0] ?? "Administrator",
    rank: roles.includes("super-admin") ? "Super Admin" : "Administrator",
    roles,
    permissions: [
      "product:create",
      "product:update",
      "product:delete",
      "price:update",
      "sale:manage",
      "announcement:publish",
      "order:view",
      "settings:manage",
      "admin:full-access",
    ],
  };
}
