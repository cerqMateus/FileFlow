import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { PrivateEnv } from "@/config/private-env-schema";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

type AuthDatabase = Parameters<typeof drizzleAdapter>[0];

export function createAuth(
  database: AuthDatabase,
  schema: Record<string, unknown>,
  environment: PrivateEnv,
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),
    secret: environment.betterAuthSecret,
    baseURL: environment.betterAuthUrl,
    trustedOrigins: [...environment.betterAuthTrustedOrigins],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: SEVEN_DAYS_IN_SECONDS,
      updateAge: ONE_DAY_IN_SECONDS,
      cookieCache: {
        enabled: false,
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: {
        "/sign-in/email": {
          window: 10,
          max: 3,
        },
        "/sign-up/email": {
          window: 60,
          max: 5,
        },
      },
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
  });
}
