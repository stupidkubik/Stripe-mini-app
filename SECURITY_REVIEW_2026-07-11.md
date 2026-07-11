# Security review — 2026-07-11

## Remediation status — 2026-07-11

All application-code findings below have been remediated and covered by unit tests. The dependency remediation is installed at the current npm `latest` versions: Next.js `16.2.10` and `qs` `6.15.3`. `npm audit` no longer reports `qs`; its final summary is **0 high, 2 moderate**.

The remaining npm advisory response applies to Next.js/PostCSS but proposes the unrelated downgrade to Next.js `9.3.3` as its fix. This is an upstream advisory-database inconsistency; `16.2.10` is the latest stable version in npm at the time of verification. Keep the security workflow enabled and rerun the audit when the advisory is corrected.

## Scope and method

Reviewed the current working tree, recent security-related commits, Checkout/Webhook routes, Stripe server helpers, and the lockfile. `npm audit --omit=dev --json` was run against the npm advisory service on 2026-07-11. This is a focused code review, not a penetration test.

## Findings

### Resolved / externally pending — Outdated Next.js has known remotely reachable vulnerabilities

**Evidence:** `package.json` pins `next` to `16.1.5`. The audit reports one high-severity package finding and multiple applicable advisories, including RSC denial of service, App Router middleware/proxy bypasses, and SSRF through WebSocket upgrades. The installed range is vulnerable through `< 16.2.5` / `< 16.2.6` for the listed advisories. `npm audit` offers `16.2.10` as the non-breaking remediation.

**Impact:** An attacker may exploit a framework vulnerability before application code has a chance to enforce its controls. The precise exposure depends on deployed Next.js features and hosting configuration, but the version is known vulnerable and should not be shipped.

**Resolution:** Upgraded to the latest published stable `next` `16.2.10` and regenerated the lockfile. See the remediation-status note above for the contradictory npm audit result.

### Resolved — Checkout accepts any active Stripe price, not just prices sold by this storefront

**Evidence:** `app/api/checkout/route.ts:67-84` treats a price as valid if it is active, one-time, and its product is active. It does not verify that the ID is the current/default price returned by this shop's catalogue or that it has an explicit storefront allow-list. The client-provided `priceId` is then passed directly to Stripe at `app/api/checkout/route.ts:175-185`.

**Impact:** Anyone can submit an ID for another active price in the same Stripe account. This can expose internal, legacy, discounted, or otherwise unpublished prices for purchase if they remain active.

**Resolution:** The route now accepts only the current `default_price` of an active product. An active legacy/internal price is rejected by a regression test. Retire obsolete Stripe prices as an additional operational safeguard.

### Resolved — Paid order details are exposed to anyone holding a Checkout Session ID

**Evidence:** `app/success/page.tsx:128-208` accepts `session_id` from the URL, retrieves that session using the server Stripe key, and renders its line items, totals, promo code, and customer email. It establishes no authenticated user/session ownership and uses no unguessable, application-owned receipt token.

**Impact:** A leaked or shared `cs_…` identifier gives the holder a receipt containing the purchaser's email and complete order details. Stripe IDs are high entropy, so this is an authorization/secret-leak exposure rather than a practical brute-force attack.

**Resolution:** Checkout creates a random receipt token, stores it in an HttpOnly, SameSite=Lax cookie scoped to `/success`, and records it in the Stripe Session metadata. The success page requires an exact match before rendering a paid order; production cookies are marked `Secure`.

### Resolved in application / deployment follow-up required — The checkout DoS controls are bypassable and request work is unbounded

**Evidence:** The limiter is a process-local `Map` (`lib/rate-limit.ts:22`), so it resets on redeploy/restart and is not shared between serverless instances. Its key trusts client-controlled `x-real-ip`, `cf-connecting-ip`, `x-forwarded-for`, and `user-agent` (`lib/rate-limit.ts:52-67`). Also, the request schema has no maximum array length (`app/api/checkout/route.ts:21-25`) and each distinct ID causes a sequential Stripe API retrieval (`:130-149`).

**Impact:** An attacker can rotate spoofed headers and submit a large list of distinct prices, consuming application workers and Stripe API quota. In a horizontally scaled deployment the per-process limit provides little practical protection.

**Resolution:** The API rejects carts above ten items before Stripe calls. The local limiter no longer trusts generic forwarding headers, bounds its own key store, and uses provider-controlled source-IP headers only for Vercel/Cloudflare Pages deployments. A multi-instance production deployment must still enforce a shared edge/WAF or shared atomic rate limit; this cannot be provided safely by a process-local map.

### Resolved — Global promotion codes can be applied even when the application did not approve them

**Evidence:** The route validates an explicitly supplied code, but creates every Checkout Session with `allow_promotion_codes: true` (`app/api/checkout/route.ts:232-239`). Stripe's Checkout UI can therefore accept any other active, eligible promotion code in the same account.

**Impact:** Promotions intended for another campaign, channel, or customer segment may discount this storefront. Stripe restrictions still apply, but application-side approval is bypassed.

**Resolution:** `allow_promotion_codes` is now disabled. Only a promotion code explicitly validated by the route can be attached to Checkout.

### Resolved — Payment PII and payment failure messages are written to application logs

**Evidence:** `lib/payment-events.ts:45-59` logs the customer email, session/payment IDs, and raw payment error message for every webhook event. The email/error message is populated from Stripe in `app/api/stripe/webhook/route.ts:72-124`.

**Impact:** Centralized logs commonly have broader access and longer retention than payment/order data. This unnecessarily increases exposure of customer PII and potentially sensitive payment-failure context.

**Resolution:** Payment event logs now contain only event/session/payment-intent IDs, amount, currency, and outcome. Customer emails and raw payment-error messages are neither retained by the event log nor written to it.

### Resolved — `qs` remained in a vulnerable range

**Evidence:** The audit flags `qs` `>=6.11.1 <=6.15.1` for a remotely triggerable DoS in `qs.stringify`; the repository's recent update to `6.14.2` is still in that range.

**Impact:** The direct reachability depends on the transitive consumer and whether it invokes the vulnerable stringify option combination. It should still be updated as an actionable supply-chain finding.

**Resolution:** Added a direct, exact `qs` dependency at `6.15.3`, outside the affected range. The follow-up audit no longer reports `qs`.

## Follow-up priority

1. Configure the hosting edge/WAF or a shared rate-limit store before a multi-instance production deployment.
2. Keep the Next.js security workflow active and rerun `npm audit` once its contradictory advisory is corrected.

## Positive controls observed

Webhook signatures are verified from the raw body, secrets are server-only and ignored by Git, checkout quantities are constrained, and redirect origins are derived from server configuration rather than the request `Host` header. These controls do not remove the findings above.
