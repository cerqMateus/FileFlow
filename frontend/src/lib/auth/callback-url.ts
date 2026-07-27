const DEFAULT_CALLBACK_URL = "/dashboard";
const INTERNAL_ORIGIN = "https://fileflow.internal";
const UNSAFE_CHARACTER = /[\\\u0000-\u001f\u007f]/u;

function decodeRepeatedly(value: string): string | null {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        return decoded;
      }
      decoded = next;
    } catch {
      return null;
    }
  }

  return decoded;
}

export function resolveInternalCallbackUrl(
  value: string | null | undefined,
  fallback = DEFAULT_CALLBACK_URL,
): string {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value !== value.trim() ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    UNSAFE_CHARACTER.test(value)
  ) {
    return fallback;
  }

  const decoded = decodeRepeatedly(value);
  if (
    decoded === null ||
    decoded.startsWith("//") ||
    UNSAFE_CHARACTER.test(decoded)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, INTERNAL_ORIGIN);
    if (
      parsed.origin !== INTERNAL_ORIGIN ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      parsed.hash !== ""
    ) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}
