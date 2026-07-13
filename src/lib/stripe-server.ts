import fs from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";
import { SyncedStripeOrder } from "@/lib/types";

const stripeSyncPath = path.join(process.cwd(), "data", "stripe-sync.json");

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

async function ensureStripeSyncFile() {
  try {
    await fs.access(stripeSyncPath);
  } catch {
    await fs.mkdir(path.dirname(stripeSyncPath), { recursive: true });
    await fs.writeFile(stripeSyncPath, JSON.stringify({ orders: [] }, null, 2), "utf8");
  }
}

export async function readSyncedStripeOrders() {
  await ensureStripeSyncFile();
  const raw = await fs.readFile(stripeSyncPath, "utf8");
  const parsed = JSON.parse(raw) as { orders: SyncedStripeOrder[] };
  return parsed.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function writeSyncedStripeOrders(orders: SyncedStripeOrder[]) {
  await ensureStripeSyncFile();
  await fs.writeFile(
    stripeSyncPath,
    JSON.stringify({ orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }, null, 2),
    "utf8",
  );
}

function toSyncedOrder(session: Stripe.Checkout.Session): SyncedStripeOrder {
  const lineItems = (session.line_items?.data ?? []).map((line) => ({
    description: line.description ?? "Item",
    quantity: line.quantity ?? 1,
    amountTotal: (line.amount_total ?? 0) / 100,
  }));

  return {
    sessionId: session.id,
    createdAt: new Date(session.created * 1000).toISOString(),
    amountTotal: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "usd").toUpperCase(),
    paymentStatus: session.payment_status ?? "unpaid",
    checkoutStatus: session.status ?? "open",
    customerEmail:
      session.customer_details?.email ??
      session.customer_email ??
      (typeof session.customer === "string" ? session.customer : "") ??
      "",
    mode: session.mode,
    url: session.url ?? "",
    lineItems,
  };
}

export async function upsertSyncedStripeOrder(session: Stripe.Checkout.Session) {
  const nextOrder = toSyncedOrder(session);
  const current = await readSyncedStripeOrders();
  const filtered = current.filter((entry) => entry.sessionId !== nextOrder.sessionId);
  filtered.push(nextOrder);
  await writeSyncedStripeOrders(filtered);
  return nextOrder;
}

export async function syncLatestStripeSessions(limit = 20) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe secret key is not configured.");
  }

  const sessions = await stripe.checkout.sessions.list({
    limit,
    expand: ["data.line_items"],
  });

  for (const session of sessions.data) {
    await upsertSyncedStripeOrder(session);
  }

  return sessions.data.length;
}
