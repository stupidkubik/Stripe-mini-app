import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createReceiptProof,
  getReceiptCookieName,
  verifyReceiptProof,
} from "@/lib/receipt-proof";

const ORIGINAL_SECRET = process.env.RECEIPT_SIGNING_SECRET;

describe("receipt proof", () => {
  beforeEach(() => {
    process.env.RECEIPT_SIGNING_SECRET = "test-receipt-signing-secret";
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.RECEIPT_SIGNING_SECRET;
    } else {
      process.env.RECEIPT_SIGNING_SECRET = ORIGINAL_SECRET;
    }
  });

  it("binds the proof to one Checkout Session", () => {
    const proof = createReceiptProof("cs_123");

    expect(verifyReceiptProof("cs_123", proof)).toBe(true);
    expect(verifyReceiptProof("cs_other", proof)).toBe(false);
    expect(verifyReceiptProof("cs_123", `${proof}tampered`)).toBe(false);
  });

  it("uses independent cookie names and proofs for parallel checkouts", () => {
    const sessions = ["cs_first", "cs_second"];
    const cookies = new Map(
      sessions.map((sessionId) => [
        getReceiptCookieName(sessionId),
        createReceiptProof(sessionId),
      ]),
    );

    expect(cookies.size).toBe(2);
    for (const sessionId of sessions) {
      expect(
        verifyReceiptProof(
          sessionId,
          cookies.get(getReceiptCookieName(sessionId)),
        ),
      ).toBe(true);
    }
  });
});
