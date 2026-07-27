import { describe, expect, it } from "vitest";

import { validateAuthFields } from "./validation";

const VALID_FIELDS = {
  name: "Pessoa Teste",
  email: "pessoa@example.test",
  password: "senha-segura",
  passwordConfirmation: "senha-segura",
};

describe("validateAuthFields", () => {
  it("aceita cadastro válido com nome e e-mail que serão normalizados", () => {
    expect(
      validateAuthFields("cadastro", {
        ...VALID_FIELDS,
        name: "  Pessoa Teste  ",
        email: "  pessoa@example.test  ",
      }),
    ).toEqual({});
  });

  it("valida todos os campos do cadastro", () => {
    expect(
      validateAuthFields("cadastro", {
        name: "x",
        email: "email-invalido",
        password: "curta",
        passwordConfirmation: "diferente",
      }),
    ).toEqual({
      name: "Informe um nome entre 2 e 100 caracteres.",
      email: "Informe um e-mail válido.",
      password: "A senha deve ter entre 8 e 128 caracteres.",
      passwordConfirmation: "As senhas não coincidem.",
    });
  });

  it("ignora nome e confirmação no login", () => {
    expect(
      validateAuthFields("login", {
        ...VALID_FIELDS,
        name: "",
        passwordConfirmation: "",
      }),
    ).toEqual({});
  });

  it("recusa valores acima dos limites", () => {
    expect(
      validateAuthFields("cadastro", {
        ...VALID_FIELDS,
        name: "n".repeat(101),
        password: "s".repeat(129),
        passwordConfirmation: "s".repeat(129),
      }),
    ).toMatchObject({
      name: expect.any(String),
      password: expect.any(String),
    });
  });
});
