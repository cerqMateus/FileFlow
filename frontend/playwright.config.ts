import { defineConfig } from "@playwright/test";

import {
  desktopProject,
  FRONTEND_URL,
  frontendWebServer,
} from "./playwright.shared";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "conversion.e2e.spec.ts",
  outputDir: "test-results/e2e",
  fullyParallel: false,
  timeout: 60_000,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI === undefined ? 0 : 2,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: frontendWebServer,
  projects: [desktopProject],
});
