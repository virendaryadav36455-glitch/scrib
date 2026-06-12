// packages/trpc/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals:     true,
    environment: "node",
    setupFiles:  ["./server/__tests__/setup.ts"],
    coverage: {
      provider:   "v8",
      reporter:   ["text", "lcov"],
      include:    ["server/**/*.ts"],
      exclude:    ["server/__tests__/**"],
      thresholds: { lines: 75, functions: 75 },
    },
    testTimeout: 10000,
  },
});
