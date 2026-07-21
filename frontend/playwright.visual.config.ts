import { defineConfig } from "@playwright/test";

import {
  desktopProject,
  FRONTEND_URL,
  mobileProject,
  productionFrontendWebServer,
} from "./playwright.shared";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "visual.e2e.spec.ts",
  outputDir: "test-results/visual",
  fullyParallel: false,
  forbidOnly: process.env.CI !== undefined,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: productionFrontendWebServer,
  projects: [desktopProject, mobileProject],
});
