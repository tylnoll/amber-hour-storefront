import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { readSyncedStripeOrders, syncLatestStripeSessions } from "@/lib/stripe-server";

export async function POST() {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const synced = await syncLatestStripeSessions(30);
    const orders = await readSyncedStripeOrders();
    return NextResponse.json({ ok: true, synced, orders });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Stripe sync failed." },
      { status: 500 },
    );
  }
}
