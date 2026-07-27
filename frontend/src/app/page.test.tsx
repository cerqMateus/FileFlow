import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { getHomeDescription, listConverters } from "@/features/conversion";

describe("HomePage", () => {
  it("renderiza o conteúdo estrutural do baseline", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "FileFlow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Converta documentos com segurança e sem limites"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("© 2025 FileFlow. Powered by Docker."),
    ).toBeInTheDocument();
  });

  it("renderiza exatamente os cinco cards com links acessíveis", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/auth",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/auth?modo=cadastro",
    );

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
