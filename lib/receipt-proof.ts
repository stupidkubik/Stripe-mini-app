import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { readReceiptSigningSecret } from "@/lib/config/env";

const RECEIPT_COOKIE_PREFIX = "checkout_receipt_";
const RECEIPT_PROOF_VERSION = "v1";

function getSigningSecret(): string {
  return readReceiptSigningSecret();
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
