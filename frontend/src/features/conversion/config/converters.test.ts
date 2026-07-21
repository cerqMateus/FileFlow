import { describe, expect, it } from "vitest";

import {
  getHomeDescription,
  listConverters,
  resolveConverter,
} from "./converters";

const expectedConverters = [
  {
    key: "pdf-to-docx",
    fromFormat: "pdf",
    fromFormatLabel: "PDF",
    toFormat: "docx",
    toFormatLabel: "Word",
    title: "PDF para Word",
    description: "Converta arquivos PDF em documentos Word editáveis",
    icon: "📄",
    route: "/converter/pdf/docx",
    endpoint: "/convert/pdf-to-docx",
    acceptedExtensions: [".pdf"],
    downloadExtension: ".docx",
  },
  {
    key: "docx-to-pdf",
    fromFormat: "docx",
    fromFormatLabel: "Word",
    toFormat: "pdf",
    toFormatLabel: "PDF",
    title: "Word para PDF",
    description: "Converta documentos Word em arquivos PDF universais",
    icon: "📝",
    route: "/converter/docx/pdf",
    endpoint: "/convert/docx-to-pdf",
    acceptedExtensions: [".docx"],
    downloadExtension: ".pdf",
  },
  {
    key: "pdf-to-svg",
    fromFormat: "pdf",
    fromFormatLabel: "PDF",
    toFormat: "svg",
    toFormatLabel: "SVG",
    title: "PDF para SVG",
    description: "Converta arquivos PDF em imagens vetoriais SVG",
    icon: "🎨",
    route: "/converter/pdf/svg",
    endpoint: "/convert/pdf-to-svg",
    acceptedExtensions: [".pdf"],
    downloadExtension: ".svg",
  },
  {
    key: "jpg-to-png",
    fromFormat: "jpg",
    fromFormatLabel: "JPG",
    toFormat: "png",
    toFormatLabel: "PNG",
    title: "JPG para PNG",
    description: "Converta imagens JPG em formato PNG com transparência",
    homeDescription: "Converta imagens JPG em formato PNG",
    icon: "🖼️",
    route: "/converter/jpg/png",
    endpoint: "/convert/jpg-to-png",
    acceptedExtensions: [".jpg", ".jpeg"],
    downloadExtension: ".png",
  },
  {
    key: "png-to-jpg",
    fromFormat: "png",
    fromFormatLabel: "PNG",
    toFormat: "jpg",
    toFormatLabel: "JPG",
    title: "PNG para JPG",
    description: "Converta imagens PNG em formato JPG comprimido",
    icon: "🖼️",
    route: "/converter/png/jpg",
    endpoint: "/convert/png-to-jpg",
    acceptedExtensions: [".png"],
    downloadExtension: ".jpg",
  },
] as const;

describe("converter catalog", () => {
  it("preserva exatamente os cinco conversores do baseline", () => {
    expect(listConverters()).toEqual(expectedConverters);
    expect(listConverters()).toHaveLength(5);
  });

  it("não contém chaves duplicadas", () => {
    const keys = listConverters().map(({ key }) => key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("preserva a descrição compacta da home somente quando configurada", () => {
    expect(listConverters().map(getHomeDescription)).toEqual([
      "Converta arquivos PDF em documentos Word editáveis",
      "Converta documentos Word em arquivos PDF universais",
      "Converta arquivos PDF em imagens vetoriais SVG",
      "Converta imagens JPG em formato PNG",
      "Converta imagens PNG em formato JPG comprimido",
    ]);
  });
});

describe("resolveConverter", () => {
  it.each(expectedConverters)(
    "resolve o par $fromFormat → $toFormat",
    ({ fromFormat, toFormat, key }) => {
      expect(resolveConverter(fromFormat, toFormat)?.key).toBe(key);
    },
  );

  it.each([
    ["txt", "pdf"],
    ["pdf", "txt"],
    ["docx", "svg"],
    ["", ""],
    ["PDF", "docx"],
    ["pdf", "DOCX"],
  ])("rejeita o par não suportado %s → %s", (fromFormat, toFormat) => {
    expect(resolveConverter(fromFormat, toFormat)).toBeUndefined();
  });
});
