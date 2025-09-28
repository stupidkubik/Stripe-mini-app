import { NextResponse } from "next/server";

import { listProducts } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await listProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load Stripe products", error);
    return NextResponse.json(
      { error: "Unable to fetch products from Stripe" },
      { status: 500 },
    );
  }
}
