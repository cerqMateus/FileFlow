import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { PrivateEnv } from "@/config/private-env-schema";
import * as authSchema from "@/db/schema/auth";

import { createAuth } from "./factory";

const schemaEnvironment: PrivateEnv = Object.freeze({
  databaseUrl:
    "postgresql://schema:placeholder@ep-schema-pooler.sa-east-1.aws.neon.tech/schema?sslmode=require",
  betterAuthSecret: "schema-generation-placeholder-secret",
  betterAuthUrl: "http://localhost:3000",
  betterAuthTrustedOrigins: Object.freeze(["http://localhost:3000"]),
});

const schemaPool = new Pool({
  connectionString: schemaEnvironment.databaseUrl,
  max: 1,
});
const schemaDatabase = drizzle({ client: schemaPool });

export const auth = createAuth(
  schemaDatabase,
  authSchema,
  schemaEnvironment,
);
