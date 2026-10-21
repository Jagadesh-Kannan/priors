import { client, db } from "./db";
import { stores } from "../src/db/schema";

// Geofence coordinates are added in Phase 3.
const STORES: (typeof stores.$inferInsert)[] = [
  {
    chain: "costco",
    slug: "tyvola",
    name: "Costco Tyvola (Charlotte)",
    shortName: "Tyvola",
    isPrimary: true,
    shoppable: true,
  },
  {
    chain: "costco",
    slug: "matthews",
    name: "Costco Matthews",
    shortName: "Matthews",
    shoppable: true,
  },
  { chain: "costco", slug: "costco-online", name: "Costco.com", isOnline: true },
  // No Lowe's geofence yet: Lowe's items are priced from Lowes.com.
  {
    chain: "lowes",
    slug: "lowes-online",
    name: "Lowes.com",
    shortName: "Lowe's",
    isOnline: true,
    shoppable: true,
  },
];

// Upsert so re-running the seed picks up changes to existing stores.
for (const store of STORES) {
  await db.insert(stores).values(store).onConflictDoUpdate({ target: stores.slug, set: store });
}
console.log(`Seeded ${STORES.length} stores.`);
await client.end();
