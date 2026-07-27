import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

import { getServerSession } from "./session";

describe("getServerSession", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
  });

  it("encaminha os headers para a API oficial", async () => {
    const headers = new Headers({ cookie: "session=opaque" });
    const session = {
      session: { id: "session-id" },
      user: { id: "user-id" },
    };
    mocks.getSession.mockResolvedValue(session);

    await expect(getServerSession(headers)).resolves.toBe(session);
    expect(mocks.getSession).toHaveBeenCalledWith({ headers });
  });

  it("preserva sessão ausente como nula", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(getServerSession(new Headers())).resolves.toBeNull();
  });

  it("não mascara indisponibilidade do serviço", async () => {
    const error = new Error("database unavailable");
    mocks.getSession.mockRejectedValue(error);

    await expect(getServerSession(new Headers())).rejects.toBe(error);
  });
});
