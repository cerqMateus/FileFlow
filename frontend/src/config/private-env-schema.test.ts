import { describe, expect, it } from "vitest";

import {
  assertTestDatabaseTarget,
  databaseName,
  neonEndpointId,
  readMigrationEnv,
  readPrivateEnv,
  type EnvironmentSource,
} from "./private-env-schema";

const VALID_ENVIRONMENT: EnvironmentSource = Object.freeze({
  DATABASE_URL:
    "postgresql://owner:runtime-secret@ep-fileflow-test-pooler.sa-east-1.aws.neon.tech/fileflow_test?sslmode=require",
  DATABASE_MIGRATION_URL:
    "postgresql://owner:migration-secret@ep-fileflow-test.sa-east-1.aws.neon.tech/fileflow_test?sslmode=require",
  NEON_TEST_ENDPOINT_ID: "ep-fileflow-test",
  NEON_TEST_DATABASE: "fileflow_test",
  BETTER_AUTH_SECRET: "a-secure-placeholder-with-32-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_TRUSTED_ORIGINS:
    "http://localhost:3000,https://fileflow.example",
});

function environmentWith(
  overrides: EnvironmentSource,
): EnvironmentSource {
  return Object.freeze({ ...VALID_ENVIRONMENT, ...overrides });
}

describe("private environment", () => {
  it("reads valid server and migration configuration", () => {
    const privateEnv = readPrivateEnv(VALID_ENVIRONMENT);
    const migrationEnv = readMigrationEnv(VALID_ENVIRONMENT);

    expect(privateEnv.betterAuthUrl).toBe("http://localhost:3000");
    expect(privateEnv.betterAuthTrustedOrigins).toEqual([
      "http://localhost:3000",
      "https://fileflow.example",
    ]);
    expect(migrationEnv.databaseMigrationUrl).toContain(
      "ep-fileflow-test.sa-east-1.aws.neon.tech",
    );
  });

  it.each([
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_TRUSTED_ORIGINS",
  ])("fails early when %s is missing", (name) => {
    expect(() =>
      readPrivateEnv(environmentWith({ [name]: undefined })),
    ).toThrow(name);
  });

  it("requires pooled runtime and direct migration connections", () => {
    expect(() =>
      readPrivateEnv(
        environmentWith({
          DATABASE_URL: VALID_ENVIRONMENT.DATABASE_MIGRATION_URL,
        }),
      ),
    ).toThrow("DATABASE_URL deve usar a conexão pooled");

    expect(() =>
      readMigrationEnv(
        environmentWith({
          DATABASE_MIGRATION_URL: VALID_ENVIRONMENT.DATABASE_URL,
        }),
      ),
    ).toThrow("DATABASE_MIGRATION_URL deve usar a conexão direta");
  });

  it("requires SSL for both database connections", () => {
    expect(() =>
      readPrivateEnv(
        environmentWith({
          DATABASE_URL:
            "postgresql://owner:secret@ep-fileflow-test-pooler.sa-east-1.aws.neon.tech/fileflow_test",
        }),
      ),
    ).toThrow("DATABASE_URL deve exigir SSL");
  });

  it("accepts local PostgreSQL connections without Neon pooler or SSL rules", () => {
    const localEnvironment = environmentWith({
      DATABASE_URL: "postgresql://fileflow:local-password@localhost:5432/fileflow_db",
      DATABASE_MIGRATION_URL:
        "postgres://fileflow:local-password@postgres:5432/fileflow_db",
      NEON_TEST_ENDPOINT_ID: undefined,
      NEON_TEST_DATABASE: undefined,
    });

    expect(readPrivateEnv(localEnvironment).databaseUrl).toContain("localhost");
    expect(readMigrationEnv(localEnvironment).databaseMigrationUrl).toContain(
      "@postgres:5432",
    );
    expect(() => assertTestDatabaseTarget(localEnvironment)).not.toThrow();
  });

  it("can explicitly enforce Neon constraints for a non-Neon endpoint", () => {
    expect(() =>
      readPrivateEnv(
        environmentWith({
          DATABASE_URL:
            "postgresql://fileflow:local-password@localhost:5432/fileflow_db",
          ENFORCE_NEON_CONSTRAINTS: "true",
        }),
      ),
    ).toThrow("DATABASE_URL deve apontar para um endpoint Neon");
  });

  it("rejects malformed secrets and origins", () => {
    expect(() =>
      readPrivateEnv(
        environmentWith({ BETTER_AUTH_SECRET: "short-secret" }),
      ),
    ).toThrow("BETTER_AUTH_SECRET");

    expect(() =>
      readPrivateEnv(
        environmentWith({
          BETTER_AUTH_URL: "https://user:pass@example.com/path?query=1",
        }),
      ),
    ).toThrow("BETTER_AUTH_URL");

    expect(() =>
      readPrivateEnv(
        environmentWith({
          BETTER_AUTH_TRUSTED_ORIGINS: "https://*.example.com",
        }),
      ),
    ).toThrow("BETTER_AUTH_TRUSTED_ORIGINS");
  });

  it("does not include secret values in validation errors", () => {
    const leakedValue = "do-not-leak-this-database-password";
    let message = "";

    try {
      readPrivateEnv(
        environmentWith({
          DATABASE_URL: `mysql://owner:${leakedValue}@example.com/database`,
        }),
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain("DATABASE_URL");
    expect(message).not.toContain(leakedValue);
  });

  it("extracts the endpoint and database without credentials", () => {
    expect(neonEndpointId(VALID_ENVIRONMENT.DATABASE_URL ?? "")).toBe(
      "ep-fileflow-test",
    );
    expect(databaseName(VALID_ENVIRONMENT.DATABASE_URL ?? "")).toBe(
      "fileflow_test",
    );
  });

  it("accepts only the explicitly configured test target", () => {
    expect(() => assertTestDatabaseTarget(VALID_ENVIRONMENT)).not.toThrow();

    expect(() =>
      assertTestDatabaseTarget(
        environmentWith({ NEON_TEST_DATABASE: "production" }),
      ),
    ).toThrow("Guardrail de banco");

    expect(() =>
      assertTestDatabaseTarget(
        environmentWith({ NEON_TEST_ENDPOINT_ID: "ep-production" }),
      ),
    ).toThrow("Guardrail de banco");
  });
});
