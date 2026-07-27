"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { authClient } from "@/lib/auth/client";

import { getAuthErrorMessage, getAuthNetworkMessage } from "../model/error-message";
import {
  type AuthField,
  type AuthFieldErrors,
  type AuthFields,
  type AuthMode,
  validateAuthFields,
} from "../model/validation";

type AuthFormProps = Readonly<{
  mode: AuthMode;
  callbackUrl: string;
}>;

const INITIAL_FIELDS: AuthFields = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

function fieldErrorId(field: AuthField): string {
  return `${field}-error`;
}

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const router = useRouter();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [fields, setFields] = useState<AuthFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState(0);
  const isSignUp = mode === "cadastro";

  useEffect(() => {
    if (announcement > 0) {
      summaryRef.current?.focus();
    }
  }, [announcement]);

  function updateField(field: AuthField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (current[field] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setGeneralError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateAuthFields(mode, fields);
    setErrors(nextErrors);
    setGeneralError("");
    if (Object.keys(nextErrors).length > 0) {
      setAnnouncement((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const email = fields.email.trim();
      const result = isSignUp
        ? await authClient.signUp.email({
            email,
            name: fields.name.trim(),
            password: fields.password,
          })
        : await authClient.signIn.email({
            email,
            password: fields.password,
          });

      if (result.error !== null) {
        setGeneralError(getAuthErrorMessage(mode, result.error));
        setAnnouncement((current) => current + 1);
        setFields((current) => ({
          ...current,
          password: "",
          passwordConfirmation: "",
        }));
        return;
      }

      router.replace(callbackUrl as Route);
      router.refresh();
    } catch {
      setGeneralError(getAuthNetworkMessage());
      setAnnouncement((current) => current + 1);
      setFields((current) => ({
        ...current,
        password: "",
        passwordConfirmation: "",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  const alternateHref = (
    isSignUp
      ? `/auth?callbackURL=${encodeURIComponent(callbackUrl)}`
      : `/auth?modo=cadastro&callbackURL=${encodeURIComponent(callbackUrl)}`
  ) as Route;

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
          FileFlow
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {isSignUp ? "Criar conta" : "Entrar"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isSignUp
            ? "Crie sua conta para acessar os conversores."
            : "Use seus dados para acessar sua conta."}
        </p>
      </div>

      <div
        ref={summaryRef}
        role="alert"
        aria-live="assertive"
        tabIndex={-1}
        className={
          generalError !== "" || Object.keys(errors).length > 0
            ? "mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 outline-none focus:ring-2 focus:ring-red-500"
            : "sr-only"
        }
      >
        {generalError || "Revise os campos destacados antes de continuar."}
      </div>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {isSignUp ? (
          <AuthInput
            autoComplete="name"
            disabled={isSubmitting}
            error={errors.name}
            label="Nome"
            name="name"
            onChange={(value) => updateField("name", value)}
            type="text"
            value={fields.name}
          />
        ) : null}

        <AuthInput
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email}
          label="E-mail"
          name="email"
          onChange={(value) => updateField("email", value)}
          type="email"
          value={fields.email}
        />

        <AuthInput
          autoComplete={isSignUp ? "new-password" : "current-password"}
          disabled={isSubmitting}
          error={errors.password}
          label="Senha"
          name="password"
          onChange={(value) => updateField("password", value)}
          type="password"
          value={fields.password}
        />

        {isSignUp ? (
          <AuthInput
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.passwordConfirmation}
            label="Confirmar senha"
            name="passwordConfirmation"
            onChange={(value) => updateField("passwordConfirmation", value)}
            type="password"
            value={fields.passwordConfirmation}
          />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Aguarde..."
            : isSignUp
              ? "Criar minha conta"
              : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link
          href={alternateHref}
          className="font-semibold text-indigo-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          {isSignUp ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </section>
  );
}

type AuthInputProps = Readonly<{
  autoComplete: string;
  disabled: boolean;
  error: string | undefined;
  label: string;
  name: AuthField;
  onChange: (value: string) => void;
  type: "email" | "password" | "text";
  value: string;
}>;

function AuthInput({
  autoComplete,
  disabled,
  error,
  label,
  name,
  onChange,
  type,
  value,
}: AuthInputProps) {
  const errorId = fieldErrorId(name);

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={error === undefined ? undefined : errorId}
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100 aria-invalid:border-red-600 aria-invalid:ring-red-100"
      />
      {error === undefined ? null : (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
