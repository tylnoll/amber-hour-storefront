import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  getStripeClient,
  isStripeConfigured,
  isStripeWebhookConfigured,
  readSyncedStripeOrders,
} from "@/lib/stripe-server";

export async function GET() {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const orders = await readSyncedStripeOrders();

  let accountMode = "not-configured";
  let lastError = "";

  if (isStripeConfigured()) {
    const stripe = getStripeClient();

    try {
      const balance = await stripe?.balance.retrieve();
      accountMode = balance?.livemode ? "live" : "test";
    } catch {
      accountMode = "configured";
      lastError = "Could not fetch Stripe account details.";
    }
  }

  return NextResponse.json({
    ok: true,
    configured: isStripeConfigured(),
    webhookConfigured: isStripeWebhookConfigured(),
    accountMode,
    lastError,
    orders,
  });
}
