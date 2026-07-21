import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";

import { BACKEND_URL } from "../playwright.shared";


async function captureReviewImage(
  page: Page,
  testInfo: TestInfo,
  filename: string,
): Promise<void> {
  await page.screenshot({
    path: testInfo.outputPath(filename),
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
}

async function readBoxes(locator: Locator): Promise<DOMRect[]> {
  return locator.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().toJSON()),
  );
}

test("home mantém a composição visual aprovada", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "FileFlow" })).toBeVisible();
  const cards = page.getByRole("link", { name: /Converter/u });
  await expect(cards).toHaveCount(5);

  const boxes = await readBoxes(cards);
  if (testInfo.project.name === "desktop-chromium") {
    expect(new Set(boxes.slice(0, 4).map(({ y }) => Math.round(y))).size).toBe(1);
    expect(boxes[4]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  } else {
    expect(new Set(boxes.map(({ x }) => Math.round(x))).size).toBe(1);
    expect(
      boxes.every(
        (box, index) => index === 0 || box.y > boxes[index - 1]!.y,
      ),
    ).toBe(true);
  }

  await captureReviewImage(page, testInfo, "home.png");
});

test("conversor mantém os estados visuais estáveis", async ({ page }, testInfo) => {
  await page.route(`${BACKEND_URL}/convert/pdf-to-docx`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Falha visual controlada." }),
    });
  });

  await page.goto("/converter/pdf/docx");
  await expect(page.getByRole("heading", { name: "PDF para Word" })).toBeVisible();
  const cardBox = await page.locator("main").boundingBox();
  expect(cardBox).not.toBeNull();
  expect(cardBox?.width).toBeLessThanOrEqual(448);
  await captureReviewImage(page, testInfo, "converter-idle.png");

  await page.getByLabel(/Selecione seu arquivo/u).setInputFiles({
    name: "visual.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("visual-state", "utf8"),
  });
  await captureReviewImage(page, testInfo, "converter-selected.png");

  await page.getByRole("button", { name: /Converter para/u }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Erro: Falha visual controlada.",
  );
  await captureReviewImage(page, testInfo, "converter-error.png");
});
