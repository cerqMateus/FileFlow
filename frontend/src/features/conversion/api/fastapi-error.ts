export type FastApiErrorBody = Readonly<{
  detail: string;
}>;

export function isFastApiErrorBody(value: unknown): value is FastApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "detail" in value &&
    typeof value.detail === "string"
  );
}
