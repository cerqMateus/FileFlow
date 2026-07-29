import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";

import { FileFlowLogo } from "./fileflow-logo";

describe("FileFlowLogo", () => {
  it("reserva as dimensões do lockup completo e permite um nome próprio", () => {
    render(
      <FileFlowLogo
        className="custom-logo"
        decorative={false}
        label="Identidade FileFlow"
        priority
      />,
    );

    const logo = screen.getByRole("img", { name: "Identidade FileFlow" });

    expect(logo).toHaveAttribute("src", "/brand/fileflow-logo.svg");
    expect(logo).toHaveAttribute("width", "212");
    expect(logo).toHaveAttribute("height", "40");
    expect(logo).toHaveClass("custom-logo");
  });

  it("renderiza a variante compacta como decorativa dentro do link nomeado", () => {
    render(
      <Link href="/" aria-label="FileFlow — página inicial">
        <FileFlowLogo compact />
      </Link>,
    );

    expect(
      screen.getByRole("link", { name: "FileFlow — página inicial" }),
    ).toBeInTheDocument();

    const logo = document.querySelector("img");

    expect(logo).toHaveAttribute("src", "/brand/fileflow-mark.svg");
    expect(logo).toHaveAttribute("alt", "");
    expect(logo).toHaveAttribute("aria-hidden", "true");
    expect(logo).toHaveAttribute("width", "64");
    expect(logo).toHaveAttribute("height", "40");
  });
});
