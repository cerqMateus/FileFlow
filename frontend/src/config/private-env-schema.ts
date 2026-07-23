export type EnvironmentSource = Readonly<
  Record<string, string | undefined>
>;

export type PrivateEnv = Readonly<{
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  betterAuthTrustedOrigins: readonly string[];
}>;

export type MigrationEnv = Readonly<{
  databaseMigrationUrl: string;
}>;

type DatabaseConnectionKind = "runtime" | "migration";

const NEON_HOST_SUFFIX = ".aws.neon.tech";

function required(environment: EnvironmentSource, name: string): string {
  const value = environment[name];
  if (value === undefined || value === "") {
    throw new Error(`${name} não foi definida.`);
  }

  return value;
}

function invalid(name: string, expected: string): never {
  throw new Error(`${name} ${expected}.`);
}

function parseUrl(name: string, value: string): URL {
  try {
    return new URL(value);
  } catch {
    return invalid(name, "deve ser uma URL válida");
  }
}

function readNeonUrl(
  name: "DATABASE_URL" | "DATABASE_MIGRATION_URL",
  value: string,
  kind: DatabaseConnectionKind,
): string {
  const url = parseUrl(name, value);

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    return invalid(name, "deve usar o protocolo PostgreSQL");
  }

  if (
    url.username === "" ||
    url.password === "" ||
    url.hostname === "" ||
    url.pathname === "" ||
    url.pathname === "/"
  ) {
    return invalid(name, "deve conter credenciais, host e database");
  }

  if (!url.hostname.endsWith(NEON_HOST_SUFFIX)) {
    return invalid(name, "deve apontar para um endpoint Neon");
  }

  const isPooled = url.hostname.split(".")[0]?.endsWith("-pooler") === true;
  if (kind === "runtime" && !isPooled) {
    return invalid(name, "deve usar a conexão pooled do Neon");
  }

  if (kind === "migration" && isPooled) {
    return invalid(name, "deve usar a conexão direta do Neon");
  }

  if (url.searchParams.get("sslmode") !== "require") {
    return invalid(name, "deve exigir SSL com sslmode=require");
  }

  return value;
}

function readCanonicalOrigin(name: string, value: string): string {
  const url = parseUrl(name, value);

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username !== "" ||
    url.password !== "" ||
    (url.pathname !== "" && url.pathname !== "/") ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    return invalid(name, "deve ser uma origem HTTP(S) canônica");
  }

  return url.origin;
}

function readTrustedOrigins(value: string): readonly string[] {
  const origins = value.split(",").map((origin) => origin.trim());
  if (origins.some((origin) => origin === "")) {
    return invalid(
      "BETTER_AUTH_TRUSTED_ORIGINS",
      "deve conter apenas origens explícitas",
    );
  }

  const normalizedOrigins = origins.map((origin) =>
    readCanonicalOrigin("BETTER_AUTH_TRUSTED_ORIGINS", origin),
  );

  if (new Set(normalizedOrigins).size !== normalizedOrigins.length) {
    return invalid(
      "BETTER_AUTH_TRUSTED_ORIGINS",
      "não deve conter origens duplicadas",
    );
  }

  return Object.freeze(normalizedOrigins);
}

export function readPrivateEnv(
  environment: EnvironmentSource = process.env,
): PrivateEnv {
  const databaseUrl = readNeonUrl(
    "DATABASE_URL",
    required(environment, "DATABASE_URL"),
    "runtime",
  );
  const betterAuthSecret = required(environment, "BETTER_AUTH_SECRET");
  if (
    betterAuthSecret.length < 32 ||
    betterAuthSecret.trim() !== betterAuthSecret
  ) {
    return invalid(
      "BETTER_AUTH_SECRET",
      "deve possuir ao menos 32 caracteres e não conter espaços externos",
    );
  }

  const betterAuthUrl = readCanonicalOrigin(
    "BETTER_AUTH_URL",
    required(environment, "BETTER_AUTH_URL"),
  );
  const betterAuthTrustedOrigins = readTrustedOrigins(
    required(environment, "BETTER_AUTH_TRUSTED_ORIGINS"),
  );

  if (!betterAuthTrustedOrigins.includes(betterAuthUrl)) {
    return invalid(
      "BETTER_AUTH_TRUSTED_ORIGINS",
      "deve incluir BETTER_AUTH_URL",
    );
  }

  return Object.freeze({
    databaseUrl,
    betterAuthSecret,
    betterAuthUrl,
    betterAuthTrustedOrigins,
  });
}

export function readMigrationEnv(
  environment: EnvironmentSource = process.env,
): MigrationEnv {
  return Object.freeze({
    databaseMigrationUrl: readNeonUrl(
      "DATABASE_MIGRATION_URL",
      required(environment, "DATABASE_MIGRATION_URL"),
      "migration",
    ),
  });
}

export function neonEndpointId(connectionString: string): string {
  const hostname = parseUrl("DATABASE_URL", connectionString).hostname;
  const endpoint = hostname.split(".")[0];
  if (endpoint === undefined || endpoint === "") {
    return invalid("DATABASE_URL", "não possui um endpoint Neon identificável");
  }

  return endpoint.replace(/-pooler$/, "");
}

export function databaseName(connectionString: string): string {
  const pathname = parseUrl("DATABASE_URL", connectionString).pathname;
  const name = decodeURIComponent(pathname.replace(/^\//, ""));
  if (name === "" || name.includes("/")) {
    return invalid("DATABASE_URL", "não possui um database identificável");
  }

  return name;
}

export function assertTestDatabaseTarget(
  environment: EnvironmentSource = process.env,
): void {
  const expectedEndpoint = required(environment, "NEON_TEST_ENDPOINT_ID");
  const expectedDatabase = required(environment, "NEON_TEST_DATABASE");
  if (!/^ep-[a-z0-9-]+$/.test(expectedEndpoint)) {
    return invalid(
      "NEON_TEST_ENDPOINT_ID",
      "deve identificar explicitamente o endpoint Neon de testes",
    );
  }

  if (!/^[a-z][a-z0-9_]*$/.test(expectedDatabase)) {
    return invalid(
      "NEON_TEST_DATABASE",
      "deve identificar explicitamente o database de testes",
    );
  }

  const privateEnv = readPrivateEnv(environment);
  const migrationEnv = readMigrationEnv(environment);
  const runtimeEndpoint = neonEndpointId(privateEnv.databaseUrl);
  const migrationEndpoint = neonEndpointId(
    migrationEnv.databaseMigrationUrl,
  );
  const runtimeDatabase = databaseName(privateEnv.databaseUrl);
  const migrationDatabase = databaseName(
    migrationEnv.databaseMigrationUrl,
  );

  if (
    runtimeEndpoint !== expectedEndpoint ||
    migrationEndpoint !== expectedEndpoint ||
    runtimeDatabase !== expectedDatabase ||
    migrationDatabase !== expectedDatabase
  ) {
    throw new Error(
      "Guardrail de banco rejeitou um endpoint diferente do ambiente de testes.",
    );
  }
}
