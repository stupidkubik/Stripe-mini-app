import * as React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Verdant Lane — Stripe-powered houseplant boutique";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const background =
  "linear-gradient(135deg, rgba(16, 86, 82, 1) 0%, rgba(37, 99, 235, 0.25) 100%)";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "64px",
          background,
          color: "#f1f5f9",
          justifyContent: "space-between",
          borderRadius: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "760px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "24px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(226, 232, 240, 0.75)",
          }}>
            Verdant Lane
          </span>
          <h1
            style={{
              fontSize: "80px",
              lineHeight: "88px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Houseplants, Stripe Checkout, and Next.js Magic
          </h1>
          <p
            style={{
              fontSize: "28px",
              lineHeight: "38px",
              color: "rgba(226, 232, 240, 0.85)",
              margin: 0,
            }}
          >
            Explore a mini e-commerce experience wired to real Stripe products, promo codes, and webhooks.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "22px",
              color: "rgba(226, 232, 240, 0.9)",
            }}
          >
            <span>stripe-mini-shop</span>
            <span>nextjs • typescript • stripe</span>
          </div>
          <div
            style={{
              height: "140px",
              width: "140px",
              borderRadius: "100%",
              background: "rgba(15, 118, 110, 0.35)",
              border: "4px solid rgba(226, 232, 240, 0.4)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
