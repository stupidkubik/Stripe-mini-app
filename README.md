# Stripe Mini Shop

![Unit Tests](./badges/unit-tests.svg)
[![codecov](https://codecov.io/gh/stupidkubik/Stripe-mini-app/branch/main/graph/badge.svg)](https://codecov.io/gh/stupidkubik/Stripe-mini-app)
![E2E Tests](./badges/e2e-tests.svg)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Fstripe-mini-shop.vercel.app&label=vercel&logo=vercel&logoColor=white)](https://stripe-mini-shop.vercel.app/)
![Node](https://img.shields.io/badge/node-20.x-3c873a?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-16.2.10-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-19.2.3-61dafb?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6?logo=typescript&logoColor=white)

Verdant Lane is a production-minded e-commerce demo that connects a polished
Next.js App Router storefront to a live Stripe catalogue and a durable Postgres
order pipeline. It covers the complete purchase journey: product discovery,
an accessible persistent cart, server-validated Stripe Checkout, signed
webhooks, idempotent order state, and a protected itemized receipt.

**Live demo:** [stripe-mini-shop.vercel.app](https://stripe-mini-shop.vercel.app/)

![ScreenRecording2026-01-09at18 58 30-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/89378fd6-0a43-4745-8eaa-ed066c32d2a9)

---

## Project overview

The project presents a fictional houseplant studio as a real, working online
store. Stripe is the catalogue and payment source of truth, while Next.js owns
the storefront experience and Postgres records payment outcomes. The codebase
is deliberately small enough to study, but it handles the reliability and
security boundaries that are commonly skipped in portfolio checkout demos.

| Project detail      | Value                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Format              | Personal full-stack e-commerce case study                                                                               |
| Status              | Live on Vercel; Stripe operates in test mode                                                                            |
| Scope               | Product UI, cart state, server APIs, payment integration, database model, security hardening, tests, CI, and deployment |
| Core challenge      | Keep the browser experience convenient without trusting browser-owned price, cart, receipt, or payment data             |
| Production services | Vercel, Stripe, and Neon Postgres                                                                                       |

### Website-ready description

**Short version**

> Verdant Lane is a production-minded Next.js storefront built around Stripe
> Checkout. It combines a live product catalogue, persistent cart, protected
> receipts, signed webhooks, and idempotent Postgres order processing with a
> polished responsive interface.

**Extended version**

> I built Verdant Lane as an end-to-end e-commerce case study rather than a
> checkout mock-up. Products and current prices come from Stripe and are
> normalized into one cached sellable catalogue used by every page and API.
> Customers can browse responsive product pages, manage a persistent cart,
> apply an approved promotion code, and complete a real Stripe test-mode
> Checkout flow.
>
> The server validates every product, price, quantity, currency, and redirect
> before creating a Checkout Session. Signed webhook events are recorded once
> in Postgres, order status can only advance safely, and a unique outbox record
> creates a boundary for future fulfillment work. Receipt details are available
> only to the browser that started the matching Checkout. The project also
> includes deterministic CI builds, unit and browser tests, typed environment
> validation, sanitized logging, CSP/HSTS headers, SEO metadata, and a live
> Vercel deployment.

**Готовая версия для русскоязычного сайта**

> Verdant Lane — полнофункциональный демонстрационный интернет-магазин на
> Next.js со Stripe Checkout и надёжным серверным контуром. Каталог и актуальные
> цены загружаются из Stripe, корзина сохраняется в браузере, а сервер повторно
> проверяет товары, цены, валюту, количество и промокод перед созданием платёжной
> сессии.
>
> Проект охватывает весь путь заказа: адаптивный каталог, карточки товаров,
> доступную корзину, тестовую оплату, защищённую квитанцию, подписанные webhook и
> идемпотентную запись состояния заказа в Postgres. Для стабильной разработки
> добавлены offline-fixtures, unit- и E2E-тесты, типизированная конфигурация,
> безопасное логирование, CSP/HSTS и CI с минимальными правами. Production-версия
> развёрнута на Vercel и работает с реальным тестовым каталогом Stripe.

### What a visitor can do

- Browse a live catalogue sourced from active Stripe Products and their current
  one-time default Prices.
- Open SEO-friendly product detail pages by stable slug and review price, care,
  category, light, watering, and pet-safety metadata when available.
- Add products from cards or detail pages, adjust quantities from 1 to 10,
  remove items, and keep the cart after a reload through sanitized local
  persistence.
- Switch between light and dark themes and use the storefront with keyboard and
  screen-reader friendly labels, focus states, loading skeletons, and actionable
  error messages.
- Enter an email address and an optional active Stripe promotion code, then
  continue through hosted Stripe Checkout, including test-mode 3D Secure flows.
- Return to a protected success page containing line items, subtotal, discount,
  total, customer email, Stripe Session reference, and a payment timeline.
- Return from a cancelled Checkout without triggering an unnecessary Stripe API
  request and continue editing the existing cart.
- Share pages with canonical metadata and generated Open Graph cards; search
  engines receive catalogue-backed `sitemap.xml` and `robots.txt` endpoints.
- Move through dedicated loading, empty, not-found, and recoverable error states
  instead of falling back to framework-default screens.

## How the purchase flow works

1. **Catalogue refresh** — the server loads active Stripe products, resolves
   their current default prices, normalizes safe metadata, rejects unsellable
   records, and creates one snapshot indexed by product ID, slug, and price ID.
   The snapshot is cached with a 60-second revalidation window.
2. **Cart management** — Zustand keeps browser-local items and derived totals.
   Persisted data is treated as untrusted: malformed records, unsupported
   currencies, duplicate products, unsafe amounts, and invalid quantities are
   normalized or removed during hydration.
3. **Checkout validation** — `/api/checkout` accepts a bounded request, applies
   per-client and Stripe-call budgets, and checks every submitted price against
   the same sellable catalogue shown in the UI. The client never decides the
   authoritative amount or currency.
4. **Session creation** — the server validates an optional promotion code,
   creates a Stripe Checkout Session with bounded adjustable quantities and
   automatic tax, and returns only the Session ID. Redirect URLs come from
   trusted server configuration rather than request headers.
5. **Receipt authorization** — Checkout also creates a per-session HMAC proof in
   an HttpOnly, SameSite cookie scoped to `/success`. A fabricated or leaked
   Session ID causes a redirect before any Stripe receipt lookup.
6. **Payment confirmation** — Stripe sends a signed webhook. The route verifies
   the signature against the unmodified bounded body, converts supported events
   into domain data, and stores the result transactionally.
7. **Durable order state** — one Postgres statement records each Stripe event
   once, updates an order without allowing `paid` to regress to `failed`, and
   inserts at most one `order.paid` outbox record for future fulfillment.
8. **Success experience** — after proof and paid-status verification, the app
   renders the itemized receipt and timeline, then clears the local cart.

## Architecture

```mermaid
flowchart LR
    Browser["Browser / React UI"]
    Catalogue["Next.js catalogue snapshot"]
    Checkout["POST /api/checkout"]
    Success["Protected /success receipt"]
    Webhook["POST /api/stripe/webhook"]
    Stripe["Stripe Products, Prices & Checkout"]
    Postgres["Neon Postgres"]
    Outbox["order.paid outbox"]

    Stripe -->|"Products + default Prices"| Catalogue
    Catalogue -->|"ISR pages + trusted price index"| Browser
    Browser -->|"price IDs, quantities, email, promo"| Checkout
    Checkout -->|"validated Session creation"| Stripe
    Checkout -->|"Session ID + HttpOnly receipt proof"| Browser
    Stripe -->|"hosted payment redirect"| Browser
    Stripe -->|"signed events"| Webhook
    Webhook -->|"atomic event/order update"| Postgres
    Postgres --> Outbox
    Browser -->|"Session ID + matching proof"| Success
    Success -->|"verified receipt lookup"| Stripe
```

## Reliability and security guarantees

| Boundary              | Current behavior                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue consistency | Pages, sitemap, cart reconciliation, and Checkout eligibility consume the same validated `SellableProduct` snapshot.                                     |
| Stripe availability   | Catalogue calls use bounded pagination and three retry attempts with exponential backoff and jitter for 429/5xx responses.                               |
| Price integrity       | Checkout accepts only the current active one-time default price of a displayed active product. Client-provided amounts are ignored.                      |
| Currency integrity    | One configured storefront currency is enforced in the catalogue, persisted cart, UI totals, and Checkout API.                                            |
| Resource bounds       | Cart line count, item quantities, request bodies, tracked rate-limit buckets, and Stripe API work are explicitly capped.                                 |
| Receipt privacy       | A per-session HMAC proof is verified before Stripe is contacted, so a Checkout Session ID alone cannot expose order details.                             |
| Webhook authenticity  | Stripe signatures are verified against the raw request body before event processing.                                                                     |
| Event idempotency     | Stripe event IDs are unique, paid state is monotonic, and `(session_id, topic)` prevents duplicate fulfillment outbox records.                           |
| Operational logging   | Server errors pass through an allow-list serializer that omits raw SDK messages, headers, URLs, tokens, promo codes, and customer email.                 |
| Browser hardening     | Production responses enforce a Stripe-compatible CSP, `frame-ancestors 'none'`, HSTS, nosniff, strict referrer policy, and a minimal permissions policy. |
| Configuration         | Typed Zod profiles separate build, public, runtime, database, and secret variables; runtime-only secrets do not break ordinary builds.                   |
| CI trust boundary     | Unit, E2E, and ordinary builds use deterministic fixtures with read-only repository permissions and no Stripe secret.                                    |

## Latest engineering update — July 2026

The recent refactoring pass focused on making the demo safe to operate and
predictable to change:

- **Dependencies and abuse controls:** updated vulnerable transitive packages,
  bounded request streaming, stopped trusting generic forwarded-IP headers,
  added a per-instance Checkout limiter and an atomic Stripe API-call budget,
  and documented the Vercel WAF boundary for multi-instance deployments.
- **Safe observability:** replaced raw Stripe error logging with structured,
  redacted, sampled server events.
- **Shared commerce domain:** introduced `CatalogueRepository`, one cached and
  indexed catalogue snapshot, a single sellability invariant, and a strict
  storefront currency policy shared by the UI and server.
- **Protected receipts:** replaced Session-ID-only access with independent
  per-session receipt proofs and removed the cancelled-order Stripe lookup.
- **Durable payments:** replaced process-local payment history with idempotent
  Postgres event/order persistence and a unique fulfillment outbox boundary.
- **Deterministic delivery:** made the Stripe client lazy, removed build-time
  Google Font downloads, added a versioned offline catalogue fixture, and
  isolated the one-request live Stripe check in a separately named integration
  suite.
- **Least-privilege CI:** changed all test workflows to `contents: read`, moved
  badge commits into a dedicated manual workflow, and kept PR code away from the
  write-capable job.
- **Defense in depth:** added typed configuration profiles and enforced browser
  security headers across pages, static responses, and API routes.

### Verified baseline

- 37 Vitest files and **157 passing unit/component/API tests**.
- **7 passing Playwright scenarios** covering the storefront's critical browser
  paths.
- **91.38% statement coverage** and **91.54% line coverage** in the latest local
  gate.
- ESLint, TypeScript, workflow YAML, secretless production compilation, and
  production HTTP header smoke checks pass.
- The production and full npm audits contain no high or critical findings. The
  remaining two moderate entries are the documented Next.js-bundled PostCSS
  advisory, whose automated fix incorrectly proposes downgrading Next.js.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Server and Client
  Components, ISR, `next/image`, dynamic metadata, CSS Modules, Radix UI, and
  Lucide icons.
- **State and forms:** Zustand with versioned local persistence, React Hook Form,
  and Zod validation.
- **Payments:** Stripe Node SDK, Stripe.js, hosted Checkout, Products, Prices,
  Promotion Codes, Checkout Sessions, and signed webhooks.
- **Data:** Neon serverless Postgres with lazy schema initialization,
  transactionally idempotent event/order updates, and an outbox table.
- **Quality:** Vitest, React Testing Library, Playwright, ESLint, Prettier,
  coverage reporting, dependency auditing, and secret scanning.
- **Delivery:** GitHub Actions with least-privilege workflows and Vercel
  production hosting.

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
RECEIPT_SIGNING_SECRET=replace_with_a_long_random_secret
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
> `RECEIPT_SIGNING_SECRET` is optional but recommended. If it is omitted, the
> server derives receipt proofs from `STRIPE_SECRET_KEY`.
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

| Command                           | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `npm run lint`                    | ESLint rules (TypeScript-aware)                                               |
| `npm run test:unit`               | Vitest + React Testing Library                                                |
| `npm run test:unit:coverage`      | Vitest with v8 coverage reports                                               |
| `npm run build`                   | Secretless deterministic production compilation using the catalogue fixture   |
| `npm run build:stripe`            | Explicit live-Stripe build (protected integration environment only)           |
| `npm run test:integration:stripe` | Read-only, one-request Stripe test-account integration check                  |
| `npm run test:e2e:smoke`          | Fast Playwright subset (`cart`, `not-found`, `success` redirect checks)       |
| `npm run test:e2e`                | Playwright scenarios (ensure browsers installed via `npx playwright install`) |

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

| Path                               | Purpose                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `app/api/checkout/route.ts`        | Bounded cart validation, promotion lookup, and Checkout Session creation   |
| `app/api/stripe/webhook/route.ts`  | Raw-body signature verification and payment-event mapping                  |
| `app/success/page.tsx`             | Receipt-proof authorization and paid Checkout receipt loading              |
| `app/store/cart.ts`                | Versioned, sanitized cart persistence and derived totals                   |
| `lib/catalogue.ts`                 | Sellability invariant, Stripe adapter, retry policy, and indexed snapshots |
| `lib/stripe.ts`                    | Lazy Stripe client and cached catalogue accessors                          |
| `lib/order-store.ts`               | Transactional Stripe event, order state, and outbox persistence            |
| `lib/receipt-proof.ts`             | Per-session HMAC receipt cookie creation and verification                  |
| `lib/server-log.ts`                | Redacted and sampled operational error serialization                       |
| `lib/config/env.ts`                | Typed build, public, runtime, database, and secret environment profiles    |
| `lib/catalogue-fixture.ts`         | Deterministic catalogue for build, unit, and PR checks                     |
| `app/opengraph-image.tsx`          | Dynamic Open Graph preview generator                                       |
| `app/sitemap.ts` / `app/robots.ts` | SEO endpoints powered by the shared catalogue                              |
| `components/cart/**/*`             | Cart UI, Checkout form, cancellation summary, and success receipt          |

## 🗒️ Changelog

### 2.0 (Reliability, security & deterministic delivery) — 2026-07-21

- Added a shared validated catalogue snapshot with bounded Stripe retries and
  identical storefront/Checkout eligibility.
- Enforced a single currency and sanitized versioned cart persistence.
- Protected every receipt with a per-session HttpOnly proof before Stripe
  lookup and removed the cancel-page external dependency.
- Added idempotent Postgres event and order persistence with monotonic paid state
  and a unique fulfillment outbox record.
- Bounded API request bodies and Stripe work, and replaced raw error logs with a
  redacted structured serializer.
- Made normal builds and test workflows deterministic and secretless, moved
  badge publishing behind a separate permission boundary, and added a protected
  Stripe integration suite.
- Added typed environment profiles and enforced Stripe-compatible browser
  security headers on every route.

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
- The outbox provides the durable boundary for fulfillment, but this pet project
  does not yet run a separate worker that delivers inventory, email, or shipping
  jobs.
- Product data is cached via Next.js ISR; adding/removing Stripe products may require revalidation or a redeploy to appear instantly.
- Ordinary unit, E2E, and build jobs use deterministic catalogue fixtures. Only
  the explicitly named Stripe integration suite and a live-catalogue build need
  a configured Stripe test account.
- The in-process Checkout limiter and Stripe-call budget are defense in depth,
  not a distributed multi-instance rate limiter. Production deployments should
  enforce the documented Vercel WAF rule.
- Preview mode bypasses paid-status and receipt-token checks only for demo/development use; it still fetches the Stripe Checkout session by `session_id`.
- Product availability requires an active Stripe Product with an active `default_price`.
- Follow-up work is tracked in [PROJECT_IMPROVEMENT_PLAN.md](./PROJECT_IMPROVEMENT_PLAN.md).

## 📦 Deployment

Deploy to Vercel (or any Next.js-compatible host), connect a Marketplace
Postgres database, and set the same environment variables
(`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `SITE_URL`, `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_STOREFRONT_CURRENCY`). Add a dedicated `RECEIPT_SIGNING_SECRET` for
independent receipt HMACs and `DEMO_SUCCESS` only if preview mode is intentionally
enabled outside development.

`npm run build` uses the deterministic fixture by default. The included build
wrapper selects the live Stripe catalogue only for a Vercel production context;
other hosts can opt in explicitly through `npm run build:stripe`.

Use the Stripe CLI or dashboard to point webhooks at the deployed URL (e.g., `https://yourdomain.com/api/stripe/webhook`).

---

Questions or ideas for improvements are welcome—feel free to open an issue or tweak the roadmap!
