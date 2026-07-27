import { describe, expect, it } from "vitest";

import { configurePrimaryAuthTestEnvironment } from "./primary-auth-environment";

const DATABASE_URL =
  "postgresql://owner:secret@ep-primary-pooler.sa-east-1.aws.neon.tech/fileflow?sslmode=require";

describe("configurePrimaryAuthTestEnvironment", () => {
  it("exige autorização explícita", () => {
    expect(() =>
      configurePrimaryAuthTestEnvironment("http://127.0.0.1:3100", {
        DATABASE_URL,
      }),
    ).toThrow("ALLOW_PRIMARY_AUTH_TESTS=true");
  });

  it("aceita CONNECTION_STRING pooled e configura valores exclusivos de teste", () => {
    const environment = {
      ALLOW_PRIMARY_AUTH_TESTS: "true",
      CONNECTION_STRING: DATABASE_URL,
    };

    const configured = configurePrimaryAuthTestEnvironment(
      "http://127.0.0.1:3100",
      environment,
    );

    expect(configured.DATABASE_URL).toBe(DATABASE_URL);
    expect(configured.BETTER_AUTH_URL).toBe("http://127.0.0.1:3100");
    expect(environment).toMatchObject(configured);
  });

  it("rejeita conexão direta, fora do Neon ou sem SSL obrigatório", () => {
    const invalidUrls = [
      DATABASE_URL.replace("-pooler", ""),
      DATABASE_URL.replace(".aws.neon.tech", ".example.com"),
      DATABASE_URL.replace("sslmode=require", "sslmode=disable"),
    ];

    for (const databaseUrl of invalidUrls) {
      expect(() =>
        configurePrimaryAuthTestEnvironment("https://auth.invalid", {
          ALLOW_PRIMARY_AUTH_TESTS: "true",
          DATABASE_URL: databaseUrl,
        }),
      ).toThrow("conexão pooled do Neon");
    }
  });

  it("rejeita origem não canônica", () => {
    expect(() =>
      configurePrimaryAuthTestEnvironment("https://auth.invalid/path", {
        ALLOW_PRIMARY_AUTH_TESTS: "true",
        DATABASE_URL,
      }),
    ).toThrow("origem do teste");
  });
});
