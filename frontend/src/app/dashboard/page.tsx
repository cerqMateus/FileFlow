import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/session";

export const runtime = "nodejs";

// `/auth` pertence ao Grupo 4 e ainda não integra o catálogo gerado de rotas.
const AUTH_REDIRECT = "/auth?callbackURL=%2Fdashboard" as Route;

export default async function DashboardPage() {
  const session = await getServerSession(await headers());

  if (session === null) {
    redirect(AUTH_REDIRECT);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Sessão autenticada
        </p>
        <h1 className="text-3xl font-bold">Área protegida</h1>
        <p className="mt-4 text-slate-600">
          Sua sessão foi validada com segurança no servidor.
        </p>
      </section>
    </main>
  );
}
