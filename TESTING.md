# Testing Strategy

## Coverage Targets (Vitest)

- Lines >= 60%
- Statements >= 60%
- Functions >= 50%
- Branches >= 50%

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
- lib/payment-events.ts
- lib/stripe.ts
- lib/stripe-client.ts
- app/success/page.tsx

## Run Scenarios

- Quick check (unit only): `npm run test:unit`
- Coverage gate: `npm run test:unit:coverage`
- E2E smoke (fast): `npm run test:e2e:smoke`
- Full local verification: `npm run lint && npm run test:unit && npm run test:unit:coverage && npm run test:e2e`
- E2E setup (once): `npx playwright install`
- Security gate (CI): `npm audit --omit=dev --audit-level=high` + gitleaks scan

## Security Gate Notes

- `npm audit` in CI checks production dependencies only (`--omit=dev`).
- For audit failures, prefer package updates over temporary ignores.
- For gitleaks false positives, verify first, then suppress only with narrow path-based allowlists and a reason in repo config.
