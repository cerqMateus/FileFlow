import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Converter } from "../config/converters";
import { listConverters } from "../config/converters";
import { ConversionForm } from "./conversion-form";

const OBJECT_URL = "blob:https://fileflow.test/resultado-controlado";

type Deferred<Value> = Readonly<{
  promise: Promise<Value>;
  resolve: (value: Value) => void;
}>;

type BrowserMocks = Readonly<{
  anchorClick: ReturnType<typeof vi.spyOn>;
  createObjectUrl: ReturnType<typeof vi.fn>;
  fetch: ReturnType<typeof vi.fn<typeof fetch>>;
  revokeObjectUrl: ReturnType<typeof vi.fn>;
}>;

function createDeferred<Value>(): Deferred<Value> {
  let resolvePromise: ((value: Value) => void) | undefined;
  const promise = new Promise<Value>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve(value) {
      if (resolvePromise === undefined) {
        throw new Error("Promise controlada não inicializada.");
      }
      resolvePromise(value);
    },
  };
}

function createBinaryResponse(): Response {
  return new Response("resultado-binário-controlado", {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
}

function installBrowserMocks(): BrowserMocks {
  const NativeUrl = globalThis.URL;
  const createObjectUrl = vi.fn(() => OBJECT_URL);
  const revokeObjectUrl = vi.fn();

  class ControlledUrl extends NativeUrl {}
  Object.defineProperties(ControlledUrl, {
    createObjectURL: { value: createObjectUrl },
    revokeObjectURL: { value: revokeObjectUrl },
  });

  vi.stubGlobal("URL", ControlledUrl);
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fileflow.test");
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);

  const anchorClick = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => undefined);

  return {
    anchorClick,
    createObjectUrl,
    fetch: fetchMock,
    revokeObjectUrl,
  };
}

function getPdfConverter(): Converter {
  const converter = listConverters().find(({ key }) => key === "pdf-to-docx");
  if (converter === undefined) {
    throw new Error("Conversor PDF para DOCX ausente.");
  }
  return converter;
}

function setupForm(converter = getPdfConverter()) {
  const user = userEvent.setup();
  const rendered = render(<ConversionForm converter={converter} />);
  const input = screen.getByLabelText(
    `Selecione seu arquivo ${converter.fromFormatLabel}`,
  );
  const button = screen.getByRole("button", {
    name: `Converter para ${converter.toFormatLabel}`,
  });

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Input de arquivo não encontrado.");
  }
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Botão de conversão não encontrado.");
  }

  const form = button.closest("form");
  if (!(form instanceof HTMLFormElement)) {
    throw new Error("Formulário de conversão não encontrado.");
  }

  return { ...rendered, button, form, input, user };
}

describe("ConversionForm", () => {
  it("mantém o arquivo selecionado no input", async () => {
    installBrowserMocks();
    const { button, input, user } = setupForm();
    const file = new File(["pdf"], "entrada.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);

    expect(input.files).toHaveLength(1);
    expect(input.files?.[0]).toBe(file);
    expect(button).toBeEnabled();
    expect(screen.getByRole("status", { hidden: true })).toHaveClass("hidden");
  });

  it("mantém a mensagem legada ao submeter sem arquivo", () => {
    installBrowserMocks();
    const alertMock = vi
      .spyOn(window, "alert")
      .mockImplementation(() => undefined);
    const { form } = setupForm();

    fireEvent.submit(form);

    expect(alertMock).toHaveBeenCalledOnce();
    expect(alertMock).toHaveBeenCalledWith("Por favor, selecione um arquivo.");
  });

  it("bloqueia reenvio enquanto a conversão está pendente e restaura o formulário", async () => {
    const mocks = installBrowserMocks();
    const response = createDeferred<Response>();
    mocks.fetch.mockReturnValue(response.promise);
    const { button, form, input, user } = setupForm();
    const file = new File(["pdf"], "entrada.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);
    fireEvent.submit(form);

    expect(mocks.fetch).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    expect(input).toBeDisabled();
    expect(button).toHaveTextContent("Processando...");
    expect(button.querySelector("svg")).not.toHaveClass("hidden");
    expect(
      screen.getByText("Aguarde, estamos convertendo seu arquivo..."),
    ).toBeVisible();

    fireEvent.submit(form);
    expect(mocks.fetch).toHaveBeenCalledOnce();

    response.resolve(createBinaryResponse());
    expect(
      await screen.findByText("Conversão concluída com sucesso!"),
    ).toBeVisible();
    expect(button).toBeEnabled();
    expect(input).toBeEnabled();
    expect(button).toHaveTextContent("Converter para Word");
    expect(button.querySelector("svg")).toHaveClass("hidden");
  });

  it("faz download uniforme com naming e revogação após sessenta segundos", async () => {
    const mocks = installBrowserMocks();
    const response = createDeferred<Response>();
    mocks.fetch.mockReturnValue(response.promise);
    const { form, input, unmount, user } = setupForm();
    const appendChild = vi.spyOn(document.body, "appendChild");
    const file = new File(["pdf"], "relatorio.final.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);
    fireEvent.submit(form);
    vi.useFakeTimers();

    await act(async () => {
      response.resolve(createBinaryResponse());
    });

    expect(
      screen.getByText("Conversão concluída com sucesso!"),
    ).toBeVisible();
    expect(mocks.createObjectUrl).toHaveBeenCalledOnce();

    const appendedAnchor = appendChild.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLAnchorElement =>
        node instanceof HTMLAnchorElement,
      );
    expect(appendedAnchor).toBeDefined();
    if (appendedAnchor === undefined) {
      throw new Error("Anchor temporário não foi criado.");
    }

    expect(appendedAnchor.href).toBe(OBJECT_URL);
    expect(appendedAnchor.download).toBe("relatorio.final_convertido.docx");
    expect(mocks.anchorClick).toHaveBeenCalledOnce();
    expect(appendedAnchor).not.toBeInTheDocument();
    expect(mocks.revokeObjectUrl).not.toHaveBeenCalled();
    expect(
      screen.getByRole("link", {
        name: "Clique aqui caso o download não tenha iniciado (relatorio.final_convertido.docx)",
      }),
    ).toHaveAttribute("href", OBJECT_URL);

    act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(mocks.revokeObjectUrl).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mocks.revokeObjectUrl).toHaveBeenCalledOnce();
    expect(mocks.revokeObjectUrl).toHaveBeenCalledWith(OBJECT_URL);

    unmount();
    expect(mocks.revokeObjectUrl).toHaveBeenCalledOnce();
  });

  it("mantém o link de fallback utilizável em qualquer dispositivo", async () => {
    const mocks = installBrowserMocks();
    const response = createDeferred<Response>();
    mocks.fetch.mockReturnValue(response.promise);
    const { form, input, unmount, user } = setupForm();
    const file = new File(["pdf"], "relatorio.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);
    fireEvent.submit(form);
    vi.useFakeTimers();

    await act(async () => {
      response.resolve(createBinaryResponse());
    });

    const link = screen.getByRole("link", {
      name: "Clique aqui caso o download não tenha iniciado (relatorio_convertido.docx)",
    });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", OBJECT_URL);
    expect(link).toHaveAttribute("download", "relatorio_convertido.docx");
    expect(screen.getByText("Conversão concluída com sucesso!")).toHaveClass(
      "text-green-600",
    );
    expect(mocks.anchorClick).toHaveBeenCalledOnce();
    expect(mocks.revokeObjectUrl).not.toHaveBeenCalled();
    expect(link).toBeInTheDocument();

    unmount();
    expect(mocks.revokeObjectUrl).toHaveBeenCalledOnce();
    expect(mocks.revokeObjectUrl).toHaveBeenCalledWith(OBJECT_URL);
  });

  it.each([
    {
      name: "detail FastAPI",
      response: () =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Extensão inválida" }), {
            status: 400,
            statusText: "Bad Request",
          }),
        ),
      message: "Erro: Extensão inválida",
    },
    {
      name: "JSON desconhecido",
      response: () =>
        Promise.resolve(
          new Response(JSON.stringify({ message: "inválido" }), {
            status: 422,
            statusText: "Unprocessable Entity",
          }),
        ),
      message: "Erro: Erro 422: Unprocessable Entity",
    },
    {
      name: "texto não JSON",
      response: () =>
        Promise.resolve(
          new Response("falha textual", {
            status: 500,
            statusText: "Internal Server Error",
          }),
        ),
      message: "Erro: Erro 500: Internal Server Error",
    },
    {
      name: "body vazio",
      response: () => Promise.resolve(new Response(null, { status: 503 })),
      message: "Erro: Erro 503.",
    },
    {
      name: "rejeição de rede",
      response: () => Promise.reject(new Error("Falha de rede")),
      message: "Erro: Falha de rede",
    },
  ])("restaura o formulário após $name", async ({ response, message }) => {
      const mocks = installBrowserMocks();
      mocks.fetch.mockImplementation(response);
      const { button, form, input, user } = setupForm();
      const appendChild = vi.spyOn(document.body, "appendChild");
    const file = new File(["pdf"], "entrada.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);
    fireEvent.submit(form);

    const status = await screen.findByText(message);
    expect(status).toBeVisible();
    expect(screen.getByRole("status")).toHaveClass("text-red-600");
    expect(button).toBeEnabled();
    expect(input).toBeEnabled();
    expect(button).toHaveTextContent("Converter para Word");
    expect(button.querySelector("svg")).toHaveClass("hidden");
    expect(mocks.createObjectUrl).not.toHaveBeenCalled();
    expect(mocks.anchorClick).not.toHaveBeenCalled();
    expect(appendChild).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mocks.fetch).toHaveBeenCalledOnce();
    });
  });
});
