import path from "node:path";

import { defineConfig } from "@playwright/test";

import {
  BACKEND_PORT,
  desktopProject,
  FRONTEND_URL,
  frontendWebServer,
} from "./playwright.shared";

const backendPython =
  process.env.BACKEND_PYTHON ??
  (process.platform === "win32"
    ? path.resolve(process.cwd(), "..", "venv", "Scripts", "python.exe")
    : "python");
const backendDirectory = path.resolve(process.cwd(), "..", "backend");

export default defineConfig({
  testDir: "./e2e",
  testMatch: "smoke.e2e.spec.ts",
  outputDir: "test-results/smoke",
  forbidOnly: process.env.CI !== undefined,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: [
    {
      command: `"${backendPython}" -m uvicorn app.main:app --app-dir "${backendDirectory}" --host 127.0.0.1 --port ${BACKEND_PORT}`,
      port: BACKEND_PORT,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        BACKEND_CORS_ORIGINS: FRONTEND_URL,
      },
    },
    {
      ...frontendWebServer,
      reuseExistingServer: false,
    },
  ],
  projects: [desktopProject],
});
