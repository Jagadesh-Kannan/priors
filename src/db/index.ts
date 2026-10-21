import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one client across hot reloads in dev.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

const client =
  globalForDb.pg ??
  postgres(process.env.DATABASE_URL!, {
    // Serverless functions should hold few connections; use the pooled URL in production.
    max: 5,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
