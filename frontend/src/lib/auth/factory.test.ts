import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  betterAuth: vi.fn(),
  drizzleAdapter: vi.fn(),
}));

vi.mock("better-auth", () => ({ betterAuth: mocks.betterAuth }));
vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: mocks.drizzleAdapter,
}));

import type { PrivateEnv } from "@/config/private-env-schema";

import { createAuth } from "./factory";

describe("createAuth", () => {
  beforeEach(() => {
    mocks.betterAuth.mockReset();
    mocks.drizzleAdapter.mockReset();
    mocks.drizzleAdapter.mockReturnValue("drizzle-adapter");
    mocks.betterAuth.mockReturnValue("auth-instance");
  });

  it("mantém os contratos de sessão, origem e abuso centralizados", () => {
    const database = {} as Parameters<typeof createAuth>[0];
    const schema = { user: {} };
    const environment: PrivateEnv = Object.freeze({
      databaseUrl:
        "postgresql://owner:secret@ep-test-pooler.sa-east-1.aws.neon.tech/fileflow?sslmode=require",
      betterAuthSecret: "a-secure-placeholder-with-32-characters",
      betterAuthUrl: "https://fileflow.example",
      betterAuthTrustedOrigins: Object.freeze([
        "https://fileflow.example",
      ]),
    });

    expect(createAuth(database, schema, environment)).toBe("auth-instance");
    expect(mocks.drizzleAdapter).toHaveBeenCalledWith(database, {
      provider: "pg",
      schema,
    });
    expect(mocks.betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://fileflow.example",
        trustedOrigins: ["https://fileflow.example"],
        emailAndPassword: expect.objectContaining({
          enabled: true,
          autoSignIn: true,
          minPasswordLength: 8,
          maxPasswordLength: 128,
        }),
        session: {
          expiresIn: 604_800,
          updateAge: 86_400,
          cookieCache: { enabled: false },
        },
        rateLimit: {
          enabled: true,
          storage: "database",
          customRules: {
            "/sign-in/email": { window: 10, max: 3 },
            "/sign-up/email": { window: 60, max: 5 },
          },
        },
      }),
    );
  });
});
