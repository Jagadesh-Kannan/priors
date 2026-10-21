CREATE TABLE "watch_list_item_stores" (
	"item_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	CONSTRAINT "watch_list_item_stores_item_id_store_id_pk" PRIMARY KEY("item_id","store_id")
);
--> statement-breakpoint
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_watch_list_item_id_watch_list_items_id_fk";
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "short_name" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "shoppable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD COLUMN "photo_path" text;--> statement-breakpoint
ALTER TABLE "watch_list_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_list_item_stores" ADD CONSTRAINT "watch_list_item_stores_item_id_watch_list_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."watch_list_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_list_item_stores" ADD CONSTRAINT "watch_list_item_stores_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watch_list_item_id_watch_list_items_id_fk" FOREIGN KEY ("watch_list_item_id") REFERENCES "public"."watch_list_items"("id") ON DELETE set null ON UPDATE no action;