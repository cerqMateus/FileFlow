import { expect, test, type Response } from "@playwright/test";

import { BACKEND_URL, FRONTEND_URL } from "../playwright.shared";


test("o navegador alcança o FastAPI diretamente com CORS sem acionar engine", async ({
  page,
}) => {
  const backendRequests: string[] = [];
  const frontendApiRequests: string[] = [];
  let backendResponse: Response | undefined;

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === BACKEND_URL && url.pathname.startsWith("/convert/")) {
      backendRequests.push(request.url());
    }
    if (
      url.origin === FRONTEND_URL &&
      (url.pathname.startsWith("/api/") || url.pathname.startsWith("/convert/"))
    ) {
      frontendApiRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (response.url() === `${BACKEND_URL}/convert/pdf-to-docx`) {
      backendResponse = response;
    }
  });

  await page.goto("/converter/pdf/docx");
  await page.getByLabel(/Selecione seu arquivo/u).setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("invalid-extension-stops-before-engine", "utf8"),
  });
  await page.getByRole("button", { name: /Converter para/u }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Erro: Apenas arquivos .pdf são permitidos.",
  );
  expect(backendRequests).toEqual([`${BACKEND_URL}/convert/pdf-to-docx`]);
  expect(frontendApiRequests).toEqual([]);
  expect(backendResponse).toBeDefined();
  const responseHeaders = await backendResponse?.allHeaders();
  expect(responseHeaders?.["access-control-allow-origin"]).toBe(FRONTEND_URL);
});
