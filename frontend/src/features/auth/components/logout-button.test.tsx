import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));
vi.mock("@/lib/auth/client", () => ({
  authClient: { signOut: mocks.signOut },
}));

import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  beforeEach(() => {
    mocks.refresh.mockReset();
    mocks.replace.mockReset();
    mocks.signOut.mockReset();
  });

  it("bloqueia cliques repetidos e redireciona depois de sair", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mocks.signOut.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<LogoutButton />);
    const button = screen.getByRole("button", { name: "Sair" });

    fireEvent.click(button);
    fireEvent.click(button);
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Saindo..." })).toBeDisabled();

    resolveRequest?.({ data: null, error: null });
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth"));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("considera sessão já ausente como logout concluído", async () => {
    mocks.signOut.mockResolvedValue({
      data: null,
      error: { status: 401 },
    });
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(mocks.replace).toHaveBeenCalledWith("/auth");
  });

  it("mantém a pessoa na página e permite tentar novamente após erro", async () => {
    mocks.signOut
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: null, error: null });
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Sair" }));
    expect(await screen.findByText(/Verifique sua internet/)).toBeVisible();
    expect(mocks.replace).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/auth"));
  });

  it("traduz erro de limite sem exibir detalhes crus", async () => {
    mocks.signOut.mockResolvedValue({
      data: null,
      error: { status: 429, message: "raw details" },
    });
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(await screen.findByText(/Muitas tentativas/)).toBeVisible();
    expect(screen.queryByText("raw details")).not.toBeInTheDocument();
  });
});
