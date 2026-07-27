import { render, screen, within } from "@testing-library/react";
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

import HomePage from "@/app/page";
import { getHomeDescription, listConverters } from "@/features/conversion";

describe("HomePage", () => {
  beforeEach(() => {
    mocks.getServerSession.mockReset();
    mocks.headers.mockReset();
    mocks.redirect.mockReset();
    mocks.headers.mockResolvedValue(new Headers());
    mocks.redirect.mockImplementation((location: string) => {
      throw new Error(`NEXT_REDIRECT:${location}`);
    });
  });

  it("redireciona visitantes para login", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT:/auth?callbackURL=%2F");
    expect(mocks.redirect).toHaveBeenCalledWith("/auth?callbackURL=%2F");
  });

  it("renderiza os conversores e o nome do usuário autenticado", async () => {
    mocks.getServerSession.mockResolvedValue({
      session: { id: "session-id" },
      user: {
        id: "user-id",
        name: "Pessoa Teste",
        email: "pessoa@example.test",
      },
    });

    render(await HomePage());

    expect(
      screen.getByRole("heading", { level: 1, name: "FileFlow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Converta documentos com segurança e sem limites"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pessoa Teste")).toBeInTheDocument();
    expect(
      screen.getByText("© 2025 FileFlow. Powered by Docker."),
    ).toBeInTheDocument();

    for (const converter of listConverters()) {
      const link = screen.getByRole("link", {
        name: new RegExp(converter.title, "i"),
      });

      expect(link).toHaveAttribute("href", converter.route);
      expect(
        within(link).getByRole("heading", {
          level: 2,
          name: converter.title,
        }),
      ).toBeInTheDocument();
      expect(within(link).getByText(converter.icon)).toBeInTheDocument();
      expect(
        within(link).getByText(getHomeDescription(converter)),
      ).toBeInTheDocument();
    }

    const converterLinks = listConverters().map((converter) =>
      screen.getByRole("link", { name: new RegExp(converter.title, "i") }),
    );
    expect(converterLinks).toHaveLength(5);
  });
});
