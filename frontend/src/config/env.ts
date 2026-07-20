export type PublicEnv = Readonly<{
  apiBaseUrl: string;
}>;

const INVALID_API_BASE_URL =
  "NEXT_PUBLIC_API_BASE_URL deve ser uma URL HTTP(S) absoluta, uma base relativa iniciada por / ou vazia para same-origin.";

function removeTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function normalizeApiBaseUrl(value: string | undefined): string {
  if (value === undefined) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL não foi definida.");
  }

  const normalizedValue = value.trim();

  if (normalizedValue === "" || normalizedValue === "/") {
    return "";
  }

  if (normalizedValue.startsWith("/")) {
    if (normalizedValue.startsWith("//")) {
      throw new Error(INVALID_API_BASE_URL);
    }

    const relativeUrl = new URL(normalizedValue, "https://fileflow.local");
    if (relativeUrl.search !== "" || relativeUrl.hash !== "") {
      throw new Error(INVALID_API_BASE_URL);
    }

    return removeTrailingSlashes(relativeUrl.pathname);
  }

  let absoluteUrl: URL;
  try {
    absoluteUrl = new URL(normalizedValue);
  } catch {
    throw new Error(INVALID_API_BASE_URL);
  }

  if (
    (absoluteUrl.protocol !== "http:" && absoluteUrl.protocol !== "https:") ||
    absoluteUrl.username !== "" ||
    absoluteUrl.password !== "" ||
    absoluteUrl.search !== "" ||
    absoluteUrl.hash !== ""
  ) {
    throw new Error(INVALID_API_BASE_URL);
  }

  const pathname =
    absoluteUrl.pathname === "/"
      ? ""
      : removeTrailingSlashes(absoluteUrl.pathname);
  return `${absoluteUrl.origin}${pathname}`;
}

export function readPublicEnv(): PublicEnv {
  return Object.freeze({
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.NEXT_PUBLIC_API_BASE_URL,
    ),
  });
}
