export type ConversionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "selected"; file: File }>
  | Readonly<{ status: "converting"; file: File }>
  | Readonly<{
      status: "success";
      filename: string;
      downloadUrl?: string;
    }>
  | Readonly<{ status: "error"; message: string }>;
