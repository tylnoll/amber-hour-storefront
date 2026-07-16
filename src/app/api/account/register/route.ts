import { NextResponse } from "next/server";
import { setAccountSession } from "@/lib/account-auth";
import { getDashboardForAccount, registerAccount } from "@/lib/customer-accounts";
import { getClientIpInfoFromRequest } from "@/lib/request-ip";

type Body = {
  displayName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const displayName = (body.displayName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const password = body.password ?? "";
  const { ip, source } = getClientIpInfoFromRequest(request);

  if (!displayName || !email || !password) {
    return NextResponse.json({ ok: false, error: "Display name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const account = await registerAccount({ displayName, email, phone, password, ip, ipSource: source });
    await setAccountSession(account.id);
    const dashboard = await getDashboardForAccount(account.id);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 },
    );
  }
}
