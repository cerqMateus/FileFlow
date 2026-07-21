import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  default as ConverterRoute,
  generateMetadata,
  generateStaticParams,
} from "@/app/converter/[fromFormat]/[toFormat]/page";
import { listConverters } from "@/features/conversion";

const { notFoundError } = vi.hoisted(() => ({
  notFoundError: new Error("NEXT_NOT_FOUND"),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw notFoundError;
  }),
}));

describe("converter route", () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear();
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
    "aceita a rota de $key sem acionar notFound",
    async (converter) => {
      await expect(
        ConverterRoute({
          params: Promise.resolve({
            fromFormat: converter.fromFormat,
            toFormat: converter.toFormat,
          }),
        }),
      ).resolves.toBeDefined();
      expect(notFound).not.toHaveBeenCalled();
    },
  );

  it("aciona notFound para par inválido", async () => {
    await expect(
      ConverterRoute({
        params: Promise.resolve({ fromFormat: "docx", toFormat: "svg" }),
      }),
    ).rejects.toBe(notFoundError);
    expect(notFound).toHaveBeenCalledOnce();
  });
});
