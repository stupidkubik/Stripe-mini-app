import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SiteHeader from "@/components/site-header";

const { mockState, mockPathname } = vi.hoisted(() => ({
  mockState: {
    items: [] as Array<{ quantity: number }>,
    countValue: 0,
    count: vi.fn(),
  },
  mockPathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockPathname,
}));

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: typeof mockState) => T) =>
    selector(mockState),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet">{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
}));

vi.mock("@/components/theme-toggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    mockState.items = [];
    mockState.countValue = 0;
    mockState.count.mockImplementation(
      () => mockState.items.reduce((total, item) => total + item.quantity, 0),
    );
    mockPathname.mockReturnValue("/");
  });

  it("renders nav links and default cart label", () => {
    render(<SiteHeader />);

    const mainNav = screen.getByRole("navigation", { name: "Main" });
    expect(
      within(mainNav).getByRole("link", { name: /home/i }),
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: /products/i }),
    ).toBeInTheDocument();
    expect(
      within(mainNav).getByRole("link", { name: /cart/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /skip to content/i }),
    ).toBeInTheDocument();

    const cartLink = screen.getByRole("link", { name: /open cart/i });
    expect(cartLink).toHaveAttribute("href", "/cart");
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows cart badge and count in label", () => {
    mockState.items = [{ quantity: 2 }, { quantity: 1 }];
    mockState.countValue = 3;

    render(<SiteHeader />);

    expect(
      screen.getByRole("link", { name: /open cart, 3 items/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
