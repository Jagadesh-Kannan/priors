CREATE TYPE "public"."alert_kind" AS ENUM('price_drop', 'booklet_deal', 'markdown', 'discontinued', 'best_store');--> statement-breakpoint
CREATE TYPE "public"."chain" AS ENUM('costco', 'lowes');--> statement-breakpoint
CREATE TYPE "public"."observation_source" AS ENUM('shelf_tag', 'receipt', 'booklet', 'online');--> statement-breakpoint
CREATE TYPE "public"."refill_status" AS ENUM('ok', 'running_low', 'need_now');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"watch_list_item_id" uuid,
	"price_observation_id" uuid,
	"kind" "alert_kind" NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "observation_source" NOT NULL,
	"price_cents" integer NOT NULL,
	"unit_price_cents" numeric(12, 4) NOT NULL,
	"is_markdown" boolean DEFAULT false NOT NULL,
	"is_discontinued" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"receipt_id" uuid,
	"captured_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chain" "chain" NOT NULL,
	"item_number" text,
	"name" text NOT NULL,
	"unit_type" text DEFAULT 'each' NOT NULL,
	"units_per_pack" numeric(10, 2) DEFAULT '1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"purchased_at" timestamp with time zone NOT NULL,
	"total_cents" integer,
	"image_url" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chain" "chain" NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"geofence_radius_m" integer,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"lowes_discount_pct" integer DEFAULT 20 NOT NULL,
	"costco_member" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "watch_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"name" text NOT NULL,
	"product_id" uuid,
	"refill_status" "refill_status" DEFAULT 'ok' NOT NULL,
	"added_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watch_list_item_id_watch_list_items_id_fk" FOREIGN KEY ("watch_list_item_id") REFERENCES "public"."watch_list_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_price_observation_id_price_observations_id_fk" FOREIGN KEY ("price_observation_id") REFERENCES "public"."price_observations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_captured_by_users_id_fk" FOREIGN KEY ("captured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD CONSTRAINT "watch_list_items_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD CONSTRAINT "watch_list_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD CONSTRAINT "watch_list_items_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_household_idx" ON "alerts" USING btree ("household_id","created_at");--> statement-breakpoint
CREATE INDEX "price_observations_product_store_idx" ON "price_observations" USING btree ("product_id","store_id","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "products_chain_item_number_idx" ON "products" USING btree ("chain","item_number");--> statement-breakpoint
CREATE INDEX "watch_list_items_household_idx" ON "watch_list_items" USING btree ("household_id");