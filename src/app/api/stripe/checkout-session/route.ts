import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAllProducts } from "@/lib/products";
import { CartLine } from "@/lib/types";
import { getStripeClient, upsertSyncedStripeOrder } from "@/lib/stripe-server";

type CheckoutBody = {
  lines?: CartLine[];
};

export async function POST(request: Request) {
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { ok: false, error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as CheckoutBody;
  const lines = body.lines ?? [];

  if (lines.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty." }, { status: 400 });
  }

  const products = await getAllProducts();
  const lookup = new Map(products.map((product) => [product.id, product]));

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of lines) {
    const product = lookup.get(line.productId);
    if (!product) continue;

    const quantity = Math.max(1, Math.min(99, Number(line.quantity) || 1));
    const unitAmount = Math.round(product.sortPrice * 100);

    lineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product_data: {
          name: product.name,
          description: product.shortDescription,
          metadata: {
            productId: product.id,
            variantId: line.variantId,
          },
        },
      },
    });
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid products in cart." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?status=cancel`,
    billing_address_collection: "required",
    metadata: {
      source: "amber-hour-storefront",
    },
  });

  // Store a local snapshot so admin can see newly created Stripe sessions immediately.
  await upsertSyncedStripeOrder(session);

  return NextResponse.json({ ok: true, url: session.url });
}
