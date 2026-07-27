import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/session";
import { ConverterCard, listConverters } from "@/features/conversion";

export const runtime = "nodejs";

export default async function HomePage() {
  const session = await getServerSession(await headers());

  if (session === null) {
    redirect("/auth?callbackURL=%2F");
  }

  const converters = listConverters();
  const userName = session.user.name ?? session.user.email ?? "Usuário";

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 py-12 text-slate-800">
      <header className="mb-12 w-full max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold text-indigo-600">FileFlow</h1>
            <p className="mt-3 text-lg text-slate-500">
              Converta documentos com segurança e sem limites
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            {userName}
          </div>
        </div>
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
