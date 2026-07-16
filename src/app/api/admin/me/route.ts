import { NextResponse } from "next/server";
import { getAdminProfile, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const user = await requireAdminSession();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, profile: getAdminProfile(user) });
}
