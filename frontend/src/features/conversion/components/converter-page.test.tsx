import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { listConverters } from "../config/converters";
import { ConverterPage } from "./converter-page";

describe("ConverterPage", () => {
  it.each(listConverters())(
    "renderiza a apresentação de $key",
    (converter) => {
      render(<ConverterPage converter={converter} />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: converter.title,
        }),
      ).toBeInTheDocument();
      expect(screen.getByText(converter.description)).toBeInTheDocument();
      expect(screen.getByText(converter.icon)).toBeInTheDocument();
      expect(
        screen.getByLabelText(
          `Selecione seu arquivo ${converter.fromFormatLabel}`,
        ),
      ).toHaveAttribute("accept", converter.acceptedExtensions.join(","));
      expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
        "href",
        "/",
      );
      expect(
        screen.getByText("© 2025 FileFlow. Powered by Docker."),
      ).toBeInTheDocument();
    },
  );
});
