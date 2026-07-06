import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  globalSetup: "./src/e2e/global-setup.mjs",
  workers: 2,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    // retain-on-failure: keeps trace (network + console + DOM) only when a test fails
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      DISABLE_LLM_NOTIFICATIONS: "1",
    },
  },
});
