import { describe, expect, it } from "vitest";

import { resolveInternalCallbackUrl } from "./callback-url";

describe("resolveInternalCallbackUrl", () => {
  it.each([
    ["/", "/"],
    ["/?aba=sessoes", "/?aba=sessoes"],
    ["/converter/pdf/docx", "/converter/pdf/docx"],
  ])("aceita o caminho interno %s", (value, expected) => {
    expect(resolveInternalCallbackUrl(value)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    "",
    "dashboard",
    " https://evil.example",
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "/%5cevil.example",
    "/%255cevil.example",
    "/%2f%2fevil.example",
    "/%252f%252fevil.example",
    "/#fragment",
    "/\u0000",
    "/%E0%A4%A",
  ])("substitui o callback inseguro %s pelo padrão", (value) => {
    expect(resolveInternalCallbackUrl(value)).toBe("/");
  });

  it("permite definir um fallback interno conhecido", () => {
    expect(resolveInternalCallbackUrl("https://evil.example", "/")).toBe(
      "/",
    );
  });
});
