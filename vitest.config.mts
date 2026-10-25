import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(import.meta.dirname, "tests/setup.tsx")],
    globals: true,
    css: false,
    exclude: [
      ...configDefaults.exclude,
      "tests/e2e/**",
      "tests/integration/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: path.resolve(import.meta.dirname, "coverage"),
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "tests/**",
        "playwright.config.ts",
        "**/playwright.config.ts",
        "vitest.config.mts",
        "next.config.ts",
        "eslint.config.mjs",
        "scripts/**",
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
      "server-only": path.resolve(
        import.meta.dirname,
        "./tests/test-utils/server-only.ts",
      ),
    },
  },
});
