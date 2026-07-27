import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { readMigrationEnv } from "./src/config/private-env-schema";

loadEnvConfig(process.cwd());

const { databaseMigrationUrl } = readMigrationEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/auth.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseMigrationUrl,
  },
});
