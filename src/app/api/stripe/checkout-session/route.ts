import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAccountSession } from "@/lib/account-auth";
import { getUnitPriceForVariant } from "@/lib/pricing";
import { getAllProducts } from "@/lib/products";
import { CartLine } from "@/lib/types";
import { getDashboardForAccount } from "@/lib/customer-accounts";
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

  const accountId = await requireAccountSession();
  const dashboard = accountId ? await getDashboardForAccount(accountId) : null;

  let subtotalCents = 0;
  for (const line of lines) {
    const product = lookup.get(line.productId);
    if (!product) continue;
    if (product.isSoldOut) continue;
    const quantity = Math.max(1, Math.min(99, Number(line.quantity) || 1));
    const unitAmount = Math.round(getUnitPriceForVariant(product, line.variantId) * 100);
    subtotalCents += unitAmount * quantity;
  }

  const isFirstOrderOfferEligible = Boolean(
    dashboard?.firstOrderOfferEligible && subtotalCents >= 4500,
  );
  const discountFactor = isFirstOrderOfferEligible ? 0.85 : 1;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of lines) {
    const product = lookup.get(line.productId);
    if (!product) continue;

    const quantity = Math.max(1, Math.min(99, Number(line.quantity) || 1));
    const unitAmount = Math.round(getUnitPriceForVariant(product, line.variantId) * 100 * discountFactor);
    const variantName = product.variants.find((variant) => variant.id === line.variantId)?.name;

    lineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product_data: {
          name: variantName ? `${product.name} (${variantName})` : product.name,
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
    return NextResponse.json({ ok: false, error: "No in-stock products in cart." }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?status=cancel`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    ...(isFirstOrderOfferEligible
      ? {
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: "First order free shipping",
                fixed_amount: { amount: 0, currency: "usd" },
                type: "fixed_amount",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 3 },
                  maximum: { unit: "business_day", value: 7 },
                },
              },
            },
          ],
        }
      : {}),
    metadata: {
      source: "amber-hour-storefront",
      firstOrderOfferApplied: String(isFirstOrderOfferEligible),
      firstOrderOfferThreshold: "45",
    },
  });

  // Store a local snapshot so admin can see newly created Stripe sessions immediately.
  await upsertSyncedStripeOrder(session);

  return NextResponse.json({ ok: true, url: session.url });
}
