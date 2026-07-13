import Link from "next/link";

export default function BundlePage() {
  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1200px,100%)] rounded-3xl border border-[var(--line)] bg-[linear-gradient(135deg,rgba(196,86,46,0.16),rgba(232,165,75,0.06))] p-8 md:p-12">
        <p className="eyebrow">Gift bundle</p>
        <h1 className="mt-3 text-6xl">Evening Ritual Set</h1>
        <p className="mt-4 max-w-3xl text-[var(--cream-dim)]">
          Tea, candle, roll-on, and honey in one box. Built for gifting and for people who want a
          single checkout to start their full evening ritual.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] p-5">
            <h2 className="text-3xl">What is included</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--cream-dim)]">
              <li>Wind Down Tea - 20-bag tin</li>
              <li>Two-Way Candle - 8 oz cedar and clove</li>
              <li>Roll-On Balm - 10 ml</li>
              <li>Raw CBD Honey - 4 oz</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--line)] p-5">
            <h2 className="text-3xl">Build your own bundle</h2>
            <p className="mt-3 text-[var(--cream-dim)]">
              Swap any item before checkout. For now this storefront uses local cart state; connect
              Shopify bundle variants next.
            </p>
            <Link href="/shop" className="focus-ring btn-primary mt-6 inline-block px-6 py-3">
              Start customizing
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--line)] p-5">
          <h2 className="text-2xl">Gift note</h2>
          <p className="mt-2 text-[var(--cream-dim)]">
            Add a gift note during checkout. In a live Shopify integration, this maps to checkout
            note attributes.
          </p>
        </div>
      </div>
    </section>
  );
}
