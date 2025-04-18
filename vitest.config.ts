import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 75,
        branches: 75,
        functions: 75,
        lines: 75,
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        ".astro/**",
        "**/*.d.ts",
        "test/**",
        "**/*.test.{ts,tsx}",
        "playwright.config.ts",
      ],
    },
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "test/e2e/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
