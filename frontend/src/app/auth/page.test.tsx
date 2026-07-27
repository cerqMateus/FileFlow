import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/features/auth", () => ({
  AuthForm: ({ mode, callbackUrl }: { mode: string; callbackUrl: string }) => (
    <div data-testid="auth-form" data-mode={mode} data-callback={callbackUrl} />
  ),
}));
vi.mock("@/lib/auth/session", () => ({
  getServerSession: mocks.getServerSession,
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import AuthPage from "./page";

describe("AuthPage", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset();
    mocks.headers.mockReset();
    mocks.redirect.mockReset();
    mocks.headers.mockResolvedValue(new Headers());
    mocks.getServerSession.mockResolvedValue(null);
    mocks.redirect.mockImplementation((location: string) => {
      throw new Error(`NEXT_REDIRECT:${location}`);
    });
  });

  it("usa login e dashboard como padrões", async () => {
    render(await AuthPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByTestId("auth-form")).toHaveAttribute("data-mode", "login");
    expect(screen.getByTestId("auth-form")).toHaveAttribute(
      "data-callback",
      "/dashboard",
    );
  });

  it("aceita somente o modo de cadastro explícito e callback interno", async () => {
    render(
      await AuthPage({
        searchParams: Promise.resolve({
          modo: "cadastro",
          callbackURL: "/converter/pdf/docx?origem=auth",
        }),
      }),
    );

    expect(screen.getByTestId("auth-form")).toHaveAttribute(
      "data-mode",
      "cadastro",
    );
    expect(screen.getByTestId("auth-form")).toHaveAttribute(
      "data-callback",
      "/converter/pdf/docx?origem=auth",
    );
  });

  it("rebaixa modo desconhecido e callback externo para os padrões", async () => {
    render(
      await AuthPage({
        searchParams: Promise.resolve({
          modo: ["outro", "cadastro"],
          callbackURL: "https://evil.example/roubo",
        }),
      }),
    );

    expect(screen.getByTestId("auth-form")).toHaveAttribute("data-mode", "login");
    expect(screen.getByTestId("auth-form")).toHaveAttribute(
      "data-callback",
      "/dashboard",
    );
  });

  it("redireciona sessão existente antes de mostrar formulários", async () => {
    mocks.getServerSession.mockResolvedValue({
      session: { id: "session-id" },
      user: { id: "user-id", email: "pessoa@example.test", name: "Pessoa" },
    });

    await expect(
      AuthPage({ searchParams: Promise.resolve({ modo: "cadastro" }) }),
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
