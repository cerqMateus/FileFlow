import Link from "next/link";

import type { Converter } from "../config/converters";
import { ConversionForm } from "./conversion-form";

type ConverterPageProps = Readonly<{
  converter: Converter;
}>;

export function ConverterPage({ converter }: ConverterPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-800">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-indigo-600"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Voltar
      </Link>

      <main className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        <div className="px-8 pb-4 pt-8 text-center">
          <div aria-hidden="true" className="mb-3 text-5xl">
            {converter.icon}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-indigo-600">
            {converter.title}
          </h1>
          <p className="text-sm text-slate-500">{converter.description}</p>
        </div>

        <ConversionForm converter={converter} />
      </main>

      <footer className="mt-8 text-sm text-slate-400">
        © 2025 FileFlow. Powered by Docker.
      </footer>
    </div>
  );
}
