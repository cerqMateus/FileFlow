import { devices, type Project } from "@playwright/test";

export const FRONTEND_PORT = 3100;
export const BACKEND_PORT = 8000;
export const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`;
export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const browserChannel = process.env.PLAYWRIGHT_CHANNEL;

export const frontendWebServer = {
  command: `npm run dev -- --hostname 127.0.0.1 --port ${FRONTEND_PORT}`,
  port: FRONTEND_PORT,
  reuseExistingServer: process.env.CI === undefined,
  timeout: 120_000,
  env: {
    NEXT_PUBLIC_API_BASE_URL: BACKEND_URL,
  },
} as const;

export const productionFrontendWebServer = {
  command: `npm run start -- --hostname 127.0.0.1 --port ${FRONTEND_PORT}`,
  port: FRONTEND_PORT,
  reuseExistingServer: false,
  timeout: 120_000,
  env: {
    NEXT_PUBLIC_API_BASE_URL: BACKEND_URL,
  },
} as const;

export const desktopProject: Project = {
  name: "desktop-chromium",
  use: {
    ...devices["Desktop Chrome"],
    ...(browserChannel === undefined ? {} : { channel: browserChannel }),
    viewport: { width: 1440, height: 900 },
  },
};

export const mobileProject: Project = {
  name: "mobile-chromium",
  use: {
    ...devices["Pixel 7"],
    ...(browserChannel === undefined ? {} : { channel: browserChannel }),
    viewport: { width: 390, height: 844 },
  },
};
