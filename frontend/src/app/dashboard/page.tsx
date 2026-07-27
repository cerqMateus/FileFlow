import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth";
import { getServerSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getServerSession(await headers());

  if (session === null) {
    redirect("/auth?callbackURL=%2Fdashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Sessão autenticada
        </p>
        <h1 className="text-3xl font-bold">Área protegida</h1>
        <p className="mt-4 text-slate-600">Sua sessão foi validada com segurança no servidor.</p>
        <dl className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-500">Nome</dt>
            <dd className="mt-1 break-words font-medium text-slate-900">
              {session.user.name}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">E-mail</dt>
            <dd className="mt-1 break-words font-medium text-slate-900">
              {session.user.email}
            </dd>
          </div>
        </dl>
        <LogoutButton />
      </section>
    </main>
  );
}
