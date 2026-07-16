import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { adminUpdateAccount, getAccountsSummary, getAdminAccountDetail } from "@/lib/customer-accounts";

type ActionBody =
  | { action: "resetPassword"; accountId: string; newPassword: string }
  | { action: "changeEmail"; accountId: string; newEmail: string }
  | { action: "deleteAccount"; accountId: string }
  | { action: "setPoints"; accountId: string; points: number }
  | { action: "banAccount"; accountId: string; banned: boolean; reason?: string }
  | { action: "banIp"; ip: string; banned: boolean }
  | { action: "banPhone"; phone: string; banned: boolean };

export async function GET(request: Request) {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (accountId) {
    const detail = await getAdminAccountDetail(accountId);
    if (!detail) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, detail });
  }

  const summary = await getAccountsSummary();
  return NextResponse.json({ ok: true, ...summary });
}

export async function POST(request: Request) {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json()) as ActionBody;

  try {
    if (body.action === "resetPassword") {
      await adminUpdateAccount({ type: "resetPassword", accountId: body.accountId, newPassword: body.newPassword });
    } else if (body.action === "changeEmail") {
      await adminUpdateAccount({ type: "changeEmail", accountId: body.accountId, newEmail: body.newEmail });
    } else if (body.action === "deleteAccount") {
      await adminUpdateAccount({ type: "deleteAccount", accountId: body.accountId });
    } else if (body.action === "setPoints") {
      await adminUpdateAccount({ type: "setPoints", accountId: body.accountId, points: body.points });
    } else if (body.action === "banAccount") {
      await adminUpdateAccount({ type: "banAccount", accountId: body.accountId, banned: body.banned, reason: body.reason });
    } else if (body.action === "banIp") {
      await adminUpdateAccount({ type: "banIp", ip: body.ip, banned: body.banned });
    } else if (body.action === "banPhone") {
      await adminUpdateAccount({ type: "banPhone", phone: body.phone, banned: body.banned });
    } else {
      return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }

    const summary = await getAccountsSummary();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Account action failed." },
      { status: 400 },
    );
  }
}
