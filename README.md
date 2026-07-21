# Stripe Mini Shop

![Unit Tests](./badges/unit-tests.svg)
[![codecov](https://codecov.io/gh/stupidkubik/Stripe-mini-app/branch/main/graph/badge.svg)](https://codecov.io/gh/stupidkubik/Stripe-mini-app)
![E2E Tests](./badges/e2e-tests.svg)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fstripe-mini-shop.vercel.app&label=vercel&logo=vercel&logoColor=white)](https://stripe-mini-shop-argbouoze-evgeniis-projects-0daccd9a.vercel.app/)
![Node](https://img.shields.io/badge/node-20.x-3c873a?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-16.2.10-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-19.2.3-61dafb?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6?logo=typescript&logoColor=white)

Verdant Lane is a compact e-commerce demo that connects a polished Next.js App Router UI to real Stripe data. It covers the full journey from catalog browsing and an accessible cart to promo-code aware Checkout, webhooks, and a success timeline.

![ScreenRecording2026-01-09at18 58 30-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/89378fd6-0a43-4745-8eaa-ed066c32d2a9)

---

## ✨ Features

- Live product catalog and detail pages rendered from Stripe Products/Prices with ISR caching.
- Persisted cart (Zustand) with quantity controls, toast feedback, theme toggle, and keyboard-friendly interactions.
- Stripe Checkout session creator that accepts only each active product's default price, enforces cart/quantity limits, and applies approved promotion codes server-side.
- Webhook handler that verifies Stripe signatures and transactionally records idempotent payment events, monotonic order state, and an outbox job in Postgres.
- Success page verifies a per-session signed receipt cookie before loading the itemized order summary (images, quantities, totals, promo code).
- SEO upgrades: dynamic Open Graph image generator, canonical metadata, Twitter cards, and auto-generated `sitemap.xml` + `robots.txt`.
- Test suite with Vitest (unit/UI) and Playwright (E2E) plus reporting helpers.

## 🛠 Tech Stack

- **Framework**: Next.js 16 App Router, React 19, TypeScript.
- **Styling/UI**: CSS Modules (modern CSS), shadcn/ui primitives, lucide icons.
- **State & Forms**: Zustand (persisted cart), React Hook Form + Zod validation.
- **Payments**: Stripe Node SDK, Stripe.js, Stripe Webhooks (Node.js runtime).
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
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STOREFRONT_CURRENCY=USD
DEMO_SUCCESS=true
RATE_LIMIT_CHECKOUT_MAX=30
RATE_LIMIT_CHECKOUT_WINDOW_MS=60000
STRIPE_API_BUDGET_MAX=300
STRIPE_API_BUDGET_WINDOW_MS=60000
CHECKOUT_MAX_BODY_BYTES=16384
STRIPE_WEBHOOK_MAX_BODY_BYTES=1048576
```

> `SITE_URL` is the trusted server-side origin used for Stripe Checkout redirect URLs.
> `DEMO_SUCCESS` is optional and only needed if you want to preview `/success` without a paid session outside of dev.
> `NEXT_PUBLIC_SITE_URL` is still used by metadata/sitemap generation and can match `SITE_URL`.
> `DATABASE_URL` is required only when processing payment webhooks; builds do not connect to it.
> On Vercel or Cloudflare Pages, the platform sets the source-IP environment
> flag used by the local defense-in-depth limiter. For multi-instance
> production, enable a shared edge/WAF rate limit on `/api/checkout`; the local
> limiter and Stripe API budget do not replace that shared boundary.

### Production abuse controls on Vercel

The deployed project uses Vercel. Following the
[Vercel WAF rate-limiting guide](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting),
open **Project → Firewall** and create a rule for
`POST /api/checkout`, keyed by IP, starting in Log mode and then enforcing a
fixed-window 429 after traffic has been observed. Start with 10 requests per
minute per IP and tune from production metrics. Keep Vercel's system DDoS
mitigation enabled.

Do not apply the Checkout's strict per-IP rule to `/api/stripe/webhook`: Stripe
deliveries are authenticated by their raw-body signature and can arrive in
bursts or retries. Stripe requires the
[unmodified raw body](https://docs.stripe.com/webhooks/signature?lang=node) for
signature verification. The route rejects missing signatures before reading the body
and caps signed payloads at `STRIPE_WEBHOOK_MAX_BODY_BYTES`. If a separate
webhook WAF rule is added, first run it in Log mode and use a limit high enough
not to discard legitimate deliveries.

Optional: seed test products via the helper script.

```bash
npx tsx scripts/seed-stripe.ts
```

### 3. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 and add products to your cart.

### 4. Configure durable order storage

Provision a Postgres database through the
[Vercel Storage Marketplace](https://vercel.com/docs/marketplace-storage) (the
Neon free plan is sufficient for this demo) and connect it to the project so
Vercel injects `DATABASE_URL`. For local webhook development, pull or copy that
connection string into `.env.local`. On the first signed payment webhook, the
application creates the `stripe_events`, `orders`, and `order_outbox` tables
with `CREATE TABLE IF NOT EXISTS`.

### 5. Wire up Stripe webhooks

Use the Stripe CLI to forward events and capture the signing secret:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

### 6. Promotion codes

Create active promotion codes in your Stripe dashboard. Visitors can enter them in the cart; the API verifies a code before attaching it to the Checkout session. Stripe Checkout itself does not accept additional, unapproved codes.

### 7. Preview the success page (demo helper)

Algorithm for viewing a successful payment flow:

1. Complete a Stripe Checkout in test mode and grab the `session_id` from the redirect URL.
2. Open `/success?session_id=YOUR_SESSION_ID&preview=1`.
3. Preview mode is allowed in dev automatically. In prod/staging, set `DEMO_SUCCESS=true`.

```
/success?session_id=cs_test_...&preview=1
```

Without `preview=1`, the session must be paid and the browser must hold the matching signed receipt cookie created when it started Checkout; otherwise the app redirects to `/cart` without contacting Stripe.

## ✅ Testing

| Command                      | Description                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `npm run lint`               | ESLint rules (TypeScript-aware)                                               |
| `npm run test:unit`          | Vitest + React Testing Library                                                |
| `npm run test:unit:coverage` | Vitest with v8 coverage reports                                               |
| `npm run build`              | Secretless deterministic production compilation using the catalogue fixture    |
| `npm run build:stripe`       | Explicit live-Stripe build (protected integration environment only)            |
| `npm run test:integration:stripe` | Read-only, one-request Stripe test-account integration check             |
| `npm run test:e2e:smoke`     | Fast Playwright subset (`cart`, `not-found`, `success` redirect checks)       |
| `npm run test:e2e`           | Playwright scenarios (ensure browsers installed via `npx playwright install`) |

Playwright spins up the dev server automatically. Use `npx playwright show-report` to inspect the latest run.

Unit tests, PR E2E, and ordinary builds never need a Stripe secret. They use the
versioned catalogue fixture in `lib/catalogue-fixture.ts`. A Vercel production
deployment selects the live Stripe catalogue explicitly; `build:stripe` is the
local equivalent. The separately named Stripe integration suite refuses live
keys and makes at most one read-only catalogue request.

Test workflows have read-only repository permissions. They publish generated
badge files as workflow artifacts; the manual `Publish Test Badges` workflow is
the only narrowly scoped workflow allowed to commit badge updates to `main`.

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
| `lib/order-store.ts`               | Transactional Stripe event, order state, and outbox persistence |
| `lib/config/env.ts`                | Typed build, public, runtime, and secret environment profiles   |
| `lib/catalogue-fixture.ts`         | Deterministic catalogue for build, unit, and PR checks           |
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

- Order/event state and fulfillment outbox jobs persist in Postgres; cart state remains browser-local in `localStorage`.
- Product data is cached via Next.js ISR; adding/removing Stripe products may require revalidation or a redeploy to appear instantly.
- Ensure your Stripe test mode has products, prices, and promotion codes before running E2E flows.
- Preview mode bypasses paid-status and receipt-token checks only for demo/development use; it still fetches the Stripe Checkout session by `session_id`.
- Product availability requires an active Stripe Product with an active `default_price`.
- Follow-up work is tracked in [PROJECT_IMPROVEMENT_PLAN.md](./PROJECT_IMPROVEMENT_PLAN.md).

## 📦 Deployment

Deploy to Vercel (or any Next.js-compatible host), connect a Marketplace Postgres database, and set the same environment variables (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STOREFRONT_CURRENCY`). Add `DEMO_SUCCESS` if you want preview mode outside dev.

Use the Stripe CLI or dashboard to point webhooks at the deployed URL (e.g., `https://yourdomain.com/api/stripe/webhook`).

---

Questions or ideas for improvements are welcome—feel free to open an issue or tweak the roadmap!
