/* eslint-disable node/no-process-env */
import { expect, test } from "bun:test";

// Run against the local Next.js server: TEST_BASE_URL=http://localhost:3000 bun test tests
const baseUrl = process.env.TEST_BASE_URL;

test.skipIf(!baseUrl)("direct signup returns the local registration-closed redirect", async () => {
  const response = await fetch(new URL("/signup", baseUrl), { redirect: "manual" });
  expect(response.status).toBe(307);
  expect(new URL(response.headers.get("location"), baseUrl).pathname).toBe("/registration-closed");
});

test.skipIf(!baseUrl)("direct pricing and checkout URLs are unavailable", async () => {
  for (const path of ["/pricing", "/pricing/plus", "/checkout", "/checkout/plus", "/api/checkout"]) {
    const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
    expect(response.status).toBe(404);
  }
});

test.skipIf(!baseUrl)("public landing page has sign-in access without signup or subscription offers", async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  expect(response.status).toBe(200);
  expect(html).toContain("Registration is closed.");
  expect(html).toContain("href=\"/login\"");
  expect(html).not.toContain("href=\"/signup\"");
  expect(html).not.toContain("\"@type\":\"Offer\"");
  expect(html).not.toContain(">Pricing</h2>");
});
