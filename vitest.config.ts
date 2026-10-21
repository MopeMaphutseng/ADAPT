import { defineConfig } from "vitest/config";
import path from "path";

const TEST_DB =
  process.env.TEST_DATABASE_URL ?? "postgresql://adapt@127.0.0.1:5433/adapt_test";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    env: {
      DATABASE_URL: TEST_DB,
      SESSION_SECRET: process.env.SESSION_SECRET ?? "test-only-session-secret-please-change",
      NODE_ENV: "test",
      SMTP_HOST: "",
    },
    // Fresh state per file; the test DB is wiped in helper beforeAll.
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: { concurrent: false },
  },
});