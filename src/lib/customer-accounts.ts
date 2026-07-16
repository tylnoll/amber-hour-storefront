import { admin, type User } from "@netlify/identity";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { blockedSignups, customerProfiles } from "../../db/schema";
import {
  AdminAccountDetail,
  CustomerAccountRecord,
  CustomerAccountSummary,
  CustomerDashboard,
  CustomerOrder,
} from "@/lib/types";
import { readSyncedStripeOrders } from "@/lib/stripe-server";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toRecord(profile: typeof customerProfiles.$inferSelect): CustomerAccountRecord {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    phone: profile.phone,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    lastLoginAt: profile.lastLoginAt ?? undefined,
    createdIp: profile.createdIp,
    createdIpSource: profile.createdIpSource ?? undefined,
    lastIp: profile.lastIp ?? undefined,
    lastIpSource: profile.lastIpSource ?? undefined,
    pointsAdjustment: profile.pointsAdjustment,
    banned: profile.banned,
    banReason: profile.banReason ?? undefined,
  };
}

function toSummary(account: CustomerAccountRecord): CustomerAccountSummary {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    phone: account.phone,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    lastLoginAt: account.lastLoginAt,
    createdIp: account.createdIp,
    createdIpSource: account.createdIpSource,
    lastIp: account.lastIp,
    lastIpSource: account.lastIpSource,
    banned: account.banned,
    banReason: account.banReason,
    points: 0,
    totalOrders: 0,
  };
}

function getOrderPoints(orders: CustomerOrder[]) {
  let points = 0;

  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    points += Math.floor(order.amountTotal / 10);

    if (order.amountTotal >= 100) points += 5;

    for (const line of order.lineItems) {
      const match = line.description.match(/(\d+(?:\.\d+)?)\s*oz/i);
      if (match && Number(match[1]) >= 8) points += 2 * (line.quantity || 1);
    }
  }

  return points;
}

function getEffectivePoints(orders: CustomerOrder[], account: CustomerAccountRecord) {
  return Math.max(0, getOrderPoints(orders) + (account.pointsAdjustment ?? 0));
}

function hasPaidOrders(orders: CustomerOrder[]) {
  return orders.some((order) => order.paymentStatus === "paid");
}

async function getOrdersForEmail(email: string) {
  const normalized = normalizeEmail(email);
  const synced = await readSyncedStripeOrders();

  return synced
    .filter((entry) => normalizeEmail(entry.customerEmail) === normalized)
    .map(
      (entry): CustomerOrder => ({
        id: entry.sessionId,
        createdAt: entry.createdAt,
        amountTotal: entry.amountTotal,
        currency: entry.currency,
        paymentStatus: entry.paymentStatus,
        checkoutStatus: entry.checkoutStatus,
        lineItems: entry.lineItems,
      }),
    );
}

async function getBlockedValues(kind: "ip" | "phone") {
  const rows = await db
    .select({ value: blockedSignups.value })
    .from(blockedSignups)
    .where(eq(blockedSignups.kind, kind));
  return rows.map((row) => row.value);
}

export async function assertSignupAllowed(input: { ip: string; phone: string }) {
  const ip = input.ip.trim();
  const phone = input.phone.trim();
  const [blockedIp] = ip
    ? await db
        .select({ value: blockedSignups.value })
        .from(blockedSignups)
        .where(and(eq(blockedSignups.kind, "ip"), eq(blockedSignups.value, ip)))
        .limit(1)
    : [];

  if (blockedIp) throw new Error("This network is blocked from creating accounts.");

  const [blockedPhone] = phone
    ? await db
        .select({ value: blockedSignups.value })
        .from(blockedSignups)
        .where(and(eq(blockedSignups.kind, "phone"), eq(blockedSignups.value, phone)))
        .limit(1)
    : [];

  if (blockedPhone) throw new Error("This phone number is blocked from creating accounts.");
}

export async function createAccountProfile(input: {
  user: User;
  displayName: string;
  email: string;
  phone: string;
  ip: string;
  ipSource?: string;
}) {
  const now = new Date().toISOString();
  const [profile] = await db
    .insert(customerProfiles)
    .values({
      id: input.user.id,
      email: normalizeEmail(input.user.email ?? input.email),
      displayName: input.displayName.trim(),
      phone: input.phone.trim(),
      createdAt: input.user.createdAt ?? now,
      updatedAt: now,
      lastLoginAt: input.user.confirmedAt ? now : null,
      createdIp: input.ip.trim(),
      createdIpSource: input.ipSource ?? "unknown",
      lastIp: input.ip.trim(),
      lastIpSource: input.ipSource ?? "unknown",
    })
    .returning();

  return toSummary(toRecord(profile));
}

export async function prepareAccountLogin(input: { email: string; ip: string }) {
  const email = normalizeEmail(input.email);
  const [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.email, email)).limit(1);

  if (input.ip.trim()) {
    const [blockedIp] = await db
      .select({ value: blockedSignups.value })
      .from(blockedSignups)
      .where(and(eq(blockedSignups.kind, "ip"), eq(blockedSignups.value, input.ip.trim())))
      .limit(1);
    if (blockedIp) throw new Error("This network is blocked.");
  }

  if (profile?.phone) {
    const [blockedPhone] = await db
      .select({ value: blockedSignups.value })
      .from(blockedSignups)
      .where(and(eq(blockedSignups.kind, "phone"), eq(blockedSignups.value, profile.phone)))
      .limit(1);
    if (blockedPhone) throw new Error("This account is blocked.");
  }

  if (profile?.banned) throw new Error(profile.banReason || "This account is banned.");
}

export async function recordAccountLogin(input: {
  user: User;
  email: string;
  ip: string;
  ipSource?: string;
}) {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.user.email ?? input.email);
  const displayName = input.user.name ?? email.split("@")[0];
  const phone = typeof input.user.userMetadata?.phone === "string" ? input.user.userMetadata.phone : "";

  await db
    .insert(customerProfiles)
    .values({
      id: input.user.id,
      email,
      displayName,
      phone,
      createdAt: input.user.createdAt ?? now,
      updatedAt: now,
      lastLoginAt: now,
      createdIp: input.ip.trim(),
      createdIpSource: input.ipSource ?? "unknown",
      lastIp: input.ip.trim(),
      lastIpSource: input.ipSource ?? "unknown",
    })
    .onConflictDoUpdate({
      target: customerProfiles.id,
      set: {
        email,
        updatedAt: now,
        lastLoginAt: now,
        lastIp: input.ip.trim(),
        lastIpSource: input.ipSource ?? "unknown",
      },
    });
}

export async function getAccountsSummary() {
  const profiles = await db.select().from(customerProfiles).orderBy(desc(customerProfiles.createdAt));
  const summaries: CustomerAccountSummary[] = [];

  for (const profile of profiles) {
    const account = toRecord(profile);
    const orders = await getOrdersForEmail(account.email);
    summaries.push({
      ...toSummary(account),
      totalOrders: orders.length,
      points: getEffectivePoints(orders, account),
    });
  }

  return {
    accounts: summaries,
    bannedIps: await getBlockedValues("ip"),
    bannedPhones: await getBlockedValues("phone"),
  };
}

export async function getAccountById(accountId: string) {
  const [profile] = await db.select().from(customerProfiles).where(eq(customerProfiles.id, accountId)).limit(1);
  return profile ? toRecord(profile) : null;
}

export async function getDashboardForAccount(accountId: string): Promise<CustomerDashboard | null> {
  const account = await getAccountById(accountId);
  if (!account) return null;

  const orders = await getOrdersForEmail(account.email);
  const points = getEffectivePoints(orders, account);

  return {
    account: { ...toSummary(account), points, totalOrders: orders.length },
    orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    points,
    firstOrderOfferEligible: !hasPaidOrders(orders),
  };
}

export async function getAdminAccountDetail(accountId: string): Promise<AdminAccountDetail | null> {
  const account = await getAccountById(accountId);
  if (!account) return null;

  const orders = await getOrdersForEmail(account.email);
  const points = getEffectivePoints(orders, account);

  return {
    account: { ...toSummary(account), points, totalOrders: orders.length },
    orders,
    pointsAdjustment: account.pointsAdjustment ?? 0,
    firstOrderOfferEligible: !hasPaidOrders(orders),
  };
}

export async function adminUpdateAccount(action:
  | { type: "resetPassword"; accountId: string; newPassword: string }
  | { type: "changeEmail"; accountId: string; newEmail: string }
  | { type: "deleteAccount"; accountId: string }
  | { type: "setPoints"; accountId: string; points: number }
  | { type: "banAccount"; accountId: string; banned: boolean; reason?: string }
  | { type: "banIp"; ip: string; banned: boolean }
  | { type: "banPhone"; phone: string; banned: boolean }) {
  if (action.type === "banIp" || action.type === "banPhone") {
    const kind = action.type === "banIp" ? "ip" : "phone";
    const value = (action.type === "banIp" ? action.ip : action.phone).trim();
    if (!value) throw new Error(kind === "ip" ? "IP is required." : "Phone number is required.");

    if (action.banned) {
      await db
        .insert(blockedSignups)
        .values({ kind, value, createdAt: new Date().toISOString() })
        .onConflictDoNothing();
    } else {
      await db
        .delete(blockedSignups)
        .where(and(eq(blockedSignups.kind, kind), eq(blockedSignups.value, value)));
    }
    return;
  }

  const account = await getAccountById(action.accountId);
  if (!account) throw new Error("Account not found.");

  if (action.type === "deleteAccount") {
    await admin.deleteUser(action.accountId);
    await db.delete(customerProfiles).where(eq(customerProfiles.id, action.accountId));
    return;
  }

  if (action.type === "resetPassword") {
    if (action.newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
    await admin.updateUser(action.accountId, { password: action.newPassword });
    return;
  }

  const updatedAt = new Date().toISOString();

  if (action.type === "changeEmail") {
    const email = normalizeEmail(action.newEmail);
    if (!email) throw new Error("New email is required.");
    await admin.updateUser(action.accountId, { email, confirm: true });
    await db.update(customerProfiles).set({ email, updatedAt }).where(eq(customerProfiles.id, action.accountId));
    return;
  }

  if (action.type === "setPoints") {
    if (!Number.isFinite(action.points) || action.points < 0) {
      throw new Error("Points must be a non-negative number.");
    }
    const orders = await getOrdersForEmail(account.email);
    const pointsAdjustment = Math.round(action.points) - getOrderPoints(orders);
    await db
      .update(customerProfiles)
      .set({ pointsAdjustment, updatedAt })
      .where(eq(customerProfiles.id, action.accountId));
    return;
  }

  await db
    .update(customerProfiles)
    .set({
      banned: action.banned,
      banReason: action.banned ? action.reason?.trim() || "Banned by administrator." : null,
      updatedAt,
    })
    .where(eq(customerProfiles.id, action.accountId));
}
