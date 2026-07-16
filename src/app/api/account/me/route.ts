import { NextResponse } from "next/server";
import { requireAccountSession } from "@/lib/account-auth";
import { getDashboardForAccount } from "@/lib/customer-accounts";

export async function GET() {
  const accountId = await requireAccountSession();
  if (!accountId) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const dashboard = await getDashboardForAccount(accountId);
  if (!dashboard) {
    return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dashboard });
}
