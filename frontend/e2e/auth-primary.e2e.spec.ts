import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";
import { Pool } from "pg";

import { FRONTEND_URL } from "../playwright.shared";

const PASSWORD = "FileFlow-browser-password-42";
const WRONG_PASSWORD = "FileFlow-wrong-password-42";
const AUTH_FLOW_TIMEOUT = 30_000;
const RUN_ID = randomUUID();
const IP_SEED = (Number.parseInt(RUN_ID.slice(0, 2), 16) % 180) + 1;
const RATE_LIMIT_PATHS = [
  "/get-session",
  "/sign-up/email",
  "/sign-in/email",
  "/sign-out",
] as const;

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined || databaseUrl === "") {
  throw new Error("DATABASE_URL não foi configurada para o E2E principal.");
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
const createdEmails = new Set<string>();
const ownedRateLimitKeys = new Set<string>();
let testSequence = 0;
let currentIp = "";

function createIdentity(label: string) {
  const email = `group5-${label}-${RUN_ID}@fileflow.test`;
  createdEmails.add(email);
  return {
    email,
    name: `Grupo 5 ${label}`,
  };
}

function requestHeaders() {
  return {
    origin: FRONTEND_URL,
    "x-forwarded-for": currentIp,
  };
}

async function signUpThroughApi(
  page: Page,
  identity: ReturnType<typeof createIdentity>,
) {
  const response = await page.request.post("/api/auth/sign-up/email", {
    headers: requestHeaders(),
    data: {
      name: identity.name,
      email: identity.email,
      password: PASSWORD,
    },
  });
  expect(response.status()).toBe(200);
}

async function signOutThroughApi(page: Page) {
  const response = await page.request.post("/api/auth/sign-out", {
    headers: requestHeaders(),
    data: {},
  });
  expect(response.status()).toBe(200);
}

async function fillSignUp(
  page: Page,
  identity: ReturnType<typeof createIdentity>,
  confirmation = PASSWORD,
) {
  await page.getByLabel("Nome").fill(identity.name);
  await page.getByLabel("E-mail").fill(identity.email);
  await page.getByLabel("Senha", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirmar senha").fill(confirmation);
}

async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  testSequence += 1;
  const lastOctet = ((IP_SEED + testSequence - 1) % 254) + 1;
  currentIp = `198.51.100.${lastOctet}`;
  const keys = RATE_LIMIT_PATHS.map((path) => `${currentIp}|${path}`);
  keys.forEach((key) => ownedRateLimitKeys.add(key));
  await pool.query('delete from "rate_limit" where key = any($1::text[])', [
    keys,
  ]);
  await page.setExtraHTTPHeaders({ "x-forwarded-for": currentIp });
});

test.afterAll(async () => {
  try {
    const emails = [...createdEmails];
    if (emails.length > 0) {
      await pool.query('delete from "user" where email = any($1::text[])', [
        emails,
      ]);
    }

    const keys = [...ownedRateLimitKeys];
    if (keys.length > 0) {
      await pool.query('delete from "rate_limit" where key = any($1::text[])', [
        keys,
      ]);
    }

    const residue = await pool.query<{ count: number }>(
      'select count(*)::int as count from "user" where email = any($1::text[])',
      [emails],
    );
    expect(residue.rows[0]?.count).toBe(0);
  } finally {
    await pool.end();
  }
});

test("protege dashboard e normaliza callbacks não confiáveis", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\?callbackURL=%2Fdashboard$/u);

  for (const callbackUrl of [
    "https://evil.example/roubo",
    "//evil.example/roubo",
  ]) {
    await page.goto(`/auth?callbackURL=${encodeURIComponent(callbackUrl)}`);
    await expect(page.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/auth?modo=cadastro&callbackURL=%2Fdashboard",
    );
  }
});

test("mantém labels, ordem de teclado e foco do resumo a 320 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/auth");

  const email = page.getByLabel("E-mail");
  const password = page.getByLabel("Senha");
  const submit = page.getByRole("button", { name: "Entrar" });
  await email.focus();
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();

  await submit.click();
  await expect(
    page.getByText("Revise os campos destacados antes de continuar."),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("impede cadastro com confirmação divergente sem request", async ({ page }) => {
  const identity = createIdentity("confirmacao");
  let signUpRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/auth/sign-up/email") {
      signUpRequests += 1;
    }
  });

  await page.goto("/auth?modo=cadastro");
  await fillSignUp(page, identity, "senha-diferente");
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(page.getByText("As senhas não coincidem.")).toBeVisible();
  expect(signUpRequests).toBe(0);
});

test("cadastra, persiste sessão no reload e encerra o acesso", async ({ page }) => {
  const identity = createIdentity("cadastro");
  await page.goto("/auth?modo=cadastro");
  await fillSignUp(page, identity);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(page).toHaveURL(/\/dashboard$/u, {
    timeout: AUTH_FLOW_TIMEOUT,
  });
  await expect(page.getByText(identity.name, { exact: true })).toBeVisible();
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
  const storageAudit = await page.evaluate(
    ({ email, password }) => {
      const entries = [
        ...Object.entries(localStorage),
        ...Object.entries(sessionStorage),
      ];
      return {
        localKeys: Object.keys(localStorage),
        unexpectedAuthKeys: entries
          .map(([key]) => key)
          .filter(
            (key) =>
              !key.startsWith("__next") &&
              /auth|token|session/iu.test(key),
          ),
        containsCredentials: entries.some(
          ([, value]) => value.includes(email) || value.includes(password),
        ),
      };
    },
    { email: identity.email, password: PASSWORD },
  );
  expect(storageAudit).toEqual({
    localKeys: [],
    unexpectedAuthKeys: [],
    containsCredentials: false,
  });

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/auth$/u, { timeout: AUTH_FLOW_TIMEOUT });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\?callbackURL=%2Fdashboard$/u);
});

test("mantém mensagem segura para e-mail duplicado", async ({ page }) => {
  const identity = createIdentity("duplicado");
  await signUpThroughApi(page, identity);
  await signOutThroughApi(page);

  await page.goto("/auth?modo=cadastro");
  await fillSignUp(page, identity);
  await page.getByRole("button", { name: "Criar minha conta" }).click();

  await expect(
    page.getByText(
      "Não foi possível criar sua conta. Revise os dados e tente novamente.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("E-mail")).toHaveValue(identity.email);
  await expect(page.getByLabel("Senha", { exact: true })).toHaveValue("");
});

test("rejeita senha inválida e aceita login válido", async ({ page }) => {
  const identity = createIdentity("login");
  await signUpThroughApi(page, identity);
  await signOutThroughApi(page);

  await page.goto("/auth");
  await fillLogin(page, identity.email, WRONG_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();

  const anonymous = await page.request.get("/api/auth/get-session", {
    headers: requestHeaders(),
  });
  expect(await anonymous.json()).toBeNull();

  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u, {
    timeout: AUTH_FLOW_TIMEOUT,
  });
  await expect(page.getByText(identity.email, { exact: true })).toBeVisible();
});

test("retorna a callback interna e ignora callback externa após login", async ({
  page,
}) => {
  const identity = createIdentity("callback");
  await signUpThroughApi(page, identity);
  await signOutThroughApi(page);

  await page.goto("/auth?callbackURL=%2F");
  await fillLogin(page, identity.email, PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(FRONTEND_URL + "/", {
    timeout: AUTH_FLOW_TIMEOUT,
  });

  await signOutThroughApi(page);
  await page.goto(
    `/auth?callbackURL=${encodeURIComponent("https://evil.example/roubo")}`,
  );
  await fillLogin(page, identity.email, PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u, {
    timeout: AUTH_FLOW_TIMEOUT,
  });
});
