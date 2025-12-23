import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartError from "@/app/cart/error";
import CartLoading from "@/app/cart/loading";
import CartPage from "@/app/cart/page";
import CancelPage from "@/app/cancel/page";
import NotFound from "@/app/not-found";
import ProductsError from "@/app/products/error";
import ProductDetailLoading from "@/app/products/[slug]/loading";
import ProductNotFound from "@/app/products/[slug]/not-found";
import ProductDetailError from "@/app/products/[slug]/error";

class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super(`redirect:${url}`);
    this.url = url;
  }
}

const { stripeMock, redirectMock } = vi.hoisted(() => ({
  stripeMock: {
    checkout: {
      sessions: {
        retrieve: vi.fn(),
      },
    },
  },
  redirectMock: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
}));

vi.mock("@/components/cart/cancel-cart-summary", () => ({
  __esModule: true,
  default: () => <div data-testid="cancel-summary" />,
}));

vi.mock("@/components/cart/cart-page-client", () => ({
  __esModule: true,
  default: () => <div data-testid="cart-page-client" />,
  CartPageSkeleton: () => <div data-testid="cart-page-skeleton" />,
}));

describe("Quick pages", () => {
  beforeEach(() => {
    stripeMock.checkout.sessions.retrieve.mockReset();
    redirectMock.mockClear();
  });

  it("renders cart error and retries", async () => {
    const error = new Error("boom");
    const reset = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<CartError error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /cart unavailable/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalled();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Cart page failed to render",
        error,
      );
    });
    consoleSpy.mockRestore();
  });

  it("renders cart loading skeleton", () => {
    render(<CartLoading />);

    expect(screen.getByTestId("cart-page-skeleton")).toBeInTheDocument();
  });

  it("renders cart page client", () => {
    render(<CartPage />);

    expect(screen.getByTestId("cart-page-client")).toBeInTheDocument();
  });

  it("renders not-found page links", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: /we couldn't find/i }),
    ).toBeInTheDocument();

    const browse = screen.getByRole("link", { name: /browse products/i });
    expect(browse).toHaveAttribute("href", "/products");

    const home = screen.getByRole("link", { name: /return home/i });
    expect(home).toHaveAttribute("href", "/");
  });

  it("redirects cancel page when session id is missing", async () => {
    await expect(
      CancelPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(redirectMock).toHaveBeenCalledWith("/cart");
  });

  it("redirects cancel page when stripe lookup fails", async () => {
    stripeMock.checkout.sessions.retrieve.mockRejectedValue(new Error("fail"));

    await expect(
      CancelPage({ searchParams: Promise.resolve({ session_id: "cs_fail" }) }),
    ).rejects.toBeInstanceOf(RedirectError);

    expect(stripeMock.checkout.sessions.retrieve).toHaveBeenCalledWith(
      "cs_fail",
    );
  });

  it("renders cancel page content", async () => {
    stripeMock.checkout.sessions.retrieve.mockResolvedValue({ id: "cs_ok" });

    const element = await CancelPage({
      searchParams: Promise.resolve({ session_id: "cs_ok" }),
    });

    render(element);

    expect(
      screen.getByRole("heading", { name: /your payment was cancelled/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("cancel-summary")).toBeInTheDocument();
  });

  it("renders products error and retry button", async () => {
    const error = new Error("boom");
    const reset = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<ProductsError error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /unable to load products/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(reset).toHaveBeenCalled();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Products page failed to load",
        error,
      );
    });
    consoleSpy.mockRestore();
  });

  it("renders product detail loading skeletons", () => {
    const { container } = render(<ProductDetailLoading />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(6);
  });

  it("renders product not found page", () => {
    render(<ProductNotFound />);

    expect(
      screen.getByRole("heading", { name: /product not found/i }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /back to catalog/i });
    expect(link).toHaveAttribute("href", "/products");
  });

  it("renders product detail error and retries", async () => {
    const error = new Error("boom");
    const reset = vi.fn();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<ProductDetailError error={error} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalled();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Product detail failed to load",
        error,
      );
    });
    consoleSpy.mockRestore();
  });
});
