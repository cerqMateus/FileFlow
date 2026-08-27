export type DownloadArtifact = Readonly<{
  filename: string;
  url: string;
}>;

export function createDownloadArtifact(
  blob: Blob,
  filename: string,
): DownloadArtifact {
  return {
    filename,
    url: window.URL.createObjectURL(blob),
  };
}

export function triggerDownload(artifact: DownloadArtifact): void {
  const anchor = document.createElement("a");
  anchor.href = artifact.url;
  anchor.download = artifact.filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
  }
}

export function revokeDownloadUrl(url: string): void {
  window.URL.revokeObjectURL(url);
}
