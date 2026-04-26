import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { cache } from "react";

import { serverEnv } from "~/lib/env";

import * as schema from "./schema";

/**
 * Get a database client scoped to the current request.
 * Uses React.cache() to deduplicate within a single request/render.
 *
 * - Development: connects directly via DATABASE_URL with postgres.js
 * - Production: uses Cloudflare Hyperdrive for connection pooling at the edge
 */
export const getDb = cache(() => {
  const isDev = process.env.NODE_ENV === "development";

  const connectionString = isDev
    ? serverEnv.DATABASE_URL
    : getCloudflareContext().env.HYPERDRIVE.connectionString;

  const client = postgres(connectionString, {
    max: isDev ? 20 : 10,
    idle_timeout: 30,
    connect_timeout: 10,
    // Hyperdrive manages pooling; prepare must be disabled for pooled connections
    ...(!isDev && { prepare: false }),
  });

  return drizzlePostgres({ client, casing: "snake_case", schema });
});

/**
 * @deprecated Use `getDb()` instead for Cloudflare Workers compatibility.
 * This alias exists for backward compatibility during migration.
 */
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
