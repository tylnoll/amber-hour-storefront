import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "amber_hour_account";
const DEFAULT_SECRET = "change-this-admin-secret";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSecret() {
  const secret = process.env.ACCOUNT_SECRET ?? process.env.ADMIN_SECRET ?? DEFAULT_SECRET;

  if (isProduction() && secret === DEFAULT_SECRET) {
    throw new Error("Set ACCOUNT_SECRET (or ADMIN_SECRET) to a strong secret in production.");
  }

  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createToken(accountId: string) {
  const payload = `${accountId}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const [accountId] = payload.split(":");
  return accountId || null;
}

export async function setAccountSession(accountId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(accountId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAccountSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAccountSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
