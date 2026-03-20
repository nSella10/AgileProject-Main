import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Guessify E2E tests.
 *
 * Starts the backend, create-app, and marketing-website before running tests.
 * In CI, MongoDB is provided via a service container.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,

  use: {
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

  webServer: [
    {
      command: "cd backend && npm start",
      port: 8000,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: "8000",
        NODE_ENV: "test",
        JWT_SECRET: "playwright-test-secret",
        MONGO_URI:
          process.env.MONGO_URI ||
          "mongodb://localhost:27017/guessify_e2e_test",
        DISABLE_EXTERNAL_APIS: "true",
      },
    },
    {
      command: "cd create-app && npm start",
      port: 3001,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: "3001",
        BROWSER: "none",
        NODE_ENV: "development",
      },
    },
    {
      command: "cd marketing-website && npm start",
      port: 3000,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: "3000",
        BROWSER: "none",
      },
    },
  ],
});
