import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  beforeEach(() => {
    mocks.redirect.mockReset();
    mocks.redirect.mockImplementation((location: string) => {
      throw new Error(`NEXT_REDIRECT:${location}`);
    });
  });

  it("redireciona para a home", async () => {
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(mocks.redirect).toHaveBeenCalledWith("/");
  });
});
