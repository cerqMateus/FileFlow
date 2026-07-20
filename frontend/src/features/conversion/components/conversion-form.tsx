import type { Converter } from "../config/converters";

type ConversionFormProps = Readonly<{
  converter: Converter;
}>;

export function ConversionForm({ converter }: ConversionFormProps) {
  const acceptedFileTypes = converter.acceptedExtensions.join(",");
  const displayedExtension = converter.acceptedExtensions[0];

  return (
    <div className="p-8">
      <form className="space-y-6">
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
            required
          />
          <p id="conversion-file-help" className="mt-2 text-xs text-slate-400">
            Suporta apenas arquivos {displayedExtension}
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            aria-hidden="true"
            className="-ml-1 mr-3 hidden h-5 w-5 animate-spin text-white"
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
          <span>Converter para {converter.toFormatLabel}</span>
        </button>
      </form>

      <div
        id="conversion-status"
        role="status"
        aria-live="polite"
        className="mt-4 hidden text-center text-sm font-medium text-slate-600"
      />
    </div>
  );
}
