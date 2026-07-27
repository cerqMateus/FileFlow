import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: mocks.getServerSession,
}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset();
    mocks.headers.mockReset();
    mocks.redirect.mockReset();
    mocks.headers.mockResolvedValue(new Headers());
    mocks.redirect.mockImplementation((location: string) => {
      throw new Error(`NEXT_REDIRECT:${location}`);
    });
  });

  it("redireciona antes de renderizar quando não existe sessão", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(DashboardPage()).rejects.toThrow(
      "NEXT_REDIRECT:/auth?callbackURL=%2Fdashboard",
    );
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/auth?callbackURL=%2Fdashboard",
    );
  });

  it("renderiza somente conteúdo mínimo após validação server-side", async () => {
    const requestHeaders = new Headers({ cookie: "session=opaque" });
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.getServerSession.mockResolvedValue({
      session: { id: "session-id" },
      user: {
        id: "user-id",
        name: "Pessoa Teste",
        email: "pessoa@example.test",
      },
    });

    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Área protegida" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sessão autenticada")).toBeInTheDocument();
    expect(screen.queryByText("pessoa@example.test")).not.toBeInTheDocument();
    expect(mocks.getServerSession).toHaveBeenCalledWith(requestHeaders);
  });
});
