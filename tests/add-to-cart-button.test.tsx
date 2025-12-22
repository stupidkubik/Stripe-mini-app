import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddToCartButton } from "@/components/add-to-cart-button";

const mockAddItem = vi.fn();
const mockToast = vi.fn();

const product = {
  id: "prod-123",
  name: "Aloe Vera",
  description: "Green friend",
  image: "https://example.com/aloe.png",
  priceId: "price-123",
  currency: "USD",
  unitAmount: 2500,
};

vi.mock("@/app/store/cart", () => ({
  useCart: <T,>(selector: (state: { addItem: typeof mockAddItem }) => T) =>
    selector({ addItem: mockAddItem }),
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("AddToCartButton", () => {
  beforeEach(() => {
    mockAddItem.mockClear();
    mockToast.mockClear();
  });

  it("adds item and shows default toast", async () => {
    const user = userEvent.setup();

    render(<AddToCartButton product={product} />);

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledWith(
      {
        productId: product.id,
        priceId: product.priceId,
        name: product.name,
        image: product.image,
        unitAmount: product.unitAmount,
        currency: product.currency,
      },
      1,
    );
    expect(mockToast).toHaveBeenCalledWith({
      title: "Added to cart",
      description: "Aloe Vera • $25.00",
    });
  });

  it("uses custom quantity and toast description", async () => {
    const user = userEvent.setup();

    render(
      <AddToCartButton
        product={product}
        quantity={3}
        toastDescription="Custom copy"
      />,
    );

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.any(Object),
      3,
    );
    expect(mockToast).toHaveBeenCalledWith({
      title: "Added to cart",
      description: "Custom copy",
    });
  });
});
