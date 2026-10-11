/* eslint-disable node/no-process-env */
import { beforeEach, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";

// Use the real AuthKit callback and cookie encryption, with no external calls.
process.env.WORKOS_API_KEY = "sk_test_local";
process.env.WORKOS_CLIENT_ID = "client_test";
process.env.WORKOS_COOKIE_PASSWORD = "local-test-cookie-password-at-least-32-characters";
process.env.WORKOS_COOKIE_NAME = "test-session";
process.env.WORKOS_COOKIE_DOMAIN = "bobrchat.test";

let identity;
let rows;
let databaseError;
const cookieJar = new Map();

mock.module(new URL("../node_modules/@workos-inc/authkit-nextjs/dist/esm/workos.js", import.meta.url).pathname, () => ({
  getWorkOS: () => ({
    userManagement: {
      authenticateWithCode: async () => ({
        user: identity,
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      }),
    },
  }),
}));
mock.module("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    set: (name, value, options) => cookieJar.set(name, { value, ...options }),
  }),
}));
mock.module("~/lib/env", () => ({
  serverEnv: {
    WORKOS_COOKIE_NAME: "test-session",
    WORKOS_COOKIE_DOMAIN: "bobrchat.test",
  },
}));

function matches(row, condition) {
  const column = condition.queryChunks[1].name;
  const field = column === "workos_id" ? "workosId" : column;
  return row[field] === condition.queryChunks[3].value;
}

mock.module("~/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: condition => ({
          limit: async (count) => {
            if (databaseError)
              throw databaseError;
            return rows.filter(row => matches(row, condition)).slice(0, count);
          },
        }),
      }),
    }),
    update: () => ({
      set: values => ({
        where: async (condition) => {
          for (const row of rows.filter(row => matches(row, condition)))
            Object.assign(row, values);
        },
      }),
    }),
    insert: () => {
      throw new Error("Registration must not create any local records");
    },
  },
}));

const { GET: callback } = await import("../src/app/callback/route.ts");
const { GET: signup } = await import("../src/app/signup/route.ts");

beforeEach(() => {
  identity = { id: "workos-existing", email: "existing@example.test", firstName: "Existing", lastName: "User", profilePictureUrl: null };
  rows = [];
  databaseError = null;
  cookieJar.clear();
});

function request() {
  return new NextRequest("https://bobrchat.test/callback?code=test-code");
}

test("existing WorkOS ID signs in even when its email has changed", async () => {
  rows = [
    { id: "local-existing", workosId: identity.id, email: "old@example.test", name: "Old name" },
    { id: "other-user", workosId: "other-identity", email: identity.email, name: "Other user" },
  ];
  const response = await callback(request());
  expect(response.headers.get("location")).toBe("https://bobrchat.test/");
  expect(rows[0]).toMatchObject({ id: "local-existing", name: "Existing User", email: "old@example.test" });
  expect(rows[1].workosId).toBe("other-identity");
  expect(cookieJar.get("test-session").value).not.toBe("");
  expect(cookieJar.get("test-session").maxAge).toBeGreaterThan(0);
});

test("existing email links to a replacement WorkOS identity without creating records", async () => {
  rows = [{ id: "local-existing", workosId: "old-workos-id", email: identity.email, name: "Keep my name" }];
  const response = await callback(request());
  expect(response.headers.get("location")).toBe("https://bobrchat.test/");
  expect(rows).toEqual([{ id: "local-existing", workosId: identity.id, email: identity.email, name: "Keep my name", image: null }]);
  expect(cookieJar.get("test-session").maxAge).toBeGreaterThan(0);
});

test("brand-new identity is redirected to registration-closed and its saved cookie is expired", async () => {
  rows = [{ id: "other-user", workosId: "other-identity", email: "other@example.test", name: "Other" }];
  const before = structuredClone(rows);
  const response = await callback(request());
  expect(response.headers.get("location")).toBe("https://bobrchat.test/registration-closed");
  expect(rows).toEqual(before);
  expect(cookieJar.get("test-session")).toMatchObject({ value: "", maxAge: 0, domain: "bobrchat.test", path: "/" });
  expect(response.headers.get("cache-control")).toContain("no-store");
});

test("database failure is not mislabeled registration-closed and expires the saved cookie", async () => {
  databaseError = new Error("Local test database unavailable");
  const response = await callback(request());
  expect(response.status).toBe(500);
  expect((await response.json()).error.message).toBe("Couldn't sign in");
  expect(cookieJar.get("test-session").maxAge).toBe(0);
});

test("direct signup redirects locally instead of opening WorkOS registration", () => {
  expect(signup).toThrow("NEXT_REDIRECT");
  try {
    signup();
  }
  catch (error) {
    expect(error.digest).toContain("/registration-closed");
  }
});
