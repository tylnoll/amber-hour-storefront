# Local Run And Verify Checklist

Use this checklist when running the storefront locally with full backend features.

## 1) One-time setup

- [ ] Install Node.js 20+ and npm
- [ ] Run `npm install`
- [ ] Ensure `.env.local` exists in project root
- [ ] Run `npm run verify:local-config`

## 2) Required env values in .env.local

- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD`
- [ ] `ADMIN_SECRET` (not default placeholder)
- [ ] `ACCOUNT_SECRET` (not default placeholder)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- [ ] `DATA_DIR` points to a persistent path for production

Recommended:

- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 3) Run quality checks

- [ ] `npm run quality:check`
- [ ] Confirm lint passes
- [ ] Confirm build passes

## 4) Start local app

- [ ] `npm run dev`
- [ ] Open `http://localhost:3000`

Production-like local run:

- [ ] `npm run build`
- [ ] `npm run start`

## 5) Stripe local webhook flow

- [ ] Install Stripe CLI
- [ ] Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Copy `whsec_...` value into `STRIPE_WEBHOOK_SECRET`
- [ ] Restart app after changing env vars

## 6) Feature verification pass

- [ ] Visit `/admin` and log in
- [ ] Update product/settings and verify data persists in `data/store-data.json`
- [ ] Go through checkout and verify Stripe session creation
- [ ] Confirm webhook events sync into `data/stripe-sync.json`
- [ ] Verify `/api/admin/stripe/status` returns configured status

## 7) Fast repeat commands

- [ ] `npm run verify:local-config`
- [ ] `npm run local:verify`
