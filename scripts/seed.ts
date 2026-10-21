import { client, db } from "./db";
import { stores } from "../src/db/schema";

// Geofence coordinates are added in Phase 3.
const STORES: (typeof stores.$inferInsert)[] = [
  { chain: "costco", slug: "tyvola", name: "Costco Tyvola (Charlotte)", isPrimary: true },
  { chain: "costco", slug: "matthews", name: "Costco Matthews" },
  { chain: "costco", slug: "costco-online", name: "Costco.com", isOnline: true },
  { chain: "lowes", slug: "lowes-online", name: "Lowes.com", isOnline: true },
];

await db.insert(stores).values(STORES).onConflictDoNothing({ target: stores.slug });
console.log(`Seeded ${STORES.length} stores.`);
await client.end();
