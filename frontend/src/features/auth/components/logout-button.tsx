"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";

import { getAuthErrorMessage, getAuthNetworkMessage } from "../model/error-message";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error !== null && result.error.status !== 401) {
        setError(getAuthErrorMessage("logout", result.error));
        return;
      }

      router.replace("/auth");
      router.refresh();
    } catch {
      setError(getAuthNetworkMessage());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSubmitting}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saindo..." : "Sair"}
      </button>
      <p
        role="alert"
        aria-live="assertive"
        className={error === "" ? "sr-only" : "mt-3 text-sm font-medium text-red-700"}
      >
        {error}
      </p>
    </div>
  );
}
