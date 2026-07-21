import { expect, test } from "@playwright/test";

import { mockConversionApi } from "./conversion-api";
import { conversionCases } from "./conversion-cases";


test("a home apresenta os cinco conversores e navega pelo catálogo", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "FileFlow" })).toBeVisible();
  for (const conversion of conversionCases) {
    await expect(
      page.getByRole("link", { name: new RegExp(conversion.title, "u") }),
    ).toHaveAttribute("href", conversion.route);
  }

  await page
    .getByRole("link", { name: new RegExp(conversionCases[0].title, "u") })
    .click();
  await expect(
    page.getByRole("heading", { name: conversionCases[0].title }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
});

for (const conversion of conversionCases) {
  test(`${conversion.key}: envia multipart ao endpoint correto e baixa o resultado`, async ({
    page,
  }) => {
    const inputPayload = Buffer.from(`e2e-input-${conversion.key}`, "utf8");
    const api = await mockConversionApi(page, conversion, inputPayload, [
      {
        status: 200,
        contentType: conversion.outputMime,
        body: Buffer.from(`e2e-output-${conversion.key}`, "utf8"),
        deferred: true,
      },
    ]);

    await page.goto(conversion.route);
    await page.getByLabel(new RegExp("Selecione seu arquivo", "u")).setInputFiles({
      name: conversion.inputName,
      mimeType: conversion.inputMime,
      buffer: inputPayload,
    });

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Converter para/u }).click();
    await api.requestObserved;

    await expect(page.getByRole("button", { name: "Processando..." })).toBeDisabled();
    await expect(
      page.getByRole("status"),
    ).toHaveText("Aguarde, estamos convertendo seu arquivo...");

    api.release();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe(conversion.expectedDownloadName);
    await expect(page.getByRole("status")).toHaveText(
      "Sucesso! Seu download deve começar em breve.",
    );
    await expect(page.getByRole("button", { name: /Converter para/u })).toBeEnabled();
    api.assertComplete();
  });
}

test("erro FastAPI restaura a interface e permite uma nova tentativa", async ({
  page,
}) => {
  const conversion = conversionCases[0];
  const inputPayload = Buffer.from("e2e-retry-input", "utf8");
  const api = await mockConversionApi(page, conversion, inputPayload, [
    {
      status: 500,
      contentType: "application/json",
      body: Buffer.from(JSON.stringify({ detail: "Falha E2E controlada." })),
    },
    {
      status: 200,
      contentType: conversion.outputMime,
      body: Buffer.from("e2e-retry-output", "utf8"),
    },
  ]);
  let downloadCount = 0;
  page.on("download", () => {
    downloadCount += 1;
  });

  await page.goto(conversion.route);
  await page.getByLabel(/Selecione seu arquivo/u).setInputFiles({
    name: conversion.inputName,
    mimeType: conversion.inputMime,
    buffer: inputPayload,
  });

  await page.getByRole("button", { name: /Converter para/u }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Erro: Falha E2E controlada.",
  );
  expect(downloadCount).toBe(0);
  await expect(page.getByRole("button", { name: /Converter para/u })).toBeEnabled();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Converter para/u }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(conversion.expectedDownloadName);
  await expect(page.getByRole("status")).toHaveText(
    "Sucesso! Seu download deve começar em breve.",
  );
  expect(downloadCount).toBe(1);
  api.assertComplete();
});

test("um par de formatos desconhecido retorna a página 404", async ({ page }) => {
  const response = await page.goto("/converter/pdf/png");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
