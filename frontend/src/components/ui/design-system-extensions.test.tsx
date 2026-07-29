import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";
import { Button } from "./button";

describe("extensões do design system", () => {
  it("mantém o botão principal com alvo de 44 px e foco visível", () => {
    render(<Button>Converter arquivo</Button>);

    expect(
      screen.getByRole("button", { name: "Converter arquivo" }),
    ).toHaveClass("h-11", "focus-visible:ring-3", "focus-visible:ring-ring/50");
  });

  it("expõe badges neutro, de marca e de sucesso com tokens semânticos", () => {
    render(
      <>
        <Badge>Documento</Badge>
        <Badge variant="brand">PDF</Badge>
        <Badge variant="success">Concluído</Badge>
      </>,
    );

    expect(screen.getByText("Documento")).toHaveClass("bg-muted");
    expect(screen.getByText("PDF")).toHaveClass("bg-brand-blue/10");
    expect(screen.getByText("Concluído")).toHaveClass("bg-success/10");
  });
});
