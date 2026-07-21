import { expect, type Page, type Request, type Route } from "@playwright/test";

import { BACKEND_URL, FRONTEND_URL } from "../playwright.shared";
import type { ConversionCase } from "./conversion-cases";

type MockResponse = Readonly<{
  status: number;
  contentType: string;
  body: Buffer;
  deferred?: boolean;
}>;

export type ConversionApiMock = Readonly<{
  requestObserved: Promise<void>;
  release: () => void;
  assertComplete: () => void;
}>;

function verifyMultipartRequest(
  request: Request,
  conversion: ConversionCase,
  inputPayload: Buffer,
): void {
  expect(request.method()).toBe("POST");
  expect(new URL(request.url()).pathname).toBe(conversion.endpoint);

  const contentType = request.headers()["content-type"];
  expect(contentType).toMatch(/^multipart\/form-data;\s*boundary=.+/u);

  const body = request.postDataBuffer();
  expect(body).not.toBeNull();
  if (body === null) {
    throw new Error("O multipart não possui body.");
  }

  const multipart = body.toString("latin1");
  expect(multipart.match(/name="file"/gu)).toHaveLength(1);
  expect(multipart).toContain(`filename="${conversion.inputName}"`);
  expect(multipart).toContain(inputPayload.toString("latin1"));
}

export async function mockConversionApi(
  page: Page,
  conversion: ConversionCase,
  inputPayload: Buffer,
  responses: readonly MockResponse[],
): Promise<ConversionApiMock> {
  const observed = Promise.withResolvers<void>();
  const gate = Promise.withResolvers<void>();
  const unexpectedRequests: string[] = [];
  let responseIndex = 0;

  page.on("request", (request) => {
    const url = new URL(request.url());
    const usesFrontendApiRoute =
      url.origin === FRONTEND_URL &&
      (url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/convert/"));
    if (usesFrontendApiRoute) {
      unexpectedRequests.push(request.url());
    }
  });

  await page.route(`${BACKEND_URL}/**`, async (route: Route) => {
    const response = responses[responseIndex];
    expect(response).toBeDefined();
    if (response === undefined) {
      await route.abort("failed");
      return;
    }

    verifyMultipartRequest(route.request(), conversion, inputPayload);
    responseIndex += 1;
    observed.resolve();

    if (response.deferred === true) {
      await gate.promise;
    }

    await route.fulfill({
      status: response.status,
      contentType: response.contentType,
      body: response.body,
    });
  });

  return {
    requestObserved: observed.promise,
    release: gate.resolve,
    assertComplete: () => {
      expect(responseIndex).toBe(responses.length);
      expect(unexpectedRequests).toEqual([]);
    },
  };
}
