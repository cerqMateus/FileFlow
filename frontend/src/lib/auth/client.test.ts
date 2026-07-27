import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAuthClient: vi.fn(() => ({ kind: "auth-client" })),
}));

vi.mock("better-auth/react", () => ({
  createAuthClient: mocks.createAuthClient,
}));

import { authClient } from "./client";

describe("authClient", () => {
  it("usa o cliente React oficial na mesma origem, sem configuração sensível", () => {
    expect(mocks.createAuthClient).toHaveBeenCalledOnce();
    expect(mocks.createAuthClient).toHaveBeenCalledWith();
    expect(authClient).toEqual({ kind: "auth-client" });
  });
});
