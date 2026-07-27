import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthForm, type AuthMode } from "@/features/auth";
import { resolveInternalCallbackUrl } from "@/lib/auth/callback-url";
import { getServerSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Entrar ou criar conta | FileFlow",
  description: "Acesse sua conta FileFlow com segurança.",
};

type AuthPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [session, parameters] = await Promise.all([
    getServerSession(await headers()),
    searchParams,
  ]);

  if (session !== null) {
    redirect("/dashboard");
  }

  const mode: AuthMode =
    firstValue(parameters.modo) === "cadastro" ? "cadastro" : "login";
  const callbackUrl = resolveInternalCallbackUrl(
    firstValue(parameters.callbackURL),
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-800">
      <AuthForm mode={mode} callbackUrl={callbackUrl} />
    </main>
  );
}
