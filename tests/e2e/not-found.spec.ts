import { test, expect } from "@playwright/test";

test("renders custom not-found page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);

  await expect(
    page.getByText(/we couldn't find what you were looking for/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /browse products/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /return home/i })).toBeVisible();
});
