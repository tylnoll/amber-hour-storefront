"use client";

import { useState } from "react";

export default function AccountPage() {
  const [points] = useState(4);

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(960px,100%)]">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-6xl">Your profile</h1>
        <p className="mt-4 text-[var(--cream-dim)]">
          This starter uses local UI state. Connect Shopify customer accounts or your auth provider.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-[var(--line)] p-6">
            <h2 className="text-3xl">Sign in / Create account</h2>
            <p className="mt-3 text-[var(--cream-dim)]">
              Enable real auth with your provider in a follow-up pass.
            </p>
            <button className="focus-ring btn-primary mt-4 px-6 py-3">Connect auth</button>
          </section>
          <section className="rounded-2xl border border-[var(--line)] p-6">
            <h2 className="text-3xl">Ritual Points</h2>
            <p className="mt-3 text-[var(--cream-dim)]">
              You have <strong>{points} Joint Points</strong> to redeem.
            </p>
            <p className="mt-2 text-sm text-[var(--cream-dim)]">
              Example rewards: 4 points = free shipping, 8 points = tea refill discount.
            </p>
            <button className="focus-ring btn-ghost mt-4 px-6 py-3">Redeem points</button>
          </section>
        </div>
      </div>
    </section>
  );
}
