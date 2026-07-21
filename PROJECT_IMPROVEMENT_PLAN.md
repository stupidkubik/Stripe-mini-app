# Security and refactoring plan

Updated on 2026-07-21 after merging `origin/main`, reviewing
`SECURITY_REVIEW_2026-07-11.md`, rerunning the dependency audit, and verifying
the current build.

## Current baseline

- The application-code findings from the 2026-07-11 review are remediated:
  Checkout accepts only active products' default prices, receipt access requires
  an application token, cart size is bounded, arbitrary promotion codes are
  disabled, and payment logs no longer contain customer email or raw failure
  messages.
- `npm audit --omit=dev` reports no high or critical findings. Its two moderate
  entries are the same Next.js-bundled PostCSS advisory. The vulnerable behavior
  requires untrusted CSS to be parsed and embedded in a style element; this app
  has no such input path. Do not accept npm's proposed downgrade to Next.js
  9.3.3. Track a stable Next.js release containing PostCSS 8.5.10 or newer.
- The full audit reports three high, three moderate, and one low finding in the
  development toolchain. A non-breaking `npm audit fix` dry run resolves the
  actionable Babel, AJV, brace-expansion, js-yaml, and picomatch versions.
- Lint passes, all 134 unit tests pass, and the production build completes.
  However, the build hits Stripe 429 responses repeatedly and logs complete SDK
  error objects. A successful exit code currently hides a fragile build.

## P0 — Before the next production release

### 1. Apply the safe transitive dependency fixes

**Status (2026-07-21): Complete.** Applied the non-breaking audit fix. The
full and production audits now contain only the two documented moderate
Next.js/PostCSS entries; high, critical, and other dev-toolchain findings are
cleared. Lint, all 134 unit tests, and the production build pass.

**Problem (resolved):** The lockfile contained vulnerable dev-only versions of
`brace-expansion`, `js-yaml`, and `picomatch`, plus moderate/low AJV and Babel
findings. These are not runtime-reachable in the storefront, but they process
repository and tool input in CI and on developer machines.

**Remediation:** Ran the non-breaking audit fix, reviewed the lockfile-only
changes, then reran lint, unit tests, build, and the full audit. Keep the Next.js/PostCSS item
as an explicit, time-bounded exception; never run `npm audit fix --force` for it.

**Done when:** The full audit contains only the documented Next.js/PostCSS
exception, with no high or critical findings.

### 2. Move abuse controls to a shared boundary

**Status (2026-07-21): Complete for the pet-project scope.** Checkout and
webhook bodies are read as bounded streams, Checkout
keys its fallback limit only by a provider-controlled IP, and each instance
atomically reserves a global budget before making Stripe API calls. The lossy
webhook limiter was removed so valid signed retries are not discarded. A shared
Vercel Firewall or distributed counter is intentionally deferred unless the app
is scaled beyond a single-instance pet-project deployment.

**Problem (resolved for current scope):** `lib/rate-limit.ts` is a process-local map. It resets on restart,
is not shared between serverless instances, and cannot provide a global request
budget. Before this change, Checkout also read the full JSON body before schema
validation, and the webhook route applied the same local limiter to legitimate
Stripe deliveries, which could delay events without reducing distributed abuse.

**Plan:** Enforce request-size and rate limits at the hosting edge/WAF. Use a
shared atomic store for application limits when edge controls are insufficient.
Give Checkout a per-IP plus global Stripe-call budget. Treat the webhook
separately: cap body size, verify signatures first, and rely on Stripe retries
and idempotent processing rather than a lossy per-instance counter.

**Done when:** Limits behave consistently across multiple instances; oversized
requests are rejected before buffering; a burst of valid Stripe events is not
discarded; load tests prove the configured Stripe-call ceiling.

### 3. Sanitize operational error logging

**Status (2026-07-21): Complete.** All server-side Stripe failure paths use one
server-only allow-list serializer. Redaction and per-worker 429 sampling are
covered by tests; all 143 unit tests, lint, and the production build pass. A
live build emitted only the allowed structured fields and no raw SDK message,
headers, dashboard URL, email, promotion code, or receipt token. Cross-worker
catalogue request duplication remains tracked in item 4.

**Problem (resolved):** Catalogue, checkout, success, cancel, and webhook paths log entire
Stripe error objects. The verified build emitted request-log URLs, request IDs,
headers, and account context for every 429. Promo codes and object IDs also
appear directly in several messages.

**Plan:** Add one server-only error serializer that allow-lists error type,
status, Stripe request ID, and a stable internal operation name. Redact URLs,
headers, request bodies, email, promotion codes, receipt tokens, and raw SDK
messages. Use structured logs and sampling for repeated 429s.

**Done when:** Tests assert redaction, and a forced Stripe failure produces one
bounded structured event without secrets, PII, headers, or dashboard URLs.

## P1 — Reliability and core-domain refactoring

### 4. Build one cached catalogue snapshot

**Status (2026-07-21): Complete.** A `CatalogueRepository` now publishes one
validated, serializable snapshot through the Next.js Data Cache with 60-second
revalidation. It is indexed by normalized product ID, slug, and price ID, and
all catalogue pages, metadata, sitemap generation, and Checkout eligibility use
those indexes. Stripe 429/5xx calls have a three-attempt exponential backoff
with jitter and fail with a sanitized domain error. The production build emits
no Stripe 429 warnings.

**Problem (resolved):** Static parameters, metadata, product pages, and sitemap generation
repeat catalogue work. `getProductBySlug` calls Stripe Search per slug and falls
back to a full catalogue fetch. The production build already hit Stripe rate
limits while generating pages.

**Plan:** Introduce a `CatalogueRepository` interface and build one validated
snapshot per revalidation/build cycle. Index it by product ID and normalized
slug. Resolve pages, metadata, sitemap, and Checkout eligibility from that
snapshot. Add bounded retry with jitter for 429/5xx responses and fail the build
clearly when the snapshot cannot be obtained or use an explicitly versioned
offline build fixture.

**Done when:** One catalogue refresh uses a bounded number of Stripe calls, the
build emits no 429 warnings, and every catalogue consumer sees the same data.

### 5. Make catalogue and Checkout eligibility identical

**Status (2026-07-21): Complete.** Catalogue display and Checkout now consume
the same `SellableProduct` snapshot. The repository requires an active product
with its current active one-time `default_price`, a safe integer amount, a
valid Stripe currency, and normalized storefront metadata. Missing, inactive,
recurring, replaced, and malformed prices are covered by tests. The separate
single-currency cart policy remains item 6.

**Problem (resolved):** The catalogue falls back to the first active price for a product
without `default_price`, while Checkout accepts only an active default price.
This can display an item that cannot be purchased.

**Plan:** Define a shared `SellableProduct` invariant: active product, active
one-time default price, amount present, supported currency, and valid storefront
metadata. Normalize it once in the catalogue repository and reject everything
else from catalogue, sitemap, cart reconciliation, and Checkout.

**Done when:** Every displayed item can create a Checkout Session; tests cover
missing, inactive, recurring, replaced, and malformed default prices.

### 6. Define and enforce the currency policy

**Status (2026-07-21): Complete.** `NEXT_PUBLIC_STOREFRONT_CURRENCY` defines one
catalogue/cart/Checkout currency and defaults to USD. The catalogue excludes
other currencies, cart persistence version 2 removes incompatible legacy
items, `addItem` rejects mismatches before totals change, and Checkout returns
the stable `currency_mismatch` domain error before creating a Stripe Session.

**Problem (resolved):** The cart sums minor units from every item but formats the total with
the first item's currency. Stripe rejects mixed-currency Checkout line items.

**Plan:** Configure one storefront currency, or prevent adding an item whose
currency differs from the cart. Enforce the same rule in Checkout using trusted
catalogue data and return a stable domain error.

**Done when:** Mixed currencies cannot produce an incorrect UI total or a late
Stripe Session error.

### 7. Remove Session-ID-only work from success and cancel pages

**Status (2026-07-21): Complete.** Checkout now creates a per-session HMAC
receipt proof in an independently named HttpOnly cookie. The success page
verifies that proof before calling Stripe, so parallel tabs remain independent
and fabricated Session IDs consume no Stripe quota. Receipt secrets are no
longer copied into Stripe metadata. The generic cancel page performs no Stripe
lookup and renders without requiring a Session ID.

**Problem (resolved):** Receipt authorization is fixed, but a browser has only one receipt
token cookie. A second Checkout overwrites the first token. Also, `/success` and
`/cancel` call Stripe before establishing proof; arbitrary leaked or fabricated
Session IDs can consume API quota. The cancel page retrieves a Session only to
show generic content.

**Plan:** Store short-lived receipt proof per Checkout Session, preferably in a
server-side order/receipt record with an opaque browser token. Validate the
proof before fetching detailed receipt data. Remove the Stripe retrieval from
the generic cancel page. Expire the specific proof after its retention window.

**Done when:** Parallel Checkout tabs both work, unauthorized requests cause no
Stripe lookup, and the cancel page has no external dependency.

### 8. Persist orders and process webhooks idempotently

**Problem:** `lib/payment-events.ts` stores events in memory. Restarts lose them,
multiple instances disagree, and webhook retries have no durable idempotency or
fulfillment state.

**Plan:** Add a database-backed order state machine keyed by Stripe event ID and
Checkout Session ID. In one transaction, record an event once and advance only
valid state transitions. Return success for an already-processed event. Keep
fulfillment side effects behind an outbox/job boundary.

**Done when:** Restarts and duplicate/out-of-order webhooks cannot lose,
duplicate, or reverse a completed order; concurrency tests cover replay.

## P2 — CI, configuration, and defense in depth

### 9. Decouple tests and builds from live Stripe

**Problem:** Pull-request smoke tests use placeholder keys while application
pages use the Stripe SDK, and local/CI builds can call the live test account.

**Plan:** Inject Stripe and catalogue adapters. Use deterministic fixtures for
unit, PR E2E, and normal production compilation. Keep a separately named
integration suite for a protected Stripe test account, with explicit quotas and
cleanup.

**Done when:** PR checks and ordinary builds require no Stripe secret or network;
integration failures are isolated and actionable.

### 10. Remove write access from test workflows

**Problem:** unit and full E2E jobs receive `contents: write` only to commit badge
changes, increasing the impact of a compromised dependency or test command.

**Plan:** Keep test jobs at `contents: read`. Generate badges in a dedicated
release/manual workflow or publish them as artifacts through a narrowly scoped
bot job that never executes untrusted pull-request code.

**Done when:** All PR and test jobs are read-only and badge publication has a
separate minimal permission boundary.

### 11. Add browser security headers and configuration validation

**Problem:** `next.config.ts` defines image hosts but no explicit CSP,
frame-ancestor policy, referrer policy, or permissions policy. Environment
validation is spread across modules and can fail during import/build.

**Plan:** Start CSP in Report-Only mode, then enforce a policy compatible with
Stripe.js and application images. Add `frame-ancestors 'none'`, a strict
referrer policy, a minimal permissions policy, and HSTS at the production edge.
Validate server configuration once with a typed schema and separate build-time,
runtime, public, and secret settings.

**Done when:** Security-header tests cover every route, CSP reports are clean,
and missing/invalid configuration fails with one actionable startup error.

## Delivery order

1. Safe dependency fixes and audit exception documentation.
2. Shared request limits and safe Stripe error logging.
3. Catalogue repository/snapshot, sellability invariant, and currency policy.
4. Per-session receipt proof and removal of the cancel-page Stripe lookup.
5. Persistent idempotent order processing.
6. Deterministic Stripe adapters for build/CI, read-only workflows, and headers.

Each change should land separately with regression tests and the standard gate:
`npm run lint`, `npm run test:unit -- --run`, `npm run build`, and both production
and full dependency audits.
