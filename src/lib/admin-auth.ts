import crypto from "node:crypto";
import { cookies } from "next/headers";
import { AdminProfile } from "@/lib/types";

const SESSION_COOKIE = "amber_hour_admin";

function getSecret() {
  return process.env.ADMIN_SECRET ?? "change-this-admin-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminToken(username: string) {
  const payload = `${username}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)));
}

export async function setAdminSession(username: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createAdminToken(username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAdminSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !verifyAdminToken(token)) return false;
  return true;
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "amberhour-owner",
    password: process.env.ADMIN_PASSWORD ?? "AmberHour!2026",
  };
}

export function getAdminProfile(): AdminProfile {
  const { username } = getAdminCredentials();

  return {
    username,
    displayName: "Amber Hour Master Admin",
    rank: "Sovereign Owner",
    roles: ["super-admin", "catalog-admin", "pricing-admin", "marketing-admin", "ops-admin"],
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
