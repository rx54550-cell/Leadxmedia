-- CPA network: publisher-facing offers, clicks, conversions and payout requests.
-- Hand-trimmed: the generated diff also re-created cpa_lead / offer / payout_request because
-- migration 0029 was added without a matching drizzle snapshot. Those objects already exist.

CREATE TABLE "cpa_offer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"payout" double precision NOT NULL,
	"cap" integer,
	"country" text DEFAULT 'All' NOT NULL,
	"device" text DEFAULT 'All' NOT NULL,
	"type" text DEFAULT 'SOI' NOT NULL,
	"advertiser_name" text NOT NULL,
	"advertiser_id" text,
	"tracking_url" text NOT NULL,
	"postback_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_fast_pay" boolean DEFAULT false NOT NULL,
	"is_locker_only" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpa_click" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"user_id" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"country" text,
	"sub_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpa_conversion" (
	"id" text PRIMARY KEY NOT NULL,
	"click_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"user_id" text NOT NULL,
	"payout" double precision NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"postback_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cpa_conversion_click_id_unique" UNIQUE("click_id")
);
--> statement-breakpoint
CREATE TABLE "cpa_payout_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"method" text DEFAULT 'PayPal' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'PUBLISHER' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "balance" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "total_earned" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cpa_click" ADD CONSTRAINT "cpa_click_offer_id_cpa_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."cpa_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpa_click" ADD CONSTRAINT "cpa_click_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpa_conversion" ADD CONSTRAINT "cpa_conversion_click_id_cpa_click_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."cpa_click"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpa_conversion" ADD CONSTRAINT "cpa_conversion_offer_id_cpa_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."cpa_offer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpa_conversion" ADD CONSTRAINT "cpa_conversion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpa_payout_request" ADD CONSTRAINT "cpa_payout_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cpa_click_user_created" ON "cpa_click" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "cpa_click_offer_created" ON "cpa_click" USING btree ("offer_id","created_at");--> statement-breakpoint
CREATE INDEX "cpa_conversion_user_created" ON "cpa_conversion" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "cpa_conversion_offer_created" ON "cpa_conversion" USING btree ("offer_id","created_at");--> statement-breakpoint
CREATE INDEX "cpa_conversion_status" ON "cpa_conversion" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpa_offer_active_created" ON "cpa_offer" USING btree ("is_active","created_at");--> statement-breakpoint
CREATE INDEX "cpa_offer_country" ON "cpa_offer" USING btree ("country");--> statement-breakpoint
CREATE INDEX "cpa_offer_device" ON "cpa_offer" USING btree ("device");--> statement-breakpoint
CREATE INDEX "cpa_offer_type" ON "cpa_offer" USING btree ("type");--> statement-breakpoint
CREATE INDEX "cpa_offer_advertiser" ON "cpa_offer" USING btree ("advertiser_name");--> statement-breakpoint
CREATE INDEX "cpa_payout_request_user_created" ON "cpa_payout_request" USING btree ("user_id","created_at");
