import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const HOST = process.env.E2E_HOST ?? "127.0.0.1";
const BASE_URL = process.env.E2E_BASE_URL ?? `http://${HOST}:${PORT}`;
const SHOULD_START_SERVER = process.env.E2E_SKIP_WEBSERVER !== "1";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "dot" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: SHOULD_START_SERVER
    ? {
        command: process.env.CI
          ? `npm run dev -- --hostname ${HOST} --port ${PORT}`
          : `npm run dev -- --hostname ${HOST} --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
