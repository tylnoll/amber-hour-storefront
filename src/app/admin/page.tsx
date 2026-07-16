"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AdminAccountDetail, AdminProfile, CustomerAccountSummary, Product, StoreData, SyncedStripeOrder } from "@/lib/types";
import type { BlogPost } from "@/lib/blog";

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
  inventoryQuantity: 0,
  imageAlt: "",
  images: [],
  variants: [{ id: "default", name: "Default" }],
};

type BlogEditor = {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  content: string;
};

const blankBlog: BlogEditor = {
  slug: "",
  title: "",
  excerpt: "",
  readingTime: "",
  content: "",
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
  blogs: BlogPost[];
  accounts: CustomerAccountSummary[];
  bannedIps: string[];
  bannedPhones: string[];
  editing: Product;
  mode: "create" | "edit";
  message: string;
  accountsMessage: string;
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
    blogs: [],
    accounts: [],
    bannedIps: [],
    bannedPhones: [],
    editing: blankProduct,
    mode: "create",
    message: "",
    accountsMessage: "",
  });

  const [newEmailByAccount, setNewEmailByAccount] = useState<Record<string, string>>({});
  const [newPasswordByAccount, setNewPasswordByAccount] = useState<Record<string, string>>({});
  const [newPointsByAccount, setNewPointsByAccount] = useState<Record<string, string>>({});
  const [banReasonByAccount, setBanReasonByAccount] = useState<Record<string, string>>({});
  const [blogMode, setBlogMode] = useState<"create" | "edit">("create");
  const [blogEditingSlug, setBlogEditingSlug] = useState("");
  const [blogEditor, setBlogEditor] = useState<BlogEditor>(blankBlog);
  const [ipToBan, setIpToBan] = useState("");
  const [phoneToBan, setPhoneToBan] = useState("");
  const [accountQuery, setAccountQuery] = useState("");
  const [accountDetail, setAccountDetail] = useState<AdminAccountDetail | null>(null);
  const [accountDetailLoading, setAccountDetailLoading] = useState(false);
  const reduced = useReducedMotion();

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
        accounts: [],
        bannedIps: [],
        bannedPhones: [],
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
    const blogResponse = await fetch("/api/admin/blog", { cache: "no-store" });
    const accountsResponse = await fetch("/api/admin/accounts", { cache: "no-store" });
    let blogs: BlogPost[] = [];
    let accounts: CustomerAccountSummary[] = [];
    let bannedIps: string[] = [];
    let bannedPhones: string[] = [];

    if (blogResponse.ok) {
      const blogData = (await blogResponse.json()) as { ok: boolean; posts: BlogPost[] };
      blogs = blogData.posts;
    }

    if (accountsResponse.ok) {
      const accountsData = (await accountsResponse.json()) as {
        ok: boolean;
        accounts: CustomerAccountSummary[];
        bannedIps: string[];
        bannedPhones: string[];
      };
      accounts = accountsData.accounts;
      bannedIps = accountsData.bannedIps;
      bannedPhones = accountsData.bannedPhones;
    }

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
      blogs,
      accounts,
      bannedIps,
      bannedPhones,
      message: "",
    }));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStore();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStore]);

  useEffect(() => {
    if (!accountDetail) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountDetail(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [accountDetail]);

  const products = useMemo(() => state.data?.products ?? [], [state.data]);
  const filteredAccounts = useMemo(() => {
    const query = accountQuery.trim().toLowerCase();
    if (!query) return state.accounts;

    return state.accounts.filter((account) =>
      [account.displayName, account.email, account.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [accountQuery, state.accounts]);

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
      lowStockThreshold: Math.max(1, Math.floor(Number(form.get("lowStockThreshold") ?? 5))),
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
    const name = String(form.get("name") || "").trim();
    const slug = String(form.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const generatedId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `prod_${crypto.randomUUID().replace(/-/g, "")}`
        : `prod_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const product: Product = {
      id: String(form.get("id") || generatedId),
      slug,
      name,
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
      inventoryQuantity: Math.max(0, Math.floor(Number(form.get("inventoryQuantity") || 0))),
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
          const [id, name, price] = line.split("|");
          const normalizedPrice = Number(price);
          return {
            id: (id || `variant_${index + 1}`).trim(),
            name: (name || id || "Variant").trim(),
            price: Number.isFinite(normalizedPrice) ? normalizedPrice : undefined,
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

  function editBlog(post: BlogPost) {
    setBlogMode("edit");
    setBlogEditingSlug(post.slug);
    setBlogEditor({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      readingTime: post.readingTime,
      content: post.content.join("\n\n"),
    });
  }

  function resetBlogEditor() {
    setBlogMode("create");
    setBlogEditingSlug("");
    setBlogEditor(blankBlog);
  }

  async function saveBlog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = blogEditor.content
      .split(/\n{2,}/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!blogEditor.title.trim() || !blogEditor.excerpt.trim() || content.length === 0) {
      setState((current) => ({
        ...current,
        message: "Blog title, excerpt, and content are required.",
      }));
      return;
    }

    const payload =
      blogMode === "create"
        ? {
            action: "create",
            post: {
              slug: blogEditor.slug,
              title: blogEditor.title,
              excerpt: blogEditor.excerpt,
              readingTime: blogEditor.readingTime,
              content,
            },
          }
        : {
            action: "update",
            currentSlug: blogEditingSlug,
            post: {
              slug: blogEditor.slug,
              title: blogEditor.title,
              excerpt: blogEditor.excerpt,
              readingTime: blogEditor.readingTime,
              content,
            },
          };

    const response = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { ok: boolean; posts?: BlogPost[]; error?: string };

    if (!response.ok || !result.ok) {
      setState((current) => ({
        ...current,
        message: result.error ?? "Could not save blog post.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      blogs: result.posts ?? current.blogs,
      message: blogMode === "create" ? "Blog post created." : "Blog post updated.",
    }));
    resetBlogEditor();
  }

  async function removeBlog(slug: string) {
    const response = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", slug }),
    });

    const result = (await response.json()) as { ok: boolean; posts?: BlogPost[]; error?: string };

    if (!response.ok || !result.ok) {
      setState((current) => ({
        ...current,
        message: result.error ?? "Could not delete blog post.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      blogs: result.posts ?? current.blogs,
      message: "Blog post deleted.",
    }));

    if (blogEditingSlug === slug) {
      resetBlogEditor();
    }
  }

  async function runAccountAction(body: Record<string, unknown>, successMessage: string) {
    const response = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = (await response.json()) as {
      ok: boolean;
      accounts?: CustomerAccountSummary[];
      bannedIps?: string[];
      bannedPhones?: string[];
      error?: string;
    };

    if (!response.ok || !result.ok) {
      setState((current) => ({
        ...current,
        accountsMessage: result.error ?? "Account action failed.",
      }));
      return;
    }

    setState((current) => ({
      ...current,
      accounts: result.accounts ?? current.accounts,
      bannedIps: result.bannedIps ?? current.bannedIps,
      bannedPhones: result.bannedPhones ?? current.bannedPhones,
      accountsMessage: successMessage,
    }));

    if (accountDetail?.account.id) {
      void openAccountDetail(accountDetail.account.id);
    }
  }

  async function openAccountDetail(accountId: string) {
    setAccountDetailLoading(true);
    const response = await fetch(`/api/admin/accounts?accountId=${encodeURIComponent(accountId)}`, {
      cache: "no-store",
    });

    const result = (await response.json()) as {
      ok: boolean;
      detail?: AdminAccountDetail;
      error?: string;
    };

    if (!response.ok || !result.detail) {
      setState((current) => ({
        ...current,
        accountsMessage: result.error ?? "Could not load account profile.",
      }));
      setAccountDetailLoading(false);
      return;
    }

    setAccountDetail(result.detail);
    setAccountDetailLoading(false);
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
          <h1 className="mt-2 text-5xl">Administrator login</h1>
          <form className="mt-6 space-y-3" onSubmit={handleLogin}>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Admin email"
              type="email"
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
            <p className="eyebrow">Employee dashboard</p>
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
                  Email: <strong>{state.profile.username}</strong> · Rank: <strong>{state.profile.rank}</strong>
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
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/stripe-setup" className="focus-ring btn-ghost px-4 py-2 text-sm">
                Manual setup guide
              </Link>
              <button type="button" className="focus-ring btn-ghost px-4 py-2" onClick={syncStripeOrders}>
                Sync with Stripe
              </button>
            </div>
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
            <div className={state.stripeOrders.length > 3 ? "max-h-80 space-y-3 overflow-y-auto pr-1" : "space-y-3"}>
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
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">Customer accounts</h2>
          <p className="mt-2 text-[var(--cream-dim)]">
            View all customer accounts, reset passwords, override emails, ban accounts, and block IP or phone signups.
          </p>

          <div className="mt-4">
            <input
              value={accountQuery}
              onChange={(event) => setAccountQuery(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3"
            />
          </div>

          {state.accountsMessage && <p className="mt-3 text-sm text-[var(--gold)]">{state.accountsMessage}</p>}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--line)] p-4">
              <p className="font-semibold">Blocked IPs</p>
              <p className="mt-1 text-sm text-[var(--cream-dim)]">{state.bannedIps.join(", ") || "None"}</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={ipToBan}
                  onChange={(event) => setIpToBan(event.target.value)}
                  placeholder="IP address"
                  className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2"
                />
                <button
                  type="button"
                  className="focus-ring btn-ghost px-3 py-2 text-sm"
                  onClick={() => runAccountAction({ action: "banIp", ip: ipToBan, banned: true }, "IP banned.")}
                >
                  Ban
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] p-4">
              <p className="font-semibold">Blocked phones</p>
              <p className="mt-1 text-sm text-[var(--cream-dim)]">{state.bannedPhones.join(", ") || "None"}</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={phoneToBan}
                  onChange={(event) => setPhoneToBan(event.target.value)}
                  placeholder="Phone number"
                  className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2"
                />
                <button
                  type="button"
                  className="focus-ring btn-ghost px-3 py-2 text-sm"
                  onClick={() => runAccountAction({ action: "banPhone", phone: phoneToBan, banned: true }, "Phone banned.")}
                >
                  Ban
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredAccounts.length === 0 && (
              <p className="text-sm text-[var(--cream-dim)]">No customer accounts yet.</p>
            )}
            {filteredAccounts.map((account) => (
              <article key={account.id} className="rounded-xl border border-[var(--line)] p-4">
                <p className="font-semibold">{account.displayName}</p>
                <p className="text-sm text-[var(--cream-dim)]">
                  {account.email} · {account.phone || "No phone"}
                </p>
                <p className="text-sm text-[var(--cream-dim)]">Status: {account.banned ? "Banned" : "Active"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="focus-ring btn-ghost px-3 py-2 text-sm"
                    onClick={() => void openAccountDetail(account.id)}
                  >
                    Open profile
                  </button>
                </div>
              </article>
            ))}
          </div>

          <AnimatePresence>
            {accountDetail && (
              <motion.div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,8,17,0.75)] p-4 sm:p-6"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAccountDetail(null)}
              >
                <motion.div
                  className="flex h-[min(88vh,920px)] w-[min(1040px,100%)] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--night)]"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] bg-[var(--night)] p-5">
                    <div>
                      <h3 className="text-3xl">{accountDetail.account.displayName}</h3>
                      <p className="text-sm text-[var(--cream-dim)]">
                        {accountDetail.account.email} · {accountDetail.account.phone || "No phone"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="focus-ring btn-ghost px-4 py-2 text-sm"
                      onClick={() => setAccountDetail(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    {accountDetailLoading && <p className="text-sm text-[var(--cream-dim)]">Loading profile...</p>}

                    <motion.div
                      className="grid gap-3 md:grid-cols-2"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.03 }}
                    >
                      <p className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
                        Account created IP: {accountDetail.account.createdIp || "unknown"} ({accountDetail.account.createdIpSource || "unknown-source"})
                      </p>
                      <p className="rounded-xl border border-[var(--line)] p-3 text-sm text-[var(--cream-dim)]">
                        Last sign-in IP: {accountDetail.account.lastIp || "unknown"} ({accountDetail.account.lastIpSource || "unknown-source"})
                      </p>
                    </motion.div>

                    <motion.div
                      className="mt-4 grid gap-3 md:grid-cols-3"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.06 }}
                    >
                      <div className="flex gap-2">
                        <input
                          value={newPointsByAccount[accountDetail.account.id] ?? String(accountDetail.account.points)}
                          onChange={(event) =>
                            setNewPointsByAccount((current) => ({ ...current, [accountDetail.account.id]: event.target.value }))
                          }
                          placeholder="Points"
                          type="number"
                          min={0}
                          step={1}
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="focus-ring btn-ghost px-3 py-2 text-sm"
                          onClick={() =>
                            runAccountAction(
                              {
                                action: "setPoints",
                                accountId: accountDetail.account.id,
                                points: Number(newPointsByAccount[accountDetail.account.id] ?? accountDetail.account.points),
                              },
                              "Points updated.",
                            )
                          }
                        >
                          Save
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={newPasswordByAccount[accountDetail.account.id] ?? ""}
                          onChange={(event) =>
                            setNewPasswordByAccount((current) => ({ ...current, [accountDetail.account.id]: event.target.value }))
                          }
                          placeholder="New password"
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="focus-ring btn-ghost px-3 py-2 text-sm"
                          onClick={() =>
                            runAccountAction(
                              {
                                action: "resetPassword",
                                accountId: accountDetail.account.id,
                                newPassword: newPasswordByAccount[accountDetail.account.id] ?? "",
                              },
                              "Password reset override complete.",
                            )
                          }
                        >
                          Reset
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={newEmailByAccount[accountDetail.account.id] ?? ""}
                          onChange={(event) =>
                            setNewEmailByAccount((current) => ({ ...current, [accountDetail.account.id]: event.target.value }))
                          }
                          placeholder="New email"
                          className="focus-ring w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="focus-ring btn-ghost px-3 py-2 text-sm"
                          onClick={() =>
                            runAccountAction(
                              {
                                action: "changeEmail",
                                accountId: accountDetail.account.id,
                                newEmail: newEmailByAccount[accountDetail.account.id] ?? "",
                              },
                              "Email override complete.",
                            )
                          }
                        >
                          Change
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="mt-4 flex flex-wrap gap-2"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.09 }}
                    >
                      <input
                        value={banReasonByAccount[accountDetail.account.id] ?? ""}
                        onChange={(event) =>
                          setBanReasonByAccount((current) => ({ ...current, [accountDetail.account.id]: event.target.value }))
                        }
                        placeholder="Ban reason"
                        className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        className="focus-ring btn-ghost px-3 py-2 text-sm"
                        onClick={() =>
                          runAccountAction(
                            {
                              action: "banAccount",
                              accountId: accountDetail.account.id,
                              banned: !accountDetail.account.banned,
                              reason: banReasonByAccount[accountDetail.account.id] ?? "",
                            },
                            accountDetail.account.banned ? "Account unbanned." : "Account banned.",
                          )
                        }
                      >
                        {accountDetail.account.banned ? "Unban account" : "Ban account"}
                      </button>
                      <button
                        type="button"
                        className="focus-ring btn-ghost px-3 py-2 text-sm"
                        onClick={() => runAccountAction({ action: "deleteAccount", accountId: accountDetail.account.id }, "Account deleted.")}
                      >
                        Delete account
                      </button>
                    </motion.div>

                    <motion.div
                      className="mt-6 grid gap-4 lg:grid-cols-2"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.12 }}
                    >
                      <section className="rounded-xl border border-[var(--line)] p-4">
                        <h4 className="text-xl">Current orders</h4>
                        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                          {accountDetail.orders
                            .filter((order) => order.paymentStatus !== "paid" || order.checkoutStatus === "open")
                            .map((order) => (
                              <article key={order.id} className="rounded-lg border border-[var(--line)] p-3">
                                <p className="text-sm font-semibold">{order.id}</p>
                                <p className="text-xs text-[var(--cream-dim)]">
                                  {order.amountTotal.toFixed(2)} {order.currency} · {order.paymentStatus} · {order.checkoutStatus}
                                </p>
                              </article>
                            ))}
                          {accountDetail.orders.filter((order) => order.paymentStatus !== "paid" || order.checkoutStatus === "open").length === 0 && (
                            <p className="text-sm text-[var(--cream-dim)]">No current orders.</p>
                          )}
                        </div>
                      </section>

                      <section className="rounded-xl border border-[var(--line)] p-4">
                        <h4 className="text-xl">Past orders</h4>
                        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                          {accountDetail.orders
                            .filter((order) => order.paymentStatus === "paid" && order.checkoutStatus !== "open")
                            .map((order) => (
                              <article key={order.id} className="rounded-lg border border-[var(--line)] p-3">
                                <p className="text-sm font-semibold">{order.id}</p>
                                <p className="text-xs text-[var(--cream-dim)]">
                                  {new Date(order.createdAt).toLocaleString()} · {order.amountTotal.toFixed(2)} {order.currency}
                                </p>
                                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-[var(--cream-dim)]">
                                  {order.lineItems.map((line, index) => (
                                    <li key={`${order.id}-${index}`}>
                                      {line.description} x {line.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </article>
                            ))}
                          {accountDetail.orders.filter((order) => order.paymentStatus === "paid" && order.checkoutStatus !== "open").length === 0 && (
                            <p className="text-sm text-[var(--cream-dim)]">No past paid orders.</p>
                          )}
                        </div>
                      </section>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="mb-10 rounded-2xl border border-[var(--line)] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl">Blog manager</h2>
            <button type="button" className="focus-ring btn-ghost px-4 py-2" onClick={resetBlogEditor}>
              New post
            </button>
          </div>
          <p className="mt-2 text-[var(--cream-dim)]">
            Create, edit, and delete blog posts. Changes are saved to local data storage immediately.
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-3">
              {state.blogs.length === 0 && <p className="text-sm text-[var(--cream-dim)]">No blog posts yet.</p>}
              {state.blogs.map((post) => (
                <article key={post.slug} className="rounded-xl border border-[var(--line)] p-4">
                  <p className="font-semibold">{post.title}</p>
                  <p className="mt-1 text-sm text-[var(--cream-dim)]">/{post.slug}</p>
                  <p className="mt-1 text-sm text-[var(--cream-dim)]">
                    Created: {new Date(post.createdAt).toLocaleString()}
                    {post.updatedAt ? ` · (edited) ${new Date(post.updatedAt).toLocaleString()}` : ""}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="focus-ring btn-ghost px-3 py-2 text-sm" onClick={() => editBlog(post)}>
                      Edit
                    </button>
                    <button type="button" className="focus-ring btn-ghost px-3 py-2 text-sm" onClick={() => removeBlog(post.slug)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <form className="grid gap-3 rounded-xl border border-[var(--line)] p-4" onSubmit={saveBlog}>
              <h3 className="text-2xl">{blogMode === "create" ? "Create post" : "Edit post"}</h3>
              <input
                value={blogEditor.title}
                onChange={(event) => setBlogEditor((current) => ({ ...current, title: event.target.value }))}
                placeholder="Title"
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
                required
              />
              <input
                value={blogEditor.slug}
                onChange={(event) => setBlogEditor((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Slug (optional, auto from title)"
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
              />
              <input
                value={blogEditor.readingTime}
                onChange={(event) => setBlogEditor((current) => ({ ...current, readingTime: event.target.value }))}
                placeholder="Reading time (optional)"
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
              />
              <textarea
                value={blogEditor.excerpt}
                onChange={(event) => setBlogEditor((current) => ({ ...current, excerpt: event.target.value }))}
                placeholder="Excerpt"
                rows={2}
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
                required
              />
              <textarea
                value={blogEditor.content}
                onChange={(event) => setBlogEditor((current) => ({ ...current, content: event.target.value }))}
                placeholder="Content paragraphs (separate paragraphs with a blank line)"
                rows={10}
                className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
                required
              />
              <button type="submit" className="focus-ring btn-primary mt-2 px-6 py-3">
                {blogMode === "create" ? "Create post" : "Update post"}
              </button>
            </form>
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
              <input
                type="number"
                min={1}
                max={50}
                name="lowStockThreshold"
                defaultValue={state.data.settings.lowStockThreshold}
                className="focus-ring w-48 rounded-xl border border-[var(--line)] bg-transparent px-4 py-2"
                placeholder="Low stock threshold"
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
              {products.map((product, index) => (
                <article key={index} className="rounded-xl border border-[var(--line)] p-4">
                  {product.images[0] && (
                    <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg border border-[var(--line)]">
                      <Image
                        src={product.images[0]}
                        alt={product.imageAlt || product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-[var(--cream-dim)]">
                    {product.slug} · ${product.basePrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-[var(--cream-dim)]">Qty: {product.inventoryQuantity}</p>
                  {product.inventoryQuantity > 0 && product.inventoryQuantity <= 5 && (
                    <p className="mt-2 inline-block rounded-full border border-red-300/40 bg-red-500/20 px-3 py-1 text-xs text-red-100">
                      Low stock order soon
                    </p>
                  )}
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
            <p className="mt-2 text-sm text-[var(--cream-dim)]">
              Tip: leave Product ID empty to auto-generate. Slug is used in product URLs and should be unique.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={saveProduct}>
              <input name="id" defaultValue={state.editing.id} placeholder="Product ID (optional)" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" />
              <input name="slug" defaultValue={state.editing.slug} placeholder="Slug" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="name" defaultValue={state.editing.name} placeholder="Name" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <select name="category" defaultValue={state.editing.category} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2">
                <option value="honey">Honey</option>
                <option value="tea">Tea</option>
                <option value="candles">Candles</option>
                <option value="balms-roll-ons">Balms & Roll-Ons</option>
              </select>
              <input name="basePrice" type="number" min={0} step="0.01" defaultValue={state.editing.basePrice} placeholder="Base price" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
              <input name="inventoryQuantity" type="number" min={0} step={1} defaultValue={state.editing.inventoryQuantity} placeholder="Inventory quantity" className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
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
              {state.editing.images[0] && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--line)]">
                  <Image
                    src={state.editing.images[0]}
                    alt={state.editing.imageAlt || state.editing.name || "Product preview"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <textarea name="variants" defaultValue={state.editing.variants.map((variant) => `${variant.id}|${variant.name}${variant.price === undefined ? "" : `|${variant.price}`}`).join("\n")} placeholder="Variants as id|name|price (price optional), one per line" rows={3} className="focus-ring rounded-xl border border-[var(--line)] bg-transparent px-4 py-2" required />
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
