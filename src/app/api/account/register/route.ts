import { NextResponse } from "next/server";
import { admin, AuthError, signup, verifyRequestOrigin } from "@netlify/identity";
import {
  assertSignupAllowed,
  createAccountProfile,
  getDashboardForAccount,
} from "@/lib/customer-accounts";
import { getClientIpInfoFromRequest } from "@/lib/request-ip";

type Body = {
  displayName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    verifyRequestOrigin(request);
    const body = (await request.json()) as Body;
    const displayName = (body.displayName ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const password = body.password ?? "";
    const { ip, source } = getClientIpInfoFromRequest(request);

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Display name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    await assertSignupAllowed({ ip, phone });
    const user = await signup(email, password, { full_name: displayName, phone });

    try {
      await createAccountProfile({ user, displayName, email, phone, ip, ipSource: source });
    } catch (error) {
      await admin.deleteUser(user.id).catch(() => undefined);
      throw error;
    }

    const requiresConfirmation = !user.confirmedAt;
    const dashboard = requiresConfirmation ? null : await getDashboardForAccount(user.id);
    return NextResponse.json({ ok: true, dashboard, requiresConfirmation });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof AuthError && error.status === 403
            ? "Account registration is currently unavailable."
            : error instanceof Error
              ? error.message
              : "Could not create account.",
      },
      { status: error instanceof AuthError ? (error.status ?? 400) : 400 },
    );
  }
}
