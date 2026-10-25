# Testing Strategy

## Coverage Targets (Vitest)

Enforced by `coverage.thresholds` in `vitest.config.mts`;
`npm run test:unit:coverage` fails below them.

- Lines >= 85%
- Statements >= 85%
- Functions >= 85%
- Branches >= 70%

## Critical Modules (Required Unit Coverage)

- app/store/cart.ts
- components/cart/cart-page-client.tsx
- components/cart/checkout-form.tsx
- components/cart/order-success.tsx
- components/add-to-cart-button.tsx
- components/product-card.tsx
- components/product-grid.tsx
- app/api/checkout/route.ts
- app/api/stripe/webhook/route.ts
- lib/order-store.ts
- lib/stripe.ts
- lib/stripe-client.ts
- app/success/page.tsx

## Run Scenarios

- Quick check (unit only): `npm run test:unit`
- Pre-push check (lint, typecheck, prettier, unit): `npm run check`
- Coverage gate: `npm run test:unit:coverage`
- E2E smoke (fast, dev server): `npm run test:e2e:smoke`
- E2E against the production build: `npm run build && E2E_PRODUCTION=1 npm run test:e2e`
- Full local verification: `npm run check && npm run test:unit:coverage && npm run build && E2E_PRODUCTION=1 npm run test:e2e`
- E2E setup (once): `npx playwright install`
- Quality gate (CI): lint, typecheck, `prettier --check` and a fixture build on every PR
- Security gate (CI): `npm audit --omit=dev --audit-level=high` + gitleaks scan

## Security Gate Notes

- `npm audit` in CI checks production dependencies only (`--omit=dev`).
- For audit failures, prefer package updates over temporary ignores.
- For gitleaks false positives, verify first, then suppress only with narrow path-based allowlists and a reason in repo config.
