# Amber Hour Storefront

Amber Hour is a Next.js App Router storefront with a live admin dashboard and Stripe checkout.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
# Single master admin account
ADMIN_USERNAME=amberhour-owner
ADMIN_PASSWORD=AmberHour!2026
ADMIN_SECRET=replace-with-a-long-random-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Start development:

```bash
npm run dev
```

## Admin Dashboard

- Route: `/admin`
- Single master admin account with full roles/rank and full permissions
- Manage live products, pricing, sale campaigns, and site announcements
- Link and sync Stripe orders from inside admin
- Data is stored in `data/store-data.json`

## Stripe Checkout

- Route: `/checkout`
- Checkout Session API: `POST /api/stripe/checkout-session`
- Uses live product pricing from the store data layer
- Webhook endpoint: `POST /api/stripe/webhook`
- Admin Stripe status endpoint: `GET /api/admin/stripe/status`
- Admin Stripe sync endpoint: `POST /api/admin/stripe/sync`

Use Stripe CLI during development:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Validation

```bash
npm run lint
npm run build
```

## Deploy

Deploy to Vercel and set the same environment variables in project settings.
