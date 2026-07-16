import { NextResponse } from "next/server";
import { AuthError, login, logout, verifyRequestOrigin } from "@netlify/identity";
import { isAdminUser } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    verifyRequestOrigin(request);
    const body = (await request.json()) as { username?: string; password?: string };
    const email = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
    }

    const user = await login(email, password);

    if (!isAdminUser(user)) {
      await logout().catch(() => undefined);
      return NextResponse.json({ ok: false, error: "This account is not an administrator." }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof AuthError && error.status === 401
            ? "Invalid email or password."
            : "Admin login failed.",
      },
      { status: error instanceof AuthError ? (error.status ?? 401) : 401 },
    );
  }
}
