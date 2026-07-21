import { readPublicEnv } from "@/config/env";

import type { Converter } from "../config/converters";
import { createConversionError } from "./conversion-error";

export async function convertFile(
  converter: Converter,
  file: File,
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const { apiBaseUrl } = readPublicEnv();
  const response = await fetch(`${apiBaseUrl}${converter.endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await createConversionError(response);
  }

  return response.blob();
}
