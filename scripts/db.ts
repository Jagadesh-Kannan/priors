import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

// Scripts run outside Next.js, so they can't import src/db (it is server-only).
export const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
export const db = drizzle(client, { schema });
