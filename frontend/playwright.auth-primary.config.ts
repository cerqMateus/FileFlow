import { loadEnvConfig } from "@next/env";
import { defineConfig } from "@playwright/test";

import {
  desktopProject,
  FRONTEND_URL,
  frontendWebServer,
} from "./playwright.shared";
import { configurePrimaryAuthTestEnvironment } from "./src/test/primary-auth-environment";

loadEnvConfig(process.cwd());

const authEnvironment = configurePrimaryAuthTestEnvironment(FRONTEND_URL);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "auth-primary.e2e.spec.ts",
  outputDir: "test-results/auth-primary",
  fullyParallel: false,
  timeout: 60_000,
  forbidOnly: process.env.CI !== undefined,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    ...frontendWebServer,
    reuseExistingServer: false,
    env: {
      ...frontendWebServer.env,
      ...authEnvironment,
    },
  },
  projects: [desktopProject],
});
