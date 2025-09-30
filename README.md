# Stripe Mini Shop

![Unit Tests](https://img.shields.io/badge/tests-unit%20%E2%9C%85-0f172a?style=flat&logo=vitest)
![Coverage](https://img.shields.io/badge/coverage-18%25-f59e0b?style=flat&logo=vitest)
![E2E](https://img.shields.io/badge/tests-e2e%20ready-2b825d?style=flat&logo=playwright)

A compact, Stripe-powered storefront built with Next.js App Router, TypeScript, and Tailwind. It showcases product browsing, a persisted cart, theme switching, and a full Stripe Checkout flow.

## Prerequisites

- Node.js 18+
- Stripe account (test mode) with API keys
- Playwright browsers (`npx playwright install`)

Create an `.env.local` with the required secrets:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` | Build the production bundle |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Execute Vitest unit tests |
| `npm run test:unit:coverage` | Run unit tests with v8 coverage (HTML + json-summary) |
| `npm run test:e2e` | Execute Playwright E2E tests |

## Testing

### Unit tests & coverage

Vitest is configured in `vitest.config.ts` with jsdom, React Testing Library helpers, and v8 coverage reporters. Coverage artifacts are emitted to `/coverage` (HTML report at `coverage/index.html`, machine-readable summary at `coverage/coverage-summary.json`).

```bash
npm run test:unit:coverage
```

### End-to-end tests

Playwright scenarios live in `tests/e2e` and cover critical UX flows (empty cart, cart persistence, success page, custom 404). The Playwright config starts the dev server automatically.

```bash
npx playwright install  # once
npm run test:e2e
```

> **Note:** the Playwright server binds to port 3000. Run the command in an environment that allows opening localhost ports (the sandboxed CLI may block it).

Use `npx playwright show-report` to open the latest HTML report.

### Stripe Test Mode checkout

1. Seed products/prices (see `scripts/seed-stripe.ts`) or create them manually in the Stripe dashboard.
2. Start the app (`npm run dev`) and add items to your cart.
3. Enter a test email on the cart page and press **Proceed to checkout**.
4. Complete the hosted checkout with any Stripe test card (e.g. `4242 4242 4242 4242`, future expiry, any CVC and ZIP).
5. Stripe redirects back to `/success?session_id=...`, where the cart is cleared and the order summary is displayed. Choosing **Cancel** in checkout will redirect to `/cancel` with guidance to resume the flow.

## Misc

- Stripe seeding scripts: `scripts/seed-stripe.ts`
- Persisted cart storage key: `localStorage['cart']`
- The custom 404 page is implemented in `app/not-found.tsx`
