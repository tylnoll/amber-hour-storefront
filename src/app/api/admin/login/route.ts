import { NextResponse } from "next/server";
import { getAdminCredentials, setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const credentials = getAdminCredentials();

  if (body.username !== credentials.username || body.password !== credentials.password) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSession(credentials.username);
  return NextResponse.json({ ok: true });
}
