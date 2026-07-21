import type { DownloadExtension } from "../config/converters";

export function createDownloadFilename(
  originalFilename: string,
  downloadExtension: DownloadExtension,
): string {
  const extensionSeparator = originalFilename.lastIndexOf(".");
  const basename =
    extensionSeparator === -1
      ? originalFilename
      : originalFilename.slice(0, extensionSeparator);

  return `${basename}_convertido${downloadExtension}`;
}
