import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";

const RECEIPT_COOKIE_PREFIX = "checkout_receipt_";
const RECEIPT_PROOF_VERSION = "v1";

function getSigningSecret(): string {
  const secret =
    process.env.RECEIPT_SIGNING_SECRET?.trim() ||
    process.env.STRIPE_SECRET_KEY?.trim();

  if (!secret) {
    throw new Error(
      "RECEIPT_SIGNING_SECRET or STRIPE_SECRET_KEY is required for receipt proofs.",
    );
  }

  return secret;
}

export function getReceiptCookieName(sessionId: string): string {
  const digest = createHash("sha256")
    .update(sessionId)
    .digest("base64url")
    .slice(0, 24);
  return `${RECEIPT_COOKIE_PREFIX}${digest}`;
}

export function createReceiptProof(sessionId: string): string {
  const signature = createHmac("sha256", getSigningSecret())
    .update(`${RECEIPT_PROOF_VERSION}:${sessionId}`)
    .digest("base64url");
  return `${RECEIPT_PROOF_VERSION}.${signature}`;
}

export function verifyReceiptProof(
  sessionId: string,
  proof: string | undefined,
): boolean {
  if (!proof || proof.length > 128) {
    return false;
  }

  const expected = Buffer.from(createReceiptProof(sessionId));
  const received = Buffer.from(proof);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
