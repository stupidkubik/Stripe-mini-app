import { test, expect } from "@playwright/test";

test("shows payment success messaging", async ({ page }) => {
  const response = await page.goto("/success");
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByRole("heading", { name: /payment successful/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});
