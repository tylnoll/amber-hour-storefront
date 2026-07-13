import { NextResponse } from "next/server";
import { getAdminProfile, requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const isAuthed = await requireAdminSession();
  if (!isAuthed) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, profile: getAdminProfile() });
}
