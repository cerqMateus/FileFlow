export type ConversionCase = Readonly<{
  key: string;
  title: string;
  route: `/converter/${string}/${string}`;
  endpoint: `/convert/${string}`;
  inputName: string;
  inputMime: string;
  outputMime: string;
  expectedDownloadName: string;
}>;

export const conversionCases = [
  {
    key: "pdf-to-docx",
    title: "PDF para Word",
    route: "/converter/pdf/docx",
    endpoint: "/convert/pdf-to-docx",
    inputName: "sample.pdf",
    inputMime: "application/pdf",
    outputMime:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    expectedDownloadName: "sample_convertido.docx",
  },
  {
    key: "docx-to-pdf",
    title: "Word para PDF",
    route: "/converter/docx/pdf",
    endpoint: "/convert/docx-to-pdf",
    inputName: "sample.docx",
    inputMime:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    outputMime: "application/pdf",
    expectedDownloadName: "sample_convertido.pdf",
  },
  {
    key: "pdf-to-svg",
    title: "PDF para SVG",
    route: "/converter/pdf/svg",
    endpoint: "/convert/pdf-to-svg",
    inputName: "sample.pdf",
    inputMime: "application/pdf",
    outputMime: "image/svg+xml",
    expectedDownloadName: "sample_convertido.svg",
  },
  {
    key: "jpg-to-png",
    title: "JPG para PNG",
    route: "/converter/jpg/png",
    endpoint: "/convert/jpg-to-png",
    inputName: "sample.jpeg",
    inputMime: "image/jpeg",
    outputMime: "image/png",
    expectedDownloadName: "sample_convertido.png",
  },
  {
    key: "png-to-jpg",
    title: "PNG para JPG",
    route: "/converter/png/jpg",
    endpoint: "/convert/png-to-jpg",
    inputName: "sample.png",
    inputMime: "image/png",
    outputMime: "image/jpeg",
    expectedDownloadName: "sample_convertido.jpg",
  },
] as const satisfies readonly ConversionCase[];
