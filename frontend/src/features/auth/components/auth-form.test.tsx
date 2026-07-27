import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: { email: mocks.signInEmail },
    signUp: { email: mocks.signUpEmail },
  },
}));

import { AuthForm } from "./auth-form";

async function fillLogin() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("E-mail"), "pessoa@example.test");
  await user.type(screen.getByLabelText("Senha"), "senha-segura");
  return user;
}

async function fillSignUp() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nome"), "  Pessoa Teste  ");
  await user.type(screen.getByLabelText("E-mail"), "pessoa@example.test");
  await user.type(screen.getByLabelText("Senha"), "senha-segura");
  await user.type(screen.getByLabelText("Confirmar senha"), "senha-segura");
  return user;
}

describe("AuthForm", () => {
  beforeEach(() => {
    mocks.refresh.mockReset();
    mocks.replace.mockReset();
    mocks.signInEmail.mockReset();
    mocks.signUpEmail.mockReset();
  });

  it("mostra os campos e metadados acessíveis de cadastro", () => {
    render(<AuthForm mode="cadastro" callbackUrl="/dashboard" />);

    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeVisible();
    expect(screen.getByLabelText("Nome")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/auth?callbackURL=%2Fdashboard",
    );
  });

  it("anuncia a validação e não consulta a API com dados inválidos", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="cadastro" callbackUrl="/dashboard" />);

    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Revise os campos");
    expect(screen.getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("A senha deve ter entre 8 e 128 caracteres."),
    ).toBeVisible();
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it("cadastra com valores normalizados sem enviar a confirmação", async () => {
    mocks.signUpEmail.mockResolvedValue({ data: { user: {} }, error: null });
    render(<AuthForm mode="cadastro" callbackUrl="/converter/pdf/docx" />);
    const user = await fillSignUp();

    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    await waitFor(() => {
      expect(mocks.signUpEmail).toHaveBeenCalledWith({
        name: "Pessoa Teste",
        email: "pessoa@example.test",
        password: "senha-segura",
      });
    });
    expect(mocks.replace).toHaveBeenCalledWith("/converter/pdf/docx");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("preserva nome e e-mail, limpa senhas e traduz limite de cadastro", async () => {
    mocks.signUpEmail.mockResolvedValue({
      data: null,
      error: { status: 429, message: "raw server details" },
    });
    render(<AuthForm mode="cadastro" callbackUrl="/dashboard" />);
    const user = await fillSignUp();

    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(await screen.findByText(/Muitas tentativas/)).toBeVisible();
    expect(screen.queryByText("raw server details")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("  Pessoa Teste  ");
    expect(screen.getByLabelText("E-mail")).toHaveValue("pessoa@example.test");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
    expect(screen.getByLabelText("Confirmar senha")).toHaveValue("");
  });

  it("faz login, bloqueia reenvio e segue o callback após sucesso", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mocks.signInEmail.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<AuthForm mode="login" callbackUrl="/dashboard?origem=auth" />);
    const user = await fillLogin();
    const button = screen.getByRole("button", { name: "Entrar" });

    fireEvent.submit(button.closest("form")!);
    expect(await screen.findByRole("button", { name: "Aguarde..." })).toBeDisabled();
    fireEvent.submit(button.closest("form")!);
    expect(mocks.signInEmail).toHaveBeenCalledOnce();

    resolveRequest?.({ data: { user: {} }, error: null });
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard?origem=auth"));
    expect(mocks.signInEmail).toHaveBeenCalledWith({
      email: "pessoa@example.test",
      password: "senha-segura",
    });
    void user;
  });

  it("mostra erro genérico de login, preserva e-mail e limpa senha", async () => {
    mocks.signInEmail.mockResolvedValue({
      data: null,
      error: { status: 401, message: "user does not exist" },
    });
    render(<AuthForm mode="login" callbackUrl="/dashboard" />);
    const user = await fillLogin();

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail ou senha inválidos.")).toBeVisible();
    expect(screen.queryByText("user does not exist")).not.toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("pessoa@example.test");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });

  it("permite tentar novamente após falha de rede", async () => {
    mocks.signInEmail
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { user: {} }, error: null });
    render(<AuthForm mode="login" callbackUrl="/dashboard" />);
    const user = await fillLogin();

    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText(/Verifique sua internet/)).toBeVisible();

    await user.type(screen.getByLabelText("Senha"), "senha-segura");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(mocks.signInEmail).toHaveBeenCalledTimes(2));
  });
});
