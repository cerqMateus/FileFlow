import { describe, expect, it } from "vitest";

import { getAuthErrorMessage, getAuthNetworkMessage } from "./error-message";

describe("mensagens seguras de autenticação", () => {
  it("traduz limite por status ou código sem expor a resposta original", () => {
    expect(getAuthErrorMessage("login", { status: 429 })).toContain(
      "Muitas tentativas",
    );
    expect(
      getAuthErrorMessage("cadastro", { code: "TOO_MANY_REQUESTS" }),
    ).toContain("Muitas tentativas");
  });

  it("usa mensagens genéricas por operação", () => {
    expect(getAuthErrorMessage("login", { code: "INTERNAL_ERROR" })).toBe(
      "E-mail ou senha inválidos.",
    );
    expect(getAuthErrorMessage("cadastro", undefined)).toContain(
      "Não foi possível criar",
    );
    expect(getAuthErrorMessage("logout", null)).toContain(
      "Não foi possível sair",
    );
  });

  it("orienta nova tentativa quando a rede falha", () => {
    expect(getAuthNetworkMessage()).toContain("Verifique sua internet");
  });
});
