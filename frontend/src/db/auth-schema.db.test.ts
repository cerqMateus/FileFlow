import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  assertTestDatabaseTarget,
  readPrivateEnv,
} from "@/config/private-env-schema";

import { account, rateLimit, session, user } from "./schema/auth";

const createdUserIds: string[] = [];
const createdRateLimitIds: string[] = [];

let pool: Pool;
let database: ReturnType<typeof drizzle>;

function userRecord(id: string, email: string) {
  return {
    id,
    name: "FileFlow Integration Test",
    email,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

beforeAll(() => {
  assertTestDatabaseTarget();
  const { databaseUrl } = readPrivateEnv();
  pool = new Pool({ connectionString: databaseUrl, max: 2 });
  database = drizzle({ client: pool });
});

afterAll(async () => {
  for (const id of createdRateLimitIds) {
    await database.delete(rateLimit).where(eq(rateLimit.id, id));
  }

  for (const id of createdUserIds) {
    await database.delete(user).where(eq(user.id, id));
  }

  await pool.end();
});

describe("authentication persistence", () => {
  it("connects through the pooled runtime URL", async () => {
    const result = await pool.query<{ value: number }>("select 1 as value");
    expect(result.rows).toEqual([{ value: 1 }]);
  });

  it("enforces unique user emails", async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const email = `unique-${randomUUID()}@fileflow.test`;
    createdUserIds.push(firstId, secondId);

    await database.insert(user).values(userRecord(firstId, email));

    await expect(
      database.insert(user).values(userRecord(secondId, email)),
    ).rejects.toMatchObject({ cause: { code: "23505" } });
  });

  it("enforces unique session tokens", async () => {
    const userId = randomUUID();
    const firstSessionId = randomUUID();
    const secondSessionId = randomUUID();
    const token = `session-${randomUUID()}`;
    const now = new Date();
    createdUserIds.push(userId);

    await database
      .insert(user)
      .values(userRecord(userId, `session-${randomUUID()}@fileflow.test`));
    await database.insert(session).values({
      id: firstSessionId,
      userId,
      token,
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
      updatedAt: now,
    });

    await expect(
      database.insert(session).values({
        id: secondSessionId,
        userId,
        token,
        expiresAt: new Date(now.getTime() + 60_000),
        createdAt: now,
        updatedAt: now,
      }),
    ).rejects.toMatchObject({ cause: { code: "23505" } });
  });

  it("cascades user deletion to accounts and sessions", async () => {
    const userId = randomUUID();
    const accountId = randomUUID();
    const sessionId = randomUUID();
    const now = new Date();

    await database
      .insert(user)
      .values(userRecord(userId, `cascade-${randomUUID()}@fileflow.test`));
    await database.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: "better-auth-managed-hash-placeholder",
      createdAt: now,
      updatedAt: now,
    });
    await database.insert(session).values({
      id: sessionId,
      userId,
      token: `cascade-${randomUUID()}`,
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
      updatedAt: now,
    });

    await database.delete(user).where(eq(user.id, userId));

    await expect(
      database.select().from(account).where(eq(account.id, accountId)),
    ).resolves.toHaveLength(0);
    await expect(
      database.select().from(session).where(eq(session.id, sessionId)),
    ).resolves.toHaveLength(0);
  });

  it("persists rate limiting across independent pools", async () => {
    const id = randomUUID();
    const key = `rate-limit-${randomUUID()}`;
    createdRateLimitIds.push(id);

    await database.insert(rateLimit).values({
      id,
      key,
      count: 1,
      lastRequest: Date.now(),
    });
    await database
      .update(rateLimit)
      .set({ count: 2 })
      .where(eq(rateLimit.id, id));

    const secondPool = new Pool({
      connectionString: readPrivateEnv().databaseUrl,
      max: 1,
    });
    const secondDatabase = drizzle({ client: secondPool });

    try {
      const persisted = await secondDatabase
        .select({ count: rateLimit.count })
        .from(rateLimit)
        .where(eq(rateLimit.id, id));
      expect(persisted).toEqual([{ count: 2 }]);
    } finally {
      await secondPool.end();
    }
  });
});
