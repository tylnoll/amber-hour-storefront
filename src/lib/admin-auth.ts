import crypto from "node:crypto";
import { cookies } from "next/headers";
import { AdminProfile } from "@/lib/types";

const SESSION_COOKIE = "amber_hour_admin";
const DEFAULT_SECRET = "change-this-admin-secret";
const DEFAULT_USERNAME = "bstoner@amberhourlab.com";
const DEFAULT_PASSWORD = "stoner#1";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSecret() {
  const secret = process.env.ADMIN_SECRET ?? DEFAULT_SECRET;

  if (isProduction() && secret === DEFAULT_SECRET) {
    throw new Error("ADMIN_SECRET must be set to a strong secret in production.");
  }

  return secret;
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
  const expected = sign(payload);
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
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
  const username = process.env.ADMIN_USERNAME ?? DEFAULT_USERNAME;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;

  if (isProduction() && (username === DEFAULT_USERNAME || password === DEFAULT_PASSWORD)) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set to non-default values in production.");
  }

  return { username, password };
}

export function getAdminProfile(): AdminProfile {
  const { username } = getAdminCredentials();

  return {
    username,
    displayName: "Brian Stoner",
    rank: "Founder",
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
