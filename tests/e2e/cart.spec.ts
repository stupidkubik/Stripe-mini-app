import { test, expect } from "@playwright/test";

test.describe("Cart page", () => {
  test("shows empty state without local storage items", async ({ page }) => {
    const response = await page.goto("/cart");
    expect(response?.ok()).toBeTruthy();

    await expect(
      page.getByRole("heading", { name: "Your cart" }),
    ).toBeVisible();
    await expect(
      page.getByText(/You haven't added anything yet/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /browse products/i }),
    ).toBeVisible();
  });

  test("clears items when the user empties the cart", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "cart",
        JSON.stringify({
          state: {
            items: [
              {
                productId: "prod_fake",
                priceId: "price_fake",
                name: "Test Product",
                image:
                  "https://images.unsplash.com/photo-1470163395405-d2b80e7450ed?auto=format&fit=crop&w=400&q=80",
                unitAmount: 1500,
                currency: "USD",
                quantity: 2,
              },
            ],
          },
          version: 0,
        }),
      );
    });

    await page.goto("/cart");

    await expect(
      page.getByRole("button", { name: /clear cart/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /clear cart/i }).click();
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });
});
