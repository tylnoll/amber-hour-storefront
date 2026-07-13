import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };

  if (!body.email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  // TODO: integrate with Klaviyo/Mailchimp or your newsletter provider.
  return NextResponse.json({ ok: true });
}
