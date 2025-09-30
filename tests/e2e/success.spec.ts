import { test, expect } from "@playwright/test";

test("redirects to cart when session id is missing", async ({ page }) => {
  await page.goto("/success");

  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
});
