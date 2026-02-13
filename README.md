# Stripe Mini Shop

![Unit Tests](./badges/unit-tests.svg)
[![codecov](https://codecov.io/gh/stupidkubik/Stripe-mini-app/branch/main/graph/badge.svg)](https://codecov.io/gh/stupidkubik/Stripe-mini-app)
![E2E Tests](./badges/e2e-tests.svg)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fstripe-mini-shop.vercel.app&label=vercel&logo=vercel&logoColor=white)](https://stripe-mini-shop-argbouoze-evgeniis-projects-0daccd9a.vercel.app/)
![Node](https://img.shields.io/badge/node-20.x-3c873a?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-16.0.10-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-19.2.3-61dafb?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6?logo=typescript&logoColor=white)

Verdant Lane is a compact e-commerce demo that connects a polished Next.js App Router UI to real Stripe data. It covers the full journey from catalog browsing and an accessible cart to promo-code aware Checkout, webhooks, and a success timeline.

![ScreenRecording2026-01-09at18 58 30-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/89378fd6-0a43-4745-8eaa-ed066c32d2a9)

---

## ✨ Features

- Live product catalog and detail pages rendered from Stripe Products/Prices with ISR caching.
- Persisted cart (Zustand) with quantity controls, toast feedback, theme toggle, and keyboard-friendly interactions.
- Stripe Checkout session creator that validates price IDs, enforces quantity limits, and applies promotion codes server-side.
- Webhook handler that verifies Stripe signatures, records `payment_succeeded` / `payment_failed` events, and surfaces them on the `/success` page.
- Success page includes a timeline plus an itemized order summary (images, quantities, totals, promo code).
- SEO upgrades: dynamic Open Graph image generator, canonical metadata, Twitter cards, and auto-generated `sitemap.xml` + `robots.txt`.
- Test suite with Vitest (unit/UI) and Playwright (E2E) plus reporting helpers.

## 🛠 Tech Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript.
- **Styling/UI**: CSS Modules (modern CSS), shadcn/ui primitives, lucide icons.
- **State & Forms**: Zustand (persisted cart), React Hook Form + Zod validation.
- **Payments**: Stripe Node SDK, Stripe.js, Stripe Webhooks (Edge friendly).
- **Tooling**: ESLint, Prettier, Vitest, React Testing Library, Playwright, Stripe CLI (for webhooks/seed scripts).

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` (Next.js loads it automatically):

```bash
cp .env.example .env.local
```

Then adjust values for your Stripe workspace:

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DEMO_SUCCESS=true
RATE_LIMIT_CHECKOUT_MAX=30
RATE_LIMIT_CHECKOUT_WINDOW_MS=60000
RATE_LIMIT_WEBHOOK_MAX=120
RATE_LIMIT_WEBHOOK_WINDOW_MS=60000
```

> `SITE_URL` is the trusted server-side origin used for Stripe Checkout redirect URLs.
> `DEMO_SUCCESS` is optional and only needed if you want to preview `/success` without a paid session outside of dev.
> `NEXT_PUBLIC_SITE_URL` is still used by metadata/sitemap generation and can match `SITE_URL`.

Optional: seed test products via the helper script.

```bash
npx tsx scripts/seed-stripe.ts
```

### 3. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 and add products to your cart.

### 4. Wire up Stripe webhooks

Use the Stripe CLI to forward events and capture the signing secret:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

### 5. Promotion codes

Create active promotion codes in your Stripe dashboard. Visitors can enter them in the cart; the API verifies the code before attaching it to the Checkout session, while still letting Stripe’s hosted page accept additional codes.

### 6. Preview the success page (demo helper)

Algorithm for viewing a successful payment flow:

1. Complete a Stripe Checkout in test mode and grab the `session_id` from the redirect URL.
2. Open `/success?session_id=YOUR_SESSION_ID&preview=1`.
3. Preview mode is allowed in dev automatically. In prod/staging, set `DEMO_SUCCESS=true`.

```
/success?session_id=cs_test_...&preview=1
```

Without `preview=1`, the session must be paid or you will be redirected to `/cart`.

## ✅ Testing

| Command                      | Description                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `npm run lint`               | ESLint rules (TypeScript-aware)                                               |
| `npm run test:unit`          | Vitest + React Testing Library                                                |
| `npm run test:unit:coverage` | Vitest with v8 coverage reports                                               |
| `npm run test:e2e:smoke`     | Fast Playwright subset (`cart`, `not-found`, `success` redirect checks)      |
| `npm run test:e2e`           | Playwright scenarios (ensure browsers installed via `npx playwright install`) |

Playwright spins up the dev server automatically. Use `npx playwright show-report` to inspect the latest run.

Coverage targets and the list of critical modules are documented in `TESTING.md`.

## 🔐 CI Security Troubleshooting

The CI runs both `npm audit --omit=dev --audit-level=high` and gitleaks scans.

If `npm audit` fails:

1. Confirm whether it affects runtime deps (`--omit=dev` already filters dev tools).
2. Update the vulnerable package and lockfile.
3. Re-run `npm audit --omit=dev --audit-level=high` locally before pushing.

If gitleaks reports a false positive:

1. Verify the value is not a real secret.
2. Replace placeholder-like values with safer non-secret text when possible.
3. If suppression is still needed, add a narrowly scoped allowlist entry in a repository gitleaks config (path + reason), then re-run CI.

## 📁 Key Paths

| Path                               | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `app/api/checkout/route.ts`        | Creates Checkout sessions, validates carts, applies promo codes |
| `app/api/stripe/webhook/route.ts`  | Verifies webhook signatures and logs payment status events      |
| `lib/payment-events.ts`            | In-memory store for payment timeline data used on `/success`    |
| `app/opengraph-image.tsx`          | Dynamic Open Graph preview generator                            |
| `app/sitemap.ts` / `app/robots.ts` | SEO endpoints powered by live Stripe data                       |
| `components/cart/**/*`             | Cart UI, checkout form, and success summary                     |

## 🗒️ Changelog

### 1.1 (Performance & UX polish) — 2026-01-25

- Reduced cart re-renders by caching totals/counts in the store.
- Smoothed catalog rendering with smaller initial batches and stable observer wiring.
- Cached pricing formatter and product metadata helpers to cut repeated work.

### 1.0 (Initial release) — 2025-12-24

- Stripe-powered catalog, product pages, and checkout flow.
- Persisted cart with quantity controls, theme toggle, and toasts.
- Webhooks + success timeline with order summary and promo support.
- SEO metadata with Open Graph, sitemap, and robots endpoints.

## ⚠️ Limitations & Notes

- The payment event log is in-memory; it resets on server restarts and is intended as a demo.
- There is no dedicated database—order metadata lives in Stripe, and cart state persists in the browser via localStorage.
- Product data is cached via Next.js ISR; adding/removing Stripe products may require revalidation or a redeploy to appear instantly.
- Ensure your Stripe test mode has products, prices, and promotion codes before running E2E flows.
- Preview mode only bypasses the paid check; it still fetches the Stripe Checkout session by `session_id`.

## 📦 Deployment

Deploy to Vercel (or any Next.js-compatible host) and set the same environment variables (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`). Add `DEMO_SUCCESS` if you want preview mode outside dev.

Use the Stripe CLI or dashboard to point webhooks at the deployed URL (e.g., `https://yourdomain.com/api/stripe/webhook`).

---

Questions or ideas for improvements are welcome—feel free to open an issue or tweak the roadmap!
