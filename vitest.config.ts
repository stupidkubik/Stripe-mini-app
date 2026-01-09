import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "tests/setup.tsx")],
    globals: true,
    css: false,
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: path.resolve(__dirname, "coverage"),
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "tests/**",
        "playwright.config.ts",
        "**/playwright.config.ts",
        "vitest.config.ts",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        "scripts/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "server-only": path.resolve(
        __dirname,
        "./tests/test-utils/server-only.ts",
      ),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
