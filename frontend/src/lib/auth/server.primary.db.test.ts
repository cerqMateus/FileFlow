import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const AUTH_ORIGIN = "https://fileflow-auth-test.invalid";
const PASSWORD = "FileFlow-primary-test-password-42";
const FLOW_IP = "192.0.2.31";
const ORIGIN_IP = "192.0.2.32";
const LOGIN_LIMIT_IP = "192.0.2.33";
const SIGNUP_LIMIT_IP = "192.0.2.34";

const runId = randomUUID();
const email = `group3-${runId}@fileflow.test`;
const knownRateLimitKeys = [
  `${FLOW_IP}|/get-session`,
  `${FLOW_IP}|/sign-up/email`,
  `${FLOW_IP}|/sign-in/email`,
  `${FLOW_IP}|/sign-out`,
  `${FLOW_IP}|/unsupported-route`,
  `${ORIGIN_IP}|/sign-up/email`,
  `${LOGIN_LIMIT_IP}|/sign-in/email`,
  `${SIGNUP_LIMIT_IP}|/sign-up/email`,
];

type AuthInstance = (typeof import("./server"))["auth"];
type DatabasePool = (typeof import("@/db"))["pool"];

let auth: AuthInstance;
let pool: DatabasePool;

function configureEnvironment(): void {
  Object.assign(process.env, { NODE_ENV: "production", TEST: "false" });
}

function request(
  path: string,
  options: Readonly<{
    body?: Record<string, unknown>;
    cookie?: string;
    ip?: string;
    method?: "GET" | "POST";
    origin?: string;
  }> = {},
): Promise<Response> {
  const headers = new Headers({
    origin: options.origin ?? AUTH_ORIGIN,
    "x-forwarded-for": options.ip ?? FLOW_IP,
  });

  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.cookie !== undefined) {
    headers.set("cookie", options.cookie);
  }

  return auth.handler(
    new Request(`${AUTH_ORIGIN}/api/auth${path}`, {
      method: options.method ?? "GET",
      headers,
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    }),
  );
}

function cookieFrom(response: Response): string {
  const setCookie = response.headers.get("set-cookie");
  if (setCookie === null) {
    throw new Error("A resposta não definiu cookie de sessão.");
  }

  const cookie = setCookie.split(";", 1)[0];
  if (cookie === undefined || cookie === "") {
    throw new Error("O cookie de sessão está vazio.");
  }

  return cookie;
}

beforeAll(async () => {
  configureEnvironment();
  ({ auth } = await import("./server"));
  ({ pool } = await import("@/db"));
});

afterAll(async () => {
  if (pool === undefined) {
    return;
  }

  await pool.query('delete from "user" where email = $1', [email]);
  await pool.query('delete from "rate_limit" where key = any($1::text[])', [
    knownRateLimitKeys,
  ]);
  await pool.end();
});

describe.sequential("Better Auth no banco principal", () => {
  it("confirma o histórico aplicado de migrations sem alterar o schema", async () => {
    const migrationTable = await pool.query<{ name: string | null }>(
      "select to_regclass('drizzle.__drizzle_migrations')::text as name",
    );
    expect(migrationTable.rows[0]?.name).toBe(
      "drizzle.__drizzle_migrations",
    );

    const migrationCount = await pool.query<{ count: number }>(
      'select count(*)::int as count from "drizzle"."__drizzle_migrations"',
    );
    expect(migrationCount.rows[0]?.count).toBeGreaterThanOrEqual(1);
  });

  it("cobre cadastro, sessão, login, expiração e logout com limpeza própria", async () => {
    const anonymous = await request("/get-session");
    expect(anonymous.status).toBe(200);
    await expect(anonymous.json()).resolves.toBeNull();

    const rejectedOrigin = await request("/sign-up/email", {
      method: "POST",
      ip: ORIGIN_IP,
      origin: "https://evil.example",
      cookie: "csrf-probe=1",
      body: { name: "Grupo 3", email, password: PASSWORD },
    });
    expect(rejectedOrigin.status).toBe(403);

    const signUp = await request("/sign-up/email", {
      method: "POST",
      body: { name: "Grupo 3", email, password: PASSWORD },
    });
    expect(signUp.status).toBe(200);
    const signUpCookie = cookieFrom(signUp);
    const setCookie = signUp.headers.get("set-cookie")?.toLowerCase() ?? "";
    expect(setCookie).toContain("httponly");
    expect(setCookie).toContain("secure");
    expect(setCookie).toContain("samesite=lax");
    expect(setCookie).not.toContain("domain=");

    const persisted = await pool.query<{
      account_count: number;
      password: string;
      session_count: number;
      user_id: string;
    }>(
      `select
        u.id as user_id,
        count(distinct a.id)::int as account_count,
        count(distinct s.id)::int as session_count,
        max(a.password) as password
      from "user" u
      join "account" a on a.user_id = u.id
      join "session" s on s.user_id = u.id
      where u.email = $1
      group by u.id`,
      [email],
    );
    expect(persisted.rows).toHaveLength(1);
    expect(persisted.rows[0]).toMatchObject({
      account_count: 1,
      session_count: 1,
    });
    expect(persisted.rows[0]?.password).not.toBe(PASSWORD);

    const duplicate = await request("/sign-up/email", {
      method: "POST",
      body: { name: "Duplicado", email, password: PASSWORD },
    });
    expect(duplicate.status).not.toBe(200);
    const userCount = await pool.query<{ count: number }>(
      'select count(*)::int as count from "user" where email = $1',
      [email],
    );
    expect(userCount.rows[0]?.count).toBe(1);

    const authenticated = await request("/get-session", {
      cookie: signUpCookie,
    });
    expect(authenticated.status).toBe(200);
    await expect(authenticated.json()).resolves.toMatchObject({
      user: { email },
    });

    const signOut = await request("/sign-out", {
      method: "POST",
      cookie: signUpCookie,
    });
    expect(signOut.status).toBe(200);
    const revoked = await request("/get-session", { cookie: signUpCookie });
    await expect(revoked.json()).resolves.toBeNull();

    const wrongPassword = await request("/sign-in/email", {
      method: "POST",
      body: { email, password: "incorrect-password" },
    });
    expect(wrongPassword.status).toBe(401);

    const signIn = await request("/sign-in/email", {
      method: "POST",
      body: { email, password: PASSWORD },
    });
    expect(signIn.status).toBe(200);
    const signInCookie = cookieFrom(signIn);

    await pool.query(
      'update "session" set expires_at = $1 where user_id = $2',
      [new Date(0), persisted.rows[0]?.user_id],
    );
    const expired = await request("/get-session", { cookie: signInCookie });
    await expect(expired.json()).resolves.toBeNull();

    const unsupported = await request("/unsupported-route");
    expect(unsupported.status).toBe(404);
    expect(await unsupported.text()).not.toContain("postgresql://");
  });

  it("persiste e aplica os limites específicos de login e cadastro", async () => {
    const loginStatuses: number[] = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await request("/sign-in/email", {
        method: "POST",
        ip: LOGIN_LIMIT_IP,
        body: {
          email: `missing-${runId}@fileflow.test`,
          password: PASSWORD,
        },
      });
      loginStatuses.push(response.status);
    }
    expect(loginStatuses.slice(0, 3)).not.toContain(429);
    expect(loginStatuses[3]).toBe(429);

    const signupStatuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await request("/sign-up/email", {
        method: "POST",
        ip: SIGNUP_LIMIT_IP,
        body: {},
      });
      signupStatuses.push(response.status);
    }
    expect(signupStatuses.slice(0, 5)).not.toContain(429);
    expect(signupStatuses[5]).toBe(429);

    const rateLimits = await pool.query<{ count: number; key: string }>(
      'select key, count from "rate_limit" where key = any($1::text[])',
      [[
        `${LOGIN_LIMIT_IP}|/sign-in/email`,
        `${SIGNUP_LIMIT_IP}|/sign-up/email`,
      ]],
    );
    expect(rateLimits.rows).toEqual(
      expect.arrayContaining([
        { key: `${LOGIN_LIMIT_IP}|/sign-in/email`, count: 3 },
        { key: `${SIGNUP_LIMIT_IP}|/sign-up/email`, count: 5 },
      ]),
    );
  });
});
