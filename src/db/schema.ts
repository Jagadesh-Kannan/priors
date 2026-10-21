import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const chain = pgEnum("chain", ["costco", "lowes"]);
export const refillStatus = pgEnum("refill_status", ["ok", "running_low", "need_now"]);
export const observationSource = pgEnum("observation_source", [
  "shelf_tag",
  "receipt",
  "booklet",
  "online",
]);
export const alertKind = pgEnum("alert_kind", [
  "price_drop",
  "booklet_deal",
  "markdown",
  "discontinued",
  "best_store",
]);

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const households = pgTable("households", {
  id: id(),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

// Discounts live on the user, not the household, so future group members can differ.
export const users = pgTable("users", {
  id: id(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  lowesDiscountPct: integer("lowes_discount_pct").notNull().default(20),
  costcoMember: boolean("costco_member").notNull().default(true),
  createdAt: createdAt(),
});

// Physical warehouses and online storefronts. Geofence fields are filled in Phase 3.
export const stores = pgTable("stores", {
  id: id(),
  chain: chain("chain").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  isOnline: boolean("is_online").notNull().default(false),
  isPrimary: boolean("is_primary").notNull().default(false),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  geofenceRadiusM: integer("geofence_radius_m"),
});

// Products belong to the shared price pool, not to a household.
export const products = pgTable(
  "products",
  {
    id: id(),
    chain: chain("chain").notNull(),
    itemNumber: text("item_number"),
    name: text("name").notNull(),
    // What one "unit" means when comparing prices: bag, oz, count, roll, ...
    unitType: text("unit_type").notNull().default("each"),
    unitsPerPack: numeric("units_per_pack", { precision: 10, scale: 2 }).notNull().default("1"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("products_chain_item_number_idx").on(t.chain, t.itemNumber)],
);

export const watchListItems = pgTable(
  "watch_list_items",
  {
    id: id(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id),
    // Free-text name until the item is linked to a product by a tag or receipt.
    name: text("name").notNull(),
    productId: uuid("product_id").references(() => products.id),
    refillStatus: refillStatus("refill_status").notNull().default("ok"),
    addedBy: uuid("added_by").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [index("watch_list_items_household_idx").on(t.householdId)],
);

export const receipts = pgTable("receipts", {
  id: id(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull(),
  totalCents: integer("total_cents"),
  imageUrl: text("image_url"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: createdAt(),
});

export const priceObservations = pgTable(
  "price_observations",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
    source: observationSource("source").notNull(),
    // Shelf/receipt price before any personal discount.
    priceCents: integer("price_cents").notNull(),
    unitPriceCents: numeric("unit_price_cents", { precision: 12, scale: 4 }).notNull(),
    isMarkdown: boolean("is_markdown").notNull().default(false),
    isDiscontinued: boolean("is_discontinued").notNull().default(false),
    imageUrl: text("image_url"),
    receiptId: uuid("receipt_id").references(() => receipts.id),
    capturedBy: uuid("captured_by").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [index("price_observations_product_store_idx").on(t.productId, t.storeId, t.observedAt)],
);

export const alerts = pgTable(
  "alerts",
  {
    id: id(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id),
    watchListItemId: uuid("watch_list_item_id").references(() => watchListItems.id),
    priceObservationId: uuid("price_observation_id").references(() => priceObservations.id),
    kind: alertKind("kind").notNull(),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("alerts_household_idx").on(t.householdId, t.createdAt)],
);
