import { test, expect } from "@playwright/test";

test.describe("Products catalog", () => {
  test("renders catalog header and content", async ({ page }) => {
    const response = await page.goto("/products");
    expect(response?.ok()).toBeTruthy();

    await expect(
      page.getByRole("heading", { name: "Products" }),
    ).toBeVisible();

    const grid = page.locator("ul[role='list']");
    const emptyState = page.getByText(/products are not available/i);
    await expect(grid.or(emptyState)).toBeVisible();
  });

  test("navigates to product details when items exist", async ({ page }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", { name: "Products" }),
    ).toBeVisible();

    const cards = page.locator("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      await expect(
        page.getByText(/products are not available/i),
      ).toBeVisible();
      return;
    }

    const firstCard = cards.first();
    const name = (await firstCard.locator("h3").textContent())?.trim();

    await firstCard.getByRole("link", { name: /view details/i }).click();
    await expect(page).toHaveURL(/\\/products\\//);

    if (name) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }

    await expect(
      page.getByRole("link", { name: /back to catalog/i }),
    ).toBeVisible();
  });
});
