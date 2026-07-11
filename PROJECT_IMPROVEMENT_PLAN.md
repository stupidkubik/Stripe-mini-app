# Project improvement plan

Created from the architecture and workflow review on 2026-07-11. This plan tracks product and operational work separately from resolved security findings in `SECURITY_REVIEW_2026-07-11.md`.

## P1 — Reliable purchasing and catalogue

### 1. Make catalogue eligibility match Checkout eligibility

**Problem:** The catalogue falls back to the first active price when a Stripe product has no `default_price`, while Checkout intentionally accepts only the default price. Such a product is visible but cannot be bought.

**Plan:** Treat a product without an active default price as unavailable in `lib/stripe.ts`; show it neither in the catalogue nor sitemap. Add unit coverage for missing, inactive, and replaced default prices.

**Done when:** Every displayed product can create a Checkout Session, and retired/default-price changes produce a clear user-facing refresh path.

### 2. Define a single-currency cart policy

**Problem:** Cart totals sum all minor units while the UI formats the result using the first item's currency. Stripe Checkout rejects mixed-currency line items.

**Plan:** Choose one policy: restrict the storefront to one configured currency, or prevent adding an item in a different currency and explain why. Validate the same rule server-side before creating Checkout.

**Done when:** Mixed currencies cannot lead to an incorrect displayed total or a Stripe session error.

### 3. Support parallel Checkout sessions per browser

**Problem:** Starting a second Checkout overwrites the single receipt-token cookie, so returning from the first completed session cannot show its receipt.

**Plan:** After Stripe returns the session ID, set a receipt cookie keyed by that session ID, and read that key on `/success`. Expire/clear the specific cookie after use.

**Done when:** Two Checkout tabs can each return to their own successful receipt.

## P1 — Stripe reliability and build performance

### 4. Remove N+1 Stripe lookups during static generation

**Problem:** Static parameters, metadata, and product pages each request Stripe data. The production build already hit Stripe rate limits while generating product pages.

**Plan:** Build a single cached catalogue snapshot per revalidation/build cycle and resolve product slugs from it. Avoid per-slug Search API calls during static generation; add bounded retry/backoff for Stripe rate limits.

**Done when:** A production build does not produce Stripe 429 warnings and one catalogue refresh uses a bounded number of Stripe requests.

## P2 — CI and release confidence

### 5. Make PR E2E independent from live Stripe

**Problem:** PR smoke tests use placeholder Stripe keys while pages make real Stripe SDK calls. This makes results depend on external failures instead of the checked code.

**Plan:** Run smoke tests against a deterministic mocked Stripe adapter/test catalogue. Keep real Stripe tests as a separately named, protected-environment integration job.

**Done when:** Pull-request E2E is deterministic, does not need production-like secrets, and integration failures are reported separately.

### 6. Reduce GitHub Actions write privileges

**Problem:** Unit and full E2E workflows receive `contents: write` solely to commit generated badges.

**Plan:** Move badge generation to a manual/release workflow or a dedicated bot flow with narrowly scoped permissions. Keep PR and test workflows read-only.

**Done when:** Test workflows run with `contents: read` and no untrusted pull-request code can push commits.

## P3 — Product maturity

### 7. Add a persistent order and fulfillment model

**Problem:** The current webhook event store is intentionally in-memory; there is no durable order record, idempotent fulfillment, stock handling, or customer account history.

**Plan:** Introduce a database-backed order state machine keyed by Stripe event/session IDs. Process verified webhooks idempotently and integrate fulfillment/stock only after payment reaches a terminal successful state.

**Done when:** Restarts and webhook retries cannot lose or duplicate orders, and paid orders have a durable fulfillment state.

## Maintenance cadence

- Before every release: `npm run lint`, `npm run test:unit`, `npm run build`, and `npm audit --omit=dev --audit-level=high`.
- Monthly: review the dependency audit, Stripe API version, and this plan's priorities.
- After each Stripe catalogue change: verify active products have one active default price and match the storefront currency policy.
