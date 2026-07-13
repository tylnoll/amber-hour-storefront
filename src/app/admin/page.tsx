"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AdminProfile, Product, StoreData, SyncedStripeOrder } from "@/lib/types";

const blankProduct: Product = {
  id: "",
  slug: "",
  name: "",
  category: "tea",
  shortDescription: "",
  description: "",
  ingredients: [],
  howToUse: "",
  potencyMgCBD: 0,
  thcPercent: "0.00%",
  batchNumber: "",
  coaPdfUrl: "/coas/",
  bestSeller: false,
  recommended: false,
  basePrice: 0,
  imageAlt: "",
  images: [],
  variants: [{ id: "default", name: "Default" }],
};

type State = {
  authed: boolean;
  loading: boolean;
  data: StoreData | null;
  profile: AdminProfile | null;
  stripeConfigured: boolean;
  stripeWebhookConfigured: boolean;
  stripeMode: string;
  stripeOrders: SyncedStripeOrder[];
  stripeError: string;
  editing: Product;
  mode: "create" | "edit";
  message: string;
};

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({
    authed: false,
    loading: true,
    data: null,
    profile: null,
    stripeConfigured: false,
    stripeWebhookConfigured: false,
    stripeMode: "not-configured",
    stripeOrders: [],
    stripeError: "",
    editing: blankProduct,
    mode: "create",
    message: "",
  });

  async function loadStripeStatus() {
    const response = await fetch("/api/admin/stripe/status", { cache: "no-store" });
    if (!response.ok) {
      return {
        configured: false,
        webhookConfigured: false,
        accountMode: "not-configured",
        orders: [] as SyncedStripeOrder[],
        lastError: "",
      };
    }

    return (await response.json()) as {
      ok: boolean;
      configured: boolean;
      webhookConfigured: boolean;
      accountMode: string;
      orders: SyncedStripeOrder[];
      lastError: string;
    };
  }

  const loadStore = useCallback(async () => {
    const response = await fetch("/api/admin/store", { cache: "no-store" });
    if (!response.ok) {
      setState((current) => ({
        ...current,
        authed: false,
        loading: false,
        profile: null,
        stripeConfigured: false,
        stripeWebhookConfigured: false,
        stripeMode: "not-configured",
        stripeOrders: [],
        stripeError: "",
      }));
      return;
    }

    const result = (await response.json()) as { ok: boolean; data: StoreData };

    let profile: AdminProfile | null = null;
    const meResponse = await fetch("/api/admin/me", { cache: "no-store" });
    if (meResponse.ok) {
      const me = (await meResponse.json()) as { ok: boolean; profile: AdminProfile };
      profile = me.profile;
    }

    const stripeStatus = await loadStripeStatus();

    setState((current) => ({
      ...current,
      authed: true,
      loading: false,
      data: result.data,
      profile,
      stripeConfigured: stripeStatus.configured,
      stripeWebhookConfigured: stripeStatus.webhookConfigured,
      stripeMode: stripeStatus.accountMode,
      stripeOrders: stripeStatus.orders,
      stripeError: stripeStatus.lastError,
      message: "",
    }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStore();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStore]);

  const products = useMemo(() => state.data?.products ?? [], [state.data]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((current) => ({ ...current, loading: true, message: "" }));

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setState((current) => ({ ...current, loading: false, message: "Invalid credentials." }));
      return;
    }

    await loadStore();
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state.data) return;

    const form = new FormData(event.currentTarget);
    const nextSettings = {
      announcement: String(form.get("announcement") ?? ""),
      sale: {
        active: form.get("saleActive") === "on",
        percentOff: Number(form.get("percentOff") ?? 0),
        label: String(form.get("saleLabel") ?? ""),
      },
    };

    const response = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateSettings", settings: nextSettings }),
    });

    if (!response.ok) return;
    const result = (await response.json()) as { data: StoreData };
    setState((current) => ({ ...current, data: result.data, message: "Settings updated." }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const product: Product = {
      id: String(form.get("id") || `prod_${Date.now()}`),
      slug: String(form.get("slug") || ""),
      name: String(form.get("name") || ""),
      category: form.get("category") as Product["category"],
      shortDescription: String(form.get("shortDescription") || ""),
      description: String(form.get("description") || ""),
      ingredients: String(form.get("ingredients") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      howToUse: String(form.get("howToUse") || ""),
      potencyMgCBD: Number(form.get("potencyMgCBD") || 0),
      thcPercent: String(form.get("thcPercent") || "0.00%"),
      batchNumber: String(form.get("batchNumber") || ""),
      coaPdfUrl: String(form.get("coaPdfUrl") || ""),
      bestSeller: form.get("bestSeller") === "on",
      recommended: form.get("recommended") === "on",
      basePrice: Number(form.get("basePrice") || 0),
      imageAlt: String(form.get("imageAlt") || ""),
      images: String(form.get("images") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      variants: String(form.get("variants") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [id, name] = line.split("|");
          return {
            id: (id || `variant_${index + 1}`).trim(),
            name: (name || id || "Variant").trim(),
          };
        }),
    };

    const response = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: state.mode === "create" ? "createProduct" : "updateProduct",
        product,
      }),
    });

    if (!response.ok) return;
    const result = (await response.json()) as { data: StoreData };

    setState((current) => ({
      ...current,
      data: result.data,
      editing: blankProduct,
      mode: "create",
      message: state.mode === "create" ? "Product created." : "Product updated.",
    }));
  }

  async function removeProduct(productId: string) {
    const response = await fetch("/api/admin/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteProduct", productId }),
    });

    if (!response.ok) return;
    const result = (await response.json()) as { data: StoreData };
    setState((current) => ({ ...current, data: result.data, message: "Product removed." }));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setState((current) => ({
      ...current,
      authed: false,
      data: null,
      profile: null,
      stripeConfigured: false,
      stripeWebhookConfigured: false,
      stripeMode: "not-configured",
      stripeOrders: [],
      stripeError: "",
      message: "Signed out.",
    }));
  }

  async function syncStripeOrders() {
    const response = await fetch("/api/admin/stripe/sync", { method: "POST" });
    const result = (await response.json()) as {
      ok: boolean;
      synced?: number;
      orders?: SyncedStripeOrder[];
      error?: string;
    };

    if (!response.ok || !result.ok) {
      setState((current) => ({
        ...current,
        stripeError: result.error ?? "Stripe sync failed.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      stripeOrders: result.orders ?? current.stripeOrders,
      stripeError: "",
      message: `Stripe sync complete. ${result.synced ?? 0} sessions synced.`,
    }));
  }

  if (state.loading) {
    return (
      <section className="px-[5vw] py-16">
        <div className="mx-auto w-[min(1000px,100%)]">Loading admin dashboard...</div>
      </section>
    );
  }

  if (!state.authed) {
    return (
      <section className="px-[5vw] py-16">
        <div className="mx-auto w-[min(540px,100%)] rounded-2xl border border-[var(--line)] p-6">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-5xl">Sign in</h1>
          <form className="mt-6 space-y-3" onSubmit={handleLogin}>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
              required
            />
            <button type="submit" className="focus-ring btn-primary px-6 py-3">
              Sign in
            </button>
          </form>
          {state.message && <p className="mt-3 text-sm text-[var(--gold)]">{state.message}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="px-[5vw] py-16">
      <div className="mx-auto w-[min(1200px,100%)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="mt-2 text-6xl">Store control panel</h1>
            <p className="mt-3 text-[var(--cream-dim)]">
              Live product management, pricing, sale control, and site-wide announcements.
            </p>
            {state.profile && (
              <div className="mt-4 rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
                <p>
                  Account: <strong>{state.profile.displayName}</strong>
                </p>
                <p>
                  Username: <strong>{state.profile.username}</strong> · Rank: <strong>{state.profile.rank}</strong>
                </p>
                <p className="mt-1">Roles: {state.profile.roles.join(", ")}</p>
              </div>
            )}
          </div>
          <button type="button" className="focus-ring btn-ghost px-5 py-3" onClick={logout}>
            Sign out
          </button>
        </div>

        {state.message && <p className="mb-4 text-sm text-[var(--gold)]">{state.message}</p>}

        <section className="mb-10 rounded-2xl border border-[var(--line)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl">Stripe connection</h2>
            <button type="button" className="focus-ring btn-ghost px-4 py-2" onClick={syncStripeOrders}>
              Sync with Stripe
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <p className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
              Stripe key: {state.stripeConfigured ? "Connected" : "Not configured"}
            </p>
            <p className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
              Webhook: {state.stripeWebhookConfigured ? "Configured" : "Missing"}
            </p>
            <p className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
              Mode: {state.stripeMode}
            </p>
          </div>

          {state.stripeError && <p className="mt-4 text-sm text-[var(--gold)]">{state.stripeError}</p>}

          <div className="mt-5 space-y-3">
            {state.stripeOrders.length === 0 && (
              <p className="text-sm text-[var(--cream-dim)]">No Stripe orders synced yet.</p>
            )}
            {state.stripeOrders.slice(0, 8).map((order) => (
              <article key={order.sessionId} className="rounded-xl border border-[var(--line)] p-4">
                <p className="font-semibold">Session {order.sessionId}</p>
                <p className="text-sm text-[var(--cream-dim)]">
                  {order.amountTotal.toFixed(2)} {order.currency} · {order.paymentStatus} · {order.checkoutStatus}
                </p>
                <p className="text-sm text-[var(--cream-dim)]">{order.customerEmail || "No email captured"}</p>
              </article>
            ))}
          </div>
        </section>

        {state.data && (
          <form className="mb-10 rounded-2xl border border-[var(--line)] p-6" onSubmit={saveSettings}>
            <h2 className="text-3xl">Store settings</h2>
            <textarea
              name="announcement"
              defaultValue={state.data.settings.announcement}
              placeholder="Site announcement"
              rows={3}
              className="focus-ring mt-4 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="saleActive" defaultChecked={state.data.settings.sale.active} />
                Sale active
              </label>
              <input
                type="number"
                min={0}
                max={90}
                name="percentOff"
                defaultValue={state.data.settings.sale.percentOff}
                className="focus-ring w-36 rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
                placeholder="% off"
              />
              <input
                name="saleLabel"
                defaultValue={state.data.settings.sale.label}
                placeholder="Sale label"
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
              />
            </div>
            <button type="submit" className="focus-ring btn-primary mt-5 px-6 py-3">
              Save settings
            </button>
          </form>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-2xl border border-[var(--line)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl">Products</h2>
              <button
                type="button"
                className="focus-ring btn-ghost px-4 py-2"
                onClick={() => setState((current) => ({ ...current, mode: "create", editing: blankProduct }))}
              >
                New product
              </button>
            </div>
            <div className="space-y-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-[var(--line)] p-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-[var(--cream-dim)]">
                    {product.slug} · ${product.basePrice.toFixed(2)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="focus-ring btn-ghost px-3 py-2 text-sm"
                      onClick={() =>
                        setState((current) => ({ ...current, mode: "edit", editing: product }))
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="focus-ring btn-ghost px-3 py-2 text-sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] p-6">
            <h2 className="text-3xl">{state.mode === "create" ? "Create product" : "Edit product"}</h2>
            <form className="mt-4 grid gap-3" onSubmit={saveProduct}>
              <input name="id" defaultValue={state.editing.id} placeholder="ID" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="slug" defaultValue={state.editing.slug} placeholder="Slug" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="name" defaultValue={state.editing.name} placeholder="Name" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <select name="category" defaultValue={state.editing.category} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2">
                <option value="honey">Honey</option>
                <option value="tea">Tea</option>
                <option value="candles">Candles</option>
                <option value="balms-roll-ons">Balms & Roll-Ons</option>
                <option value="bundles">Bundles</option>
              </select>
              <input name="basePrice" type="number" min={0} step="0.01" defaultValue={state.editing.basePrice} placeholder="Base price" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="potencyMgCBD" type="number" min={0} defaultValue={state.editing.potencyMgCBD} placeholder="Potency mg CBD" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="thcPercent" defaultValue={state.editing.thcPercent} placeholder="THC %" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="batchNumber" defaultValue={state.editing.batchNumber} placeholder="Batch number" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="coaPdfUrl" defaultValue={state.editing.coaPdfUrl} placeholder="COA PDF URL" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="imageAlt" defaultValue={state.editing.imageAlt} placeholder="Image alt" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="shortDescription" defaultValue={state.editing.shortDescription} placeholder="Short description" rows={2} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="description" defaultValue={state.editing.description} placeholder="Full description" rows={3} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="howToUse" defaultValue={state.editing.howToUse} placeholder="How to use" rows={2} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="ingredients" defaultValue={state.editing.ingredients.join("\n")} placeholder="Ingredients, one per line" rows={4} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="images" defaultValue={state.editing.images.join("\n")} placeholder="Image URLs, one per line" rows={3} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <textarea name="variants" defaultValue={state.editing.variants.map((variant) => `${variant.id}|${variant.name}`).join("\n")} placeholder="Variants as id|name, one per line" rows={3} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <label className="flex items-center gap-2">
                <input name="bestSeller" type="checkbox" defaultChecked={state.editing.bestSeller} />
                Best seller
              </label>
              <label className="flex items-center gap-2">
                <input name="recommended" type="checkbox" defaultChecked={state.editing.recommended} />
                Recommended
              </label>
              <button type="submit" className="focus-ring btn-primary mt-2 px-6 py-3">
                {state.mode === "create" ? "Create product" : "Update product"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}
