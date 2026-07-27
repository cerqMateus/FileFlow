const NEON_HOST_SUFFIX = ".aws.neon.tech";
const TEST_SECRET = "primary-auth-test-secret-at-least-32-characters";

type MutableEnvironment = Record<string, string | undefined>;

export type PrimaryAuthTestEnvironment = Readonly<{
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_TRUSTED_ORIGINS: string;
}>;

function readPrimaryDatabaseUrl(environment: MutableEnvironment): string {
  const value = environment.DATABASE_URL ?? environment.CONNECTION_STRING;
  if (value === undefined || value === "") {
    throw new Error(
      "DATABASE_URL ou CONNECTION_STRING deve apontar para o banco principal.",
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("A conexão do banco principal deve ser uma URL válida.");
  }

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(NEON_HOST_SUFFIX) ||
    url.hostname.split(".")[0]?.endsWith("-pooler") !== true ||
    url.pathname === "" ||
    url.pathname === "/" ||
    url.searchParams.get("sslmode") !== "require"
  ) {
    throw new Error(
      "O teste principal exige uma conexão pooled do Neon com sslmode=require.",
    );
  }

  return value;
}

function readOrigin(value: string): string {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username !== "" ||
    url.password !== "" ||
    (url.pathname !== "" && url.pathname !== "/") ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("A origem do teste de autenticação deve ser canônica.");
  }
  return url.origin;
}

export function configurePrimaryAuthTestEnvironment(
  origin: string,
  environment: MutableEnvironment = process.env,
): PrimaryAuthTestEnvironment {
  if (environment.ALLOW_PRIMARY_AUTH_TESTS !== "true") {
    throw new Error(
      "Testes no banco principal exigem ALLOW_PRIMARY_AUTH_TESTS=true.",
    );
  }

  const canonicalOrigin = readOrigin(origin);
  const configured = Object.freeze({
    DATABASE_URL: readPrimaryDatabaseUrl(environment),
    BETTER_AUTH_SECRET: TEST_SECRET,
    BETTER_AUTH_URL: canonicalOrigin,
    BETTER_AUTH_TRUSTED_ORIGINS: canonicalOrigin,
  });

  Object.assign(environment, configured);
  return configured;
}
