import { NextResponse } from "next/server";
import { setAccountSession } from "@/lib/account-auth";
import { getDashboardForAccount, loginAccount } from "@/lib/customer-accounts";
import { getClientIpInfoFromRequest } from "@/lib/request-ip";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const { ip, source } = getClientIpInfoFromRequest(request);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required." }, { status: 400 });
  }

  try {
    const account = await loginAccount({ email, password, ip, ipSource: source });
    await setAccountSession(account.id);
    const dashboard = await getDashboardForAccount(account.id);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Login failed." },
      { status: 401 },
    );
  }
}
