import { NextResponse } from "next/server";
import { logout, verifyRequestOrigin } from "@netlify/identity";

export async function POST(request: Request) {
  try {
    verifyRequestOrigin(request);
    await logout();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not sign out." }, { status: 400 });
  }
}
