import { beforeEach, describe, expect, it, vi } from "vitest";

import { listConverters } from "../config/converters";
import { convertFile } from "./convert-file";

describe("convertFile", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.fileflow.test/base/");
  });

  it.each(listConverters())(
    "envia $key diretamente ao endpoint tipado",
    async (converter) => {
      const file = new File(["entrada-controlada"], `entrada${converter.acceptedExtensions[0]}`);
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response("resultado-controlado", {
            status: 200,
            headers: { "Content-Type": "application/octet-stream" },
          }),
        );
      vi.stubGlobal("fetch", fetchMock);

      const result = await convertFile(converter, file);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, request] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe(`https://api.fileflow.test/base${converter.endpoint}`);
      expect(request).toEqual({
        method: "POST",
        body: expect.any(FormData),
      });
      expect(request).not.toHaveProperty("headers");

      const formData = request?.body;
      expect(formData).toBeInstanceOf(FormData);
      if (!(formData instanceof FormData)) {
        throw new Error("O corpo da requisição não é FormData.");
      }

      expect(Array.from(formData.entries())).toEqual([["file", file]]);
      await expect(result.text()).resolves.toBe("resultado-controlado");
    },
  );
});
