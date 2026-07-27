import Link from "next/link";

import { ConverterCard, listConverters } from "@/features/conversion";

export default function HomePage() {
  const converters = listConverters();

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 py-12 text-slate-800">
      <header className="mb-12 w-full max-w-6xl px-4 text-center">
        <nav aria-label="Conta" className="mb-8 flex justify-center gap-3 sm:justify-end">
          <Link
            href="/auth"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Entrar
          </Link>
          <Link
            href="/auth?modo=cadastro"
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Criar conta
          </Link>
        </nav>
        <h1 className="mb-3 text-5xl font-bold text-indigo-600">FileFlow</h1>
        <p className="text-lg text-slate-500">
          Converta documentos com segurança e sem limites
        </p>
      </header>

      <main className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {converters.map((converter) => (
            <ConverterCard key={converter.key} converter={converter} />
          ))}
        </div>
      </main>

      <footer className="mt-16 text-sm text-slate-400">
        © 2025 FileFlow. Powered by Docker.
      </footer>
    </div>
  );
}
