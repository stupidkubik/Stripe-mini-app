import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "@/app/legal/privacy/page";
import TermsPage from "@/app/legal/terms/page";

describe("Legal pages", () => {
  it("renders terms page", () => {
    render(<TermsPage />);

    expect(
      screen.getByRole("heading", { name: /terms of use/i }),
    ).toBeInTheDocument();
  });

  it("renders privacy page", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { name: /privacy notice/i }),
    ).toBeInTheDocument();
  });
});
