"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { convertFile } from "../api/convert-file";
import {
  clickDownloadAnchor,
  createDownloadArtifact,
  revokeDownloadUrl,
  triggerDesktopDownload,
} from "../browser/download";
import { isLegacyMobileUserAgent } from "../browser/mobile";
import type { Converter } from "../config/converters";
import type { ConversionState } from "../model/conversion-state";
import { createDownloadFilename } from "../model/download-filename";

type ConversionFormProps = Readonly<{
  converter: Converter;
}>;

export function ConversionForm({ converter }: ConversionFormProps) {
  const [state, setState] = useState<ConversionState>({ status: "idle" });
  const activeDownloadUrlRef = useRef<string | null>(null);
  const desktopCleanupTimerRef = useRef<number | null>(null);
  const mobileDownloadAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const mountedRef = useRef(false);
  const acceptedFileTypes = converter.acceptedExtensions.join(",");
  const displayedExtension = converter.acceptedExtensions[0];
  const isConverting = state.status === "converting";
  const isStatusHidden = state.status === "idle" || state.status === "selected";
  const statusColorClass =
    state.status === "success"
      ? " text-green-600"
      : state.status === "error"
        ? " text-red-600"
        : " text-slate-600";

  const clearDesktopCleanupTimer = useCallback(() => {
    if (desktopCleanupTimerRef.current !== null) {
      window.clearTimeout(desktopCleanupTimerRef.current);
      desktopCleanupTimerRef.current = null;
    }
  }, []);

  const releaseDownloadUrl = useCallback(() => {
    clearDesktopCleanupTimer();

    if (activeDownloadUrlRef.current !== null) {
      revokeDownloadUrl(activeDownloadUrlRef.current);
      activeDownloadUrlRef.current = null;
    }
  }, [clearDesktopCleanupTimer]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      releaseDownloadUrl();
    };
  }, [releaseDownloadUrl]);

  useEffect(() => {
    if (state.status !== "success" || state.downloadUrl === undefined) {
      return;
    }

    const mobileClickTimer = window.setTimeout(() => {
      const anchor = mobileDownloadAnchorRef.current;
      if (anchor !== null) {
        clickDownloadAnchor(anchor);
      }
    }, 100);

    return () => {
      window.clearTimeout(mobileClickTimer);
    };
  }, [state]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    releaseDownloadUrl();

    const file = event.currentTarget.files?.[0];
    setState(
      file === undefined ? { status: "idle" } : { status: "selected", file },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isConverting) {
      return;
    }

    const fileInput = event.currentTarget.elements.namedItem("file");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    if (file === undefined) {
      window.alert("Por favor, selecione um arquivo.");
      return;
    }

    releaseDownloadUrl();
    setState({ status: "converting", file });

    try {
      const blob = await convertFile(converter, file);
      if (!mountedRef.current) {
        return;
      }

      const filename = createDownloadFilename(
        file.name,
        converter.downloadExtension,
      );
      const artifact = createDownloadArtifact(blob, filename);
      activeDownloadUrlRef.current = artifact.url;

      if (isLegacyMobileUserAgent(window.navigator.userAgent)) {
        setState({
          status: "success",
          filename: artifact.filename,
          downloadUrl: artifact.url,
        });
        return;
      }

      triggerDesktopDownload(artifact);
      setState({ status: "success", filename: artifact.filename });
      desktopCleanupTimerRef.current = window.setTimeout(() => {
        if (activeDownloadUrlRef.current === artifact.url) {
          revokeDownloadUrl(artifact.url);
          activeDownloadUrlRef.current = null;
        }
        desktopCleanupTimerRef.current = null;
      }, 10_000);
    } catch (error: unknown) {
      if (!mountedRef.current) {
        return;
      }

      releaseDownloadUrl();
      const message =
        error instanceof Error ? error.message : "Erro na conversão.";
      setState({ status: "error", message });
    }
  }

  return (
    <div className="p-8">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
          <label
            htmlFor="conversion-file"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Selecione seu arquivo {converter.fromFormatLabel}
          </label>
          <input
            type="file"
            id="conversion-file"
            name="file"
            accept={acceptedFileTypes}
            aria-describedby="conversion-file-help conversion-status"
            className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            disabled={isConverting}
            onChange={handleFileChange}
            required
          />
          <p id="conversion-file-help" className="mt-2 text-xs text-slate-400">
            Suporta apenas arquivos {displayedExtension}
          </p>
        </div>

        <button
          type="submit"
          className={`flex w-full items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2${isConverting ? " cursor-not-allowed opacity-50" : ""}`}
          disabled={isConverting}
        >
          <svg
            aria-hidden="true"
            className={`-ml-1 mr-3 h-5 w-5 animate-spin text-white${isConverting ? "" : " hidden"}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>
            {isConverting
              ? "Processando..."
              : `Converter para ${converter.toFormatLabel}`}
          </span>
        </button>
      </form>

      <div
        id="conversion-status"
        role="status"
        aria-live="polite"
        className={`mt-4 text-center text-sm font-medium${isStatusHidden ? " hidden" : ""}${statusColorClass}`}
      >
        {state.status === "converting" &&
          "Aguarde, estamos convertendo seu arquivo..."}
        {state.status === "success" && state.downloadUrl === undefined &&
          "Sucesso! Seu download deve começar em breve."}
        {state.status === "success" && state.downloadUrl !== undefined && (
          <>
            Conversão concluída!{" "}
            <a
              ref={mobileDownloadAnchorRef}
              href={state.downloadUrl}
              download={state.filename}
              className="mt-2 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            >
              Clique aqui para baixar seu arquivo
            </a>
          </>
        )}
        {state.status === "error" && `Erro: ${state.message}`}
      </div>
    </div>
  );
}
