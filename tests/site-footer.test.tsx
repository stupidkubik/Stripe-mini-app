import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SiteFooter from "@/components/site-footer";

describe("SiteFooter", () => {
  it("renders footer links and current year", () => {
    const year = new Date().getFullYear();

    render(<SiteFooter />);

    expect(
      screen.getByText(`© ${year} Verdant Lane. All rights reserved.`),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /catalog/i })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute(
      "href",
      "/legal/terms",
    );
    expect(screen.getByRole("link", { name: /deployed on vercel/i })).toHaveAttribute(
      "href",
      "https://vercel.com",
    );
  });
});
