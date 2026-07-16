import { NextResponse } from "next/server";
import { AuthError, login, logout, verifyRequestOrigin } from "@netlify/identity";
import {
  getDashboardForAccount,
  prepareAccountLogin,
  recordAccountLogin,
} from "@/lib/customer-accounts";
import { getClientIpInfoFromRequest } from "@/lib/request-ip";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    verifyRequestOrigin(request);
    const body = (await request.json()) as Body;
    const email = (body.email ?? "").trim();
    const password = body.password ?? "";
    const { ip, source } = getClientIpInfoFromRequest(request);

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    await prepareAccountLogin({ email, ip });
    const user = await login(email, password);

    try {
      await recordAccountLogin({ user, email, ip, ipSource: source });
    } catch (error) {
      await logout().catch(() => undefined);
      throw error;
    }

    const dashboard = await getDashboardForAccount(user.id);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof AuthError && error.status === 401
            ? "Invalid email or password."
            : error instanceof Error
              ? error.message
              : "Login failed.",
      },
      { status: error instanceof AuthError ? (error.status ?? 401) : 401 },
    );
  }
}
