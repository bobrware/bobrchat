import { beforeEach, expect, mock, test } from "bun:test";

let subscription;

mock.module("~/features/auth/lib/session", () => ({
  getRequiredSession: async () => ({ user: { id: "existing-user", email: "existing@example.test" } }),
}));
mock.module("~/features/subscriptions/index", () => ({
  getUserSubscription: async () => subscription,
  checkThreadLimit: async () => ({ currentUsage: 37 }),
  getStorageQuota: async () => ({ usedBytes: 1234, quota: subscription.limits.storageBytes }),
  POLAR_PRODUCT_IDS: { plus: "plus-product" },
}));
mock.module("~/lib/polar", () => ({
  getPolarClient: () => ({
    checkouts: {
      create: async () => {
        throw new Error("Checkout must not contact Polar");
      },
    },
    customerSessions: {
      create: async ({ customerId }) => ({ customerPortalUrl: `https://billing.example.test/${customerId}` }),
    },
  }),
}));
mock.module("~/lib/env", () => ({ serverEnv: {} }));

const { createCheckoutSession, createCustomerPortalSession, getSubscriptionStatus } = await import("../src/features/subscriptions/actions.ts");

beforeEach(() => {
  subscription = { tier: "plus", limits: { threads: null, storageBytes: 100_000_000 }, polarCustomerId: "existing-customer" };
});

test("direct checkout invocation is rejected even for an existing paid user", async () => {
  expect(await createCheckoutSession("plus-product")).toEqual({ error: "New subscriptions and upgrades are no longer available." });
});

test("paid subscription information and its billing portal remain available", async () => {
  expect(await getSubscriptionStatus()).toEqual({
    ...subscription,
    usage: { threads: { current: 37, limit: null }, storage: { current: 1234, limit: 100_000_000 } },
    canUpgrade: false,
  });
  expect(await createCustomerPortalSession()).toEqual({ url: "https://billing.example.test/existing-customer" });
});

test("free users retain their limits and cannot upgrade or open an unrelated billing account", async () => {
  subscription = { tier: "free", limits: { threads: 100, storageBytes: 10_000_000 }, polarCustomerId: null };
  const status = await getSubscriptionStatus();
  expect(status.canUpgrade).toBe(false);
  expect(status.limits).toEqual({ threads: 100, storageBytes: 10_000_000 });
  expect(await createCustomerPortalSession()).toEqual({ error: "No billing account found." });
});
