"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { CustomerDashboard } from "@/lib/types";

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { lines } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);

  const estimatedSubtotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const unit = Number(String(line.unitPriceDisplay).replace(/[^0-9.]/g, "")) || 0;
      return sum + unit * line.quantity;
    }, 0);
  }, [lines]);

  const qualifiesForOffer = Boolean(
    dashboard?.firstOrderOfferEligible && estimatedSubtotal >= 45,
  );

  useEffect(() => {
    async function loadAccount() {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      if (!response.ok) return;
      const result = (await response.json()) as { ok: boolean; dashboard?: CustomerDashboard };
      if (result.dashboard) {
        setDashboard(result.dashboard);
      }
    }

    void loadAccount();
  }, []);

  async function startStripeCheckout() {
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
    });

    const result = (await response.json()) as { ok: boolean; url?: string; error?: string };

    if (!response.ok || !result.url) {
      setLoading(false);
      setError(result.error ?? "Could not start checkout.");
      return;
    }

    window.location.href = result.url;
  }

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(760px,100%)] rounded-2xl border border-[var(--line)] p-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 text-5xl">Secure Stripe checkout</h1>
        <p className="mt-4 text-[var(--cream-dim)]">
          Payment is handled by Stripe Checkout for PCI-compliant card processing.
        </p>

        {dashboard?.firstOrderOfferEligible && (
          <p className="mt-4 rounded-xl border border-[var(--line)] bg-[rgba(147,165,131,0.18)] px-4 py-3 text-sm text-[var(--cream)]">
            First-order member offer: 15% off orders over $45 plus free shipping.
            {qualifiesForOffer ? " This cart currently qualifies." : " Add more items to reach $45."}
          </p>
        )}

        {status === "success" && (
          <p className="mt-6 rounded-xl border border-[var(--line)] bg-[rgba(147,165,131,0.2)] px-4 py-3 text-sm text-[var(--cream)]">
            Payment complete. Thank you for your order.
          </p>
        )}

        {status === "cancel" && (
          <p className="mt-6 rounded-xl border border-[var(--line)] bg-[rgba(232,165,75,0.2)] px-4 py-3 text-sm text-[var(--cream)]">
            Checkout was canceled. Your cart is still here.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startStripeCheckout}
            disabled={loading}
            className="focus-ring btn-primary px-6 py-3 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Redirecting..." : "Continue to Stripe"}
          </button>
          <Link href="/cart" className="focus-ring btn-ghost px-6 py-3">
            Back to cart
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-[var(--gold)]">{error}</p>}
      </div>
    </section>
  );
}
