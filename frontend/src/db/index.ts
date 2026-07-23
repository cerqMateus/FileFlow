import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { readPrivateEnv } from "@/config/private-env";

const POOL_ERROR_MESSAGE =
  "Uma conexão ociosa do banco foi encerrada inesperadamente.";

function createPool(): Pool {
  const { databaseUrl } = readPrivateEnv();
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  pool.on("error", () => {
    console.error(POOL_ERROR_MESSAGE);
  });

  return pool;
}

const globalForDatabase = globalThis as typeof globalThis & {
  fileFlowPool?: Pool;
};

export const pool = globalForDatabase.fileFlowPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.fileFlowPool = pool;
}

export const db = drizzle({ client: pool });
