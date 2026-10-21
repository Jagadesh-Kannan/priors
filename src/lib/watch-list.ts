import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { stores, users, watchListItems, watchListItemStores } from "@/db/schema";
import type { RefillStatus } from "./refill-status";

export type ShoppableStore = { id: string; slug: string; chain: "costco" | "lowes"; label: string };

export type WatchListItem = {
  id: string;
  name: string;
  refillStatus: RefillStatus;
  photoPath: string | null;
  addedByName: string | null;
  storeSlugs: string[];
};

export async function getShoppableStores(): Promise<ShoppableStore[]> {
  const rows = await db
    .select({
      id: stores.id,
      slug: stores.slug,
      chain: stores.chain,
      name: stores.name,
      shortName: stores.shortName,
    })
    .from(stores)
    .where(eq(stores.shoppable, true))
    .orderBy(asc(stores.chain), sql`${stores.isPrimary} desc`, asc(stores.name));
  return rows.map((s) => ({ id: s.id, slug: s.slug, chain: s.chain, label: s.shortName ?? s.name }));
}

// Most urgent first, then alphabetical.
const statusOrder = sql`case ${watchListItems.refillStatus}
  when 'need_now' then 0 when 'running_low' then 1 else 2 end`;

export async function getWatchList(householdId: string, storeSlug?: string) {
  const conditions = [eq(watchListItems.householdId, householdId)];
  if (storeSlug) {
    conditions.push(
      inArray(
        watchListItems.id,
        db
          .select({ id: watchListItemStores.itemId })
          .from(watchListItemStores)
          .innerJoin(stores, eq(stores.id, watchListItemStores.storeId))
          .where(eq(stores.slug, storeSlug)),
      ),
    );
  }

  const items = await db
    .select({
      id: watchListItems.id,
      name: watchListItems.name,
      refillStatus: watchListItems.refillStatus,
      photoPath: watchListItems.photoPath,
      addedByName: users.name,
    })
    .from(watchListItems)
    .leftJoin(users, eq(users.id, watchListItems.addedBy))
    .where(and(...conditions))
    .orderBy(statusOrder, sql`lower(${watchListItems.name})`);

  const storesByItem = await getItemStoreSlugs(items.map((i) => i.id));
  return items.map((i): WatchListItem => ({ ...i, storeSlugs: storesByItem.get(i.id) ?? [] }));
}

export async function getWatchListItem(householdId: string, itemId: string) {
  const [item] = await db
    .select({
      id: watchListItems.id,
      name: watchListItems.name,
      refillStatus: watchListItems.refillStatus,
      photoPath: watchListItems.photoPath,
      addedByName: users.name,
    })
    .from(watchListItems)
    .leftJoin(users, eq(users.id, watchListItems.addedBy))
    .where(and(eq(watchListItems.id, itemId), eq(watchListItems.householdId, householdId)));
  if (!item) return null;
  const storesByItem = await getItemStoreSlugs([item.id]);
  return { ...item, storeSlugs: storesByItem.get(item.id) ?? [] } satisfies WatchListItem;
}

async function getItemStoreSlugs(itemIds: string[]) {
  const map = new Map<string, string[]>();
  if (itemIds.length === 0) return map;
  const rows = await db
    .select({ itemId: watchListItemStores.itemId, slug: stores.slug })
    .from(watchListItemStores)
    .innerJoin(stores, eq(stores.id, watchListItemStores.storeId))
    .where(inArray(watchListItemStores.itemId, itemIds));
  for (const row of rows) map.set(row.itemId, [...(map.get(row.itemId) ?? []), row.slug]);
  return map;
}
