"use client";

import { FormEvent, useEffect, useState } from "react";
import { CustomerDashboard } from "@/lib/types";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  useEffect(() => {
    async function bootstrap() {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      if (response.ok) {
        const result = (await response.json()) as { ok: boolean; dashboard: CustomerDashboard };
        setDashboard(result.dashboard);
      }
      setLoading(false);
    }

    void bootstrap();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      dashboard?: CustomerDashboard;
      error?: string;
    };

    if (!response.ok || !result.dashboard) {
      setMessage(result.error ?? "Login failed.");
      setSubmitting(false);
      return;
    }

    setDashboard(result.dashboard);
    setMessage("Signed in.");
    setSubmitting(false);
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword,
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      dashboard?: CustomerDashboard;
      error?: string;
    };

    if (!response.ok || !result.dashboard) {
      setMessage(result.error ?? "Could not create account.");
      setSubmitting(false);
      return;
    }

    setDashboard(result.dashboard);
    setMessage("Account created.");
    setSubmitting(false);
  }

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    setDashboard(null);
    setMode("login");
    setMessage("Signed out.");
  }

  if (loading) {
    return (
      <section className="px-[5vw] py-16">
        <div className="mx-auto w-[min(960px,100%)]">Loading account...</div>
      </section>
    );
  }

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(960px,100%)]">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-6xl">Your customer portal</h1>
        <p className="mt-4 text-[var(--cream-dim)]">Manage your account, review orders, and track points.</p>

        {message && <p className="mt-4 text-sm text-[var(--gold)]">{message}</p>}

        {!dashboard && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <section className="rounded-2xl border border-[var(--line)] p-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`focus-ring rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-[var(--gold)] text-[var(--night)]" : "border border-[var(--line)]"}`}
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`focus-ring rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-[var(--gold)] text-[var(--night)]" : "border border-[var(--line)]"}`}
                  onClick={() => setMode("register")}
                >
                  Create account
                </button>
              </div>

              {mode === "login" ? (
                <form className="mt-5 grid gap-3" onSubmit={handleLogin}>
                  <input
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="Email"
                    type="email"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                    required
                  />
                  <input
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="Password"
                    type="password"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                    required
                  />
                  <button type="submit" className="focus-ring btn-primary px-6 py-3" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              ) : (
                <form className="mt-5 grid gap-3" onSubmit={handleRegister}>
                  <input
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    placeholder="Full name"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                    required
                  />
                  <input
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    placeholder="Email"
                    type="email"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                    required
                  />
                  <input
                    value={registerPhone}
                    onChange={(event) => setRegisterPhone(event.target.value)}
                    placeholder="Phone number"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                  />
                  <input
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    placeholder="Password (min 8 chars)"
                    type="password"
                    className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
                    minLength={8}
                    required
                  />
                  <button type="submit" className="focus-ring btn-primary px-6 py-3" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create account"}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--line)] p-6">
              <h2 className="text-3xl">Points rules</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--cream-dim)]">
                <li>1 point for each $10 of paid orders.</li>
                <li>Orders over $100 earn a 5-point bonus.</li>
                <li>Larger ounce variants can earn bonus points.</li>
                <li>New accounts get 15% off the first order over $45 and free shipping.</li>
              </ul>
            </section>
          </div>
        )}

        {dashboard && (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-[var(--line)] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl">Welcome, {dashboard.account.displayName}</h2>
                  <p className="mt-2 text-[var(--cream-dim)]">{dashboard.account.email}</p>
                  <p className="mt-1 text-sm text-[var(--cream-dim)]">Phone: {dashboard.account.phone || "Not set"}</p>
                </div>
                <button type="button" className="focus-ring btn-ghost px-5 py-3" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] p-6">
              <h2 className="text-3xl">Your points</h2>
              <p className="mt-3 text-4xl text-[var(--gold)]">{dashboard.points}</p>
              <p className="mt-2 text-sm text-[var(--cream-dim)]">Total orders: {dashboard.orders.length}</p>
              {dashboard.firstOrderOfferEligible && (
                <p className="mt-3 rounded-xl border border-[var(--line)] bg-[rgba(147,165,131,0.18)] px-4 py-3 text-sm text-[var(--cream)]">
                  First-order offer unlocked: 15% off carts over $45 and free shipping at checkout.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--line)] p-6">
              <h2 className="text-3xl">Past orders</h2>
              <div className="mt-4 space-y-3">
                {dashboard.orders.length === 0 && (
                  <p className="text-[var(--cream-dim)]">No orders found for this account email yet.</p>
                )}
                {dashboard.orders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-[var(--line)] p-4">
                    <p className="font-semibold">Order {order.id}</p>
                    <p className="text-sm text-[var(--cream-dim)]">
                      {new Date(order.createdAt).toLocaleString()} · {order.amountTotal.toFixed(2)} {order.currency}
                    </p>
                    <p className="text-sm text-[var(--cream-dim)]">{order.paymentStatus} · {order.checkoutStatus}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--cream-dim)]">
                      {order.lineItems.map((line, index) => (
                        <li key={`${order.id}-${index}`}>
                          {line.description} x {line.quantity} (${line.amountTotal.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
