import { isFastApiErrorBody } from "./fastapi-error";

const DEFAULT_CONVERSION_ERROR = "Erro na conversão.";

export class ConversionError extends Error {
  override readonly name = "ConversionError";
}

function createHttpFallback(response: Response): string {
  if (response.status === 0) {
    return DEFAULT_CONVERSION_ERROR;
  }

  const statusText = response.statusText.trim();

  return statusText === ""
    ? `Erro ${response.status}.`
    : `Erro ${response.status}: ${statusText}`;
}

export async function createConversionError(
  response: Response,
): Promise<ConversionError> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return new ConversionError(createHttpFallback(response));
  }

  if (isFastApiErrorBody(body) && body.detail.trim() !== "") {
    return new ConversionError(body.detail);
  }

  return new ConversionError(createHttpFallback(response));
}
