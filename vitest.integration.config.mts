import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.integration.test.ts"],
    testTimeout: 15_000,
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
