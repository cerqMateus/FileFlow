import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  default as ConverterRoute,
  generateMetadata,
  generateStaticParams,
} from "@/app/converter/[fromFormat]/[toFormat]/page";
import { listConverters } from "@/features/conversion";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  headers: vi.fn(),
  notFoundError: new Error("NEXT_NOT_FOUND"),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: mocks.getServerSession,
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw mocks.notFoundError;
  }),
  redirect: mocks.redirect,
}));

describe("converter route", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset();
    mocks.headers.mockReset();
    mocks.redirect.mockReset();
    mocks.headers.mockResolvedValue(new Headers());
    mocks.redirect.mockImplementation((location: string) => {
      throw new Error(`NEXT_REDIRECT:${location}`);
    });
  });

  it("gera somente os cinco pares suportados", () => {
    expect(generateStaticParams()).toEqual(
      listConverters().map(({ fromFormat, toFormat }) => ({
        fromFormat,
        toFormat,
      })),
    );
  });

  it.each(listConverters())(
    "gera metadados para $key",
    async (converter) => {
      await expect(
        generateMetadata({
          params: Promise.resolve({
            fromFormat: converter.fromFormat,
            toFormat: converter.toFormat,
          }),
        }),
      ).resolves.toEqual({
        title: `${converter.title} - FileFlow`,
        description: converter.description,
      });
    },
  );

  it("não gera metadados para par inválido", async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({ fromFormat: "docx", toFormat: "svg" }),
      }),
    ).resolves.toEqual({});
  });

  it.each(listConverters())(
    "aceita a rota de $key com sessão ativa",
    async (converter) => {
      mocks.getServerSession.mockResolvedValue({
        session: { id: "session-id" },
        user: {
          id: "user-id",
          name: "Pessoa Teste",
          email: "pessoa@example.test",
        },
      });

      await expect(
        ConverterRoute({
          params: Promise.resolve({
            fromFormat: converter.fromFormat,
            toFormat: converter.toFormat,
          }),
        }),
      ).resolves.toBeDefined();
      expect(notFound).not.toHaveBeenCalled();
      expect(mocks.redirect).not.toHaveBeenCalled();
    },
  );

  it("redireciona visitantes para login com callback da rota", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(
      ConverterRoute({
        params: Promise.resolve({ fromFormat: "pdf", toFormat: "docx" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/auth?callbackURL=%2Fconverter%2Fpdf%2Fdocx");
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/auth?callbackURL=%2Fconverter%2Fpdf%2Fdocx",
    );
  });

  it("aciona notFound para par inválido", async () => {
    mocks.getServerSession.mockResolvedValue({
      session: { id: "session-id" },
      user: {
        id: "user-id",
        name: "Pessoa Teste",
        email: "pessoa@example.test",
      },
    });

    await expect(
      ConverterRoute({
        params: Promise.resolve({ fromFormat: "docx", toFormat: "svg" }),
      }),
    ).rejects.toBe(mocks.notFoundError);
    expect(notFound).toHaveBeenCalledOnce();
  });
});
