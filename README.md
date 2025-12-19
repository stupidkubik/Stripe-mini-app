# Stripe Mini Shop

![Unit Tests](https://img.shields.io/badge/tests-unit%20%E2%9C%85-0f172a?style=flat&logo=vitest)
![Coverage](https://img.shields.io/badge/coverage-18%25-f59e0b?style=flat&logo=vitest)
![E2E](https://img.shields.io/badge/tests-e2e%20ready-2b825d?style=flat&logo=playwright)

Verdant Lane is a compact e-commerce demo that connects a polished Next.js App Router UI to real Stripe data. It covers the full journey from catalog browsing and an accessible cart to promo-code aware Checkout, webhooks, and a success timeline.

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
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_SUCCESS=true
```
> `NEXT_PUBLIC_SITE_URL` is also used as the fallback origin when creating Stripe Checkout sessions.
> `NEXT_PUBLIC_DEMO_SUCCESS` is optional and only needed if you want to preview `/success` without a paid session outside of dev.

Optional: seed test products via the helper script.
```bash
npx ts-node scripts/seed-stripe.ts
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
In dev, you can bypass the paid check with:
```
/success?session_id=cs_test_...&preview=1
```
Outside dev, set `NEXT_PUBLIC_DEMO_SUCCESS=true` and include `preview=1` to allow the same flow. A valid `session_id` is still required.

## ✅ Testing
| Command | Description |
| --- | --- |
| `npm run lint` | ESLint rules (TypeScript-aware) |
| `npm run test:unit` | Vitest + React Testing Library |
| `npm run test:unit:coverage` | Vitest with v8 coverage reports |
| `npm run test:e2e` | Playwright scenarios (ensure browsers installed via `npx playwright install`) |

Playwright spins up the dev server automatically. Use `npx playwright show-report` to inspect the latest run.

## 📁 Key Paths
| Path | Purpose |
| --- | --- |
| `app/api/checkout/route.ts` | Creates Checkout sessions, validates carts, applies promo codes |
| `app/api/stripe/webhook/route.ts` | Verifies webhook signatures and logs payment status events |
| `lib/payment-events.ts` | In-memory store for payment timeline data used on `/success` |
| `app/opengraph-image.tsx` | Dynamic Open Graph preview generator |
| `app/sitemap.ts` / `app/robots.ts` | SEO endpoints powered by live Stripe data |
| `components/cart/**/*` | Cart UI, checkout form, and success summary |

## ⚠️ Limitations & Notes
- The payment event log is in-memory; it resets on server restarts and is intended as a demo.
- There is no dedicated database—order metadata lives in Stripe, and cart state persists in the browser via localStorage.
- Product data is cached via Next.js ISR; adding/removing Stripe products may require revalidation or a redeploy to appear instantly.
- Ensure your Stripe test mode has products, prices, and promotion codes before running E2E flows.
- Preview mode only bypasses the paid check; it still fetches the Stripe Checkout session by `session_id`.

## 📦 Deployment
Deploy to Vercel (or any Next.js-compatible host) and set the same environment variables (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`).

Use the Stripe CLI or dashboard to point webhooks at the deployed URL (e.g., `https://yourdomain.com/api/stripe/webhook`).

---

Questions or ideas for improvements are welcome—feel free to open an issue or tweak the roadmap!
