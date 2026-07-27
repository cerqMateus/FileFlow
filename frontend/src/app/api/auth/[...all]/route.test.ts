import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { handler: vi.fn() },
  get: vi.fn(),
  post: vi.fn(),
  toNextJsHandler: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ auth: mocks.auth }));
vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: mocks.toNextJsHandler,
}));

describe("Better Auth Route Handler", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.toNextJsHandler.mockReturnValue({
      GET: mocks.get,
      POST: mocks.post,
    });
  });

  it("delega GET e POST diretamente ao adaptador oficial", async () => {
    const route = await import("./route");

    expect(mocks.toNextJsHandler).toHaveBeenCalledOnce();
    expect(mocks.toNextJsHandler).toHaveBeenCalledWith(mocks.auth);
    expect(route.GET).toBe(mocks.get);
    expect(route.POST).toBe(mocks.post);
    expect(route.runtime).toBe("nodejs");
  });
});
