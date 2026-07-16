import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getDataDir } from "@/lib/data-path";
import {
  AdminAccountDetail,
  CustomerAccountRecord,
  CustomerAccountSummary,
  CustomerDashboard,
  CustomerOrder,
} from "@/lib/types";
import { readSyncedStripeOrders } from "@/lib/stripe-server";

type AccountsData = {
  users: CustomerAccountRecord[];
  bannedIps: string[];
  bannedPhones: string[];
};

const accountsPath = path.join(getDataDir(), "accounts.json");

async function ensureAccountsFile() {
  try {
    await fs.access(accountsPath);
  } catch {
    const initial: AccountsData = { users: [], bannedIps: [], bannedPhones: [] };
    await fs.mkdir(path.dirname(accountsPath), { recursive: true });
    await fs.writeFile(accountsPath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readAccountsData() {
  await ensureAccountsFile();
  const raw = await fs.readFile(accountsPath, "utf8");
  return JSON.parse(raw) as AccountsData;
}

async function writeAccountsData(data: AccountsData) {
  await ensureAccountsFile();
  await fs.writeFile(accountsPath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

    if (order.amountTotal >= 100) {
      points += 5;
    }

    for (const line of order.lineItems) {
      const match = line.description.match(/(\d+(?:\.\d+)?)\s*oz/i);
      if (match) {
        const oz = Number(match[1]);
        if (oz >= 8) points += 2 * (line.quantity || 1);
      }
    }
  }

  return points;
}

function getEffectivePoints(orders: CustomerOrder[], account: CustomerAccountRecord) {
  const basePoints = getOrderPoints(orders);
  const adjustment = account.pointsAdjustment ?? 0;
  return Math.max(0, basePoints + adjustment);
}

function hasPaidOrders(orders: CustomerOrder[]) {
  return orders.some((order) => order.paymentStatus === "paid");
}

async function getOrdersForEmail(email: string) {
  const normalized = normalizeEmail(email);
  const synced = await readSyncedStripeOrders();

  const orders = synced
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

  return orders;
}

export async function getAccountsSummary() {
  const data = await readAccountsData();
  const summaries: CustomerAccountSummary[] = [];

  for (const user of data.users) {
    const orders = await getOrdersForEmail(user.email);
    const points = getEffectivePoints(orders, user);
    summaries.push({ ...toSummary(user), totalOrders: orders.length, points });
  }

  return {
    accounts: summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    bannedIps: data.bannedIps,
    bannedPhones: data.bannedPhones,
  };
}

export async function registerAccount(input: {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  ip: string;
  ipSource?: string;
}) {
  const data = await readAccountsData();
  const email = normalizeEmail(input.email);
  const phone = input.phone.trim();
  const ip = input.ip.trim();

  if (data.bannedIps.includes(ip)) {
    throw new Error("This network is blocked from creating accounts.");
  }

  if (phone && data.bannedPhones.includes(phone)) {
    throw new Error("This phone number is blocked from creating accounts.");
  }

  if (data.users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  const account: CustomerAccountRecord = {
    id: `acct_${crypto.randomUUID().replace(/-/g, "")}`,
    email,
    displayName: input.displayName.trim(),
    phone,
    passwordHash: hashPassword(input.password, salt),
    passwordSalt: salt,
    createdAt: now,
    updatedAt: now,
    createdIp: ip,
    createdIpSource: input.ipSource || "unknown",
    lastIp: ip,
    lastIpSource: input.ipSource || "unknown",
    lastLoginAt: now,
    banned: false,
  };

  data.users.push(account);
  await writeAccountsData(data);

  return toSummary(account);
}

export async function loginAccount(input: { email: string; password: string; ip: string; ipSource?: string }) {
  const data = await readAccountsData();
  const email = normalizeEmail(input.email);
  const account = data.users.find((entry) => normalizeEmail(entry.email) === email);

  if (!account) {
    throw new Error("Invalid email or password.");
  }

  if (data.bannedIps.includes(input.ip.trim())) {
    throw new Error("This network is blocked.");
  }

  if (account.phone && data.bannedPhones.includes(account.phone)) {
    throw new Error("This account is blocked.");
  }

  if (account.banned) {
    throw new Error(account.banReason || "This account is banned.");
  }

  const computed = hashPassword(input.password, account.passwordSalt);
  if (computed !== account.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  const now = new Date().toISOString();
  account.lastLoginAt = now;
  account.lastIp = input.ip.trim();
  account.lastIpSource = input.ipSource || account.lastIpSource || "unknown";
  account.updatedAt = now;
  await writeAccountsData(data);

  return toSummary(account);
}

export async function getAccountById(accountId: string) {
  const data = await readAccountsData();
  return data.users.find((entry) => entry.id === accountId) ?? null;
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

  const orders = (await getOrdersForEmail(account.email)).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
  const points = getEffectivePoints(orders, account);
  const summary: CustomerAccountSummary = {
    ...toSummary(account),
    points,
    totalOrders: orders.length,
  };

  return {
    account: summary,
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
  const data = await readAccountsData();

  if (action.type === "banIp") {
    const ip = action.ip.trim();
    if (!ip) throw new Error("IP is required.");
    data.bannedIps = action.banned
      ? Array.from(new Set([...data.bannedIps, ip]))
      : data.bannedIps.filter((entry) => entry !== ip);
    await writeAccountsData(data);
    return;
  }

  if (action.type === "banPhone") {
    const phone = action.phone.trim();
    if (!phone) throw new Error("Phone number is required.");
    data.bannedPhones = action.banned
      ? Array.from(new Set([...data.bannedPhones, phone]))
      : data.bannedPhones.filter((entry) => entry !== phone);
    await writeAccountsData(data);
    return;
  }

  const target = data.users.find((entry) => entry.id === action.accountId);
  if (!target) throw new Error("Account not found.");

  if (action.type === "deleteAccount") {
    data.users = data.users.filter((entry) => entry.id !== action.accountId);
    await writeAccountsData(data);
    return;
  }

  if (action.type === "resetPassword") {
    if (action.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }
    const salt = crypto.randomBytes(16).toString("hex");
    target.passwordSalt = salt;
    target.passwordHash = hashPassword(action.newPassword, salt);
    target.updatedAt = new Date().toISOString();
    await writeAccountsData(data);
    return;
  }

  if (action.type === "changeEmail") {
    const nextEmail = normalizeEmail(action.newEmail);
    if (!nextEmail) throw new Error("New email is required.");
    if (
      data.users.some(
        (entry) => entry.id !== action.accountId && normalizeEmail(entry.email) === nextEmail,
      )
    ) {
      throw new Error("Another account already uses this email.");
    }
    target.email = nextEmail;
    target.updatedAt = new Date().toISOString();
    await writeAccountsData(data);
    return;
  }

  if (action.type === "setPoints") {
    if (!Number.isFinite(action.points) || action.points < 0) {
      throw new Error("Points must be a non-negative number.");
    }

    const orders = await getOrdersForEmail(target.email);
    const basePoints = getOrderPoints(orders);
    target.pointsAdjustment = Math.round(action.points) - basePoints;
    target.updatedAt = new Date().toISOString();
    await writeAccountsData(data);
    return;
  }

  target.banned = action.banned;
  target.banReason = action.banned ? action.reason?.trim() || "Banned by employee." : undefined;
  target.updatedAt = new Date().toISOString();
  await writeAccountsData(data);
}
