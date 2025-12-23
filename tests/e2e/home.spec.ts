import { test, expect } from "@playwright/test";

test("renders home hero content", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /bring calm/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /explore catalog/i }),
  ).toBeVisible();
});
