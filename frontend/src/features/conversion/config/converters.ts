type ConverterDefinition = Readonly<{
  key: `${string}-to-${string}`;
  fromFormat: string;
  fromFormatLabel: string;
  toFormat: string;
  toFormatLabel: string;
  title: string;
  description: string;
  homeDescription?: string;
  icon: string;
  route: `/converter/${string}/${string}`;
  endpoint: `/convert/${string}`;
  acceptedExtensions: readonly `.${string}`[];
  downloadExtension: `.${string}`;
}>;

function defineConverter<const Definition extends ConverterDefinition>(
  definition: Definition,
): Readonly<Definition> {
  Object.freeze(definition.acceptedExtensions);
  return Object.freeze(definition);
}

const converterCatalog = Object.freeze([
  defineConverter({
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
  }),
  defineConverter({
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
  }),
  defineConverter({
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
  }),
  defineConverter({
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
  }),
  defineConverter({
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
  }),
]);

export type Converter = (typeof converterCatalog)[number];
export type ConverterKey = Converter["key"];
export type SourceFormat = Converter["fromFormat"];
export type DestinationFormat = Converter["toFormat"];
export type ConverterEndpoint = Converter["endpoint"];
export type ConverterRoute = Converter["route"];
export type DownloadExtension = Converter["downloadExtension"];

type AcceptedExtensionOf<Entry extends Converter> =
  Entry extends Converter ? Entry["acceptedExtensions"][number] : never;

type SupportedPairOf<Entry extends Converter> = Entry extends Converter
  ? readonly [Entry["fromFormat"], Entry["toFormat"]]
  : never;

export type AcceptedExtension = AcceptedExtensionOf<Converter>;
export type SupportedPair = SupportedPairOf<Converter>;

export function listConverters(): readonly Converter[] {
  return converterCatalog;
}

export function resolveConverter(
  fromFormat: string,
  toFormat: string,
): Converter | undefined {
  return converterCatalog.find(
    (converter) =>
      converter.fromFormat === fromFormat && converter.toFormat === toFormat,
  );
}

export function getHomeDescription(converter: Converter): string {
  return "homeDescription" in converter
    ? converter.homeDescription
    : converter.description;
}
