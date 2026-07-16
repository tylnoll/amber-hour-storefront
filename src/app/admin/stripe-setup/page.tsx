import Link from "next/link";

const envTemplate = `# Stripe (required)
STRIPE_SECRET_KEY=sk_live_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me`;

const cliCommand = "stripe listen --forward-to localhost:3000/api/stripe/webhook";

export default function StripeSetupPage() {
  return (
    <section className="px-[5vw] py-16">
      <article className="mx-auto w-[min(1000px,100%)] space-y-8">
        <header>
          <p className="eyebrow">Owner guide</p>
          <h1 className="mt-2 text-6xl">Manual Stripe connection</h1>
          <p className="mt-4 text-[var(--cream-dim)]">
            Use this checklist to wire Stripe manually in your local project and production deployment.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">1. Add environment keys</h2>
          <p className="mt-3 text-[var(--cream-dim)]">Create or edit .env.local at the project root and paste:</p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)] bg-black/20 p-4 text-sm leading-6 text-[var(--cream)]">
{envTemplate}
          </pre>
          <p className="mt-3 text-sm text-[var(--cream-dim)]">
            STRIPE_SECRET_KEY should be your live secret key from Stripe Dashboard. STRIPE_WEBHOOK_SECRET is from
            your webhook endpoint or Stripe CLI session.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">2. Verify the files Stripe uses</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--cream-dim)]">
            <li>src/lib/stripe-server.ts: Reads STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.</li>
            <li>src/app/api/stripe/checkout-session/route.ts: Creates Stripe checkout sessions.</li>
            <li>src/app/api/stripe/webhook/route.ts: Verifies webhook signatures and processes events.</li>
            <li>src/app/api/admin/stripe/status/route.ts: Shows owner dashboard connection status.</li>
            <li>src/app/api/admin/stripe/sync/route.ts: Pulls latest Stripe sessions into local order sync.</li>
            <li>data/stripe-sync.json: Stores synced Stripe order snapshots.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">3. Local webhook command</h2>
          <p className="mt-3 text-[var(--cream-dim)]">Run this while developing locally:</p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)] bg-black/20 p-4 text-sm leading-6 text-[var(--cream)]">
{cliCommand}
          </pre>
          <p className="mt-3 text-sm text-[var(--cream-dim)]">
            Copy the whsec value printed by Stripe CLI into STRIPE_WEBHOOK_SECRET in .env.local.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">4. Production hosting settings</h2>
          <p className="mt-3 text-[var(--cream-dim)]">
            Add the same environment variables to your hosting provider. Then create a Stripe webhook endpoint that
            points to /api/stripe/webhook on your live domain.
          </p>
          <p className="mt-3 text-sm text-[var(--cream-dim)]">
            Example endpoint: https://your-domain.com/api/stripe/webhook
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-3xl">5. Final owner check</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--cream-dim)]">
            <li>Open Admin page and confirm Stripe key shows Connected.</li>
            <li>Confirm Webhook shows Configured.</li>
            <li>Run a test checkout and use Sync with Stripe.</li>
            <li>Confirm session appears in Stripe connection list.</li>
          </ul>
          <Link href="/admin" className="focus-ring btn-ghost mt-5 inline-flex px-4 py-2 text-sm">
            Back to owner dashboard
          </Link>
        </section>
      </article>
    </section>
  );
}
