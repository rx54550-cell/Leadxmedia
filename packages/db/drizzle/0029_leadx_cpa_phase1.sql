CREATE TABLE "offer" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "payout_type" text NOT NULL,
  "payout_amount" integer NOT NULL,
  "currency" text DEFAULT 'usd' NOT NULL,
  "geos" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "tracking_url" text NOT NULL,
  "postback_url" text,
  "description" text DEFAULT '' NOT NULL,
  "status" text DEFAULT 'paused' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "offer_workspace_status" ON "offer" USING btree ("workspace_id", "status");
--> statement-breakpoint
CREATE INDEX "offer_category" ON "offer" USING btree ("category");
--> statement-breakpoint

CREATE TABLE "cpa_lead" (
  "id" text PRIMARY KEY NOT NULL,
  "offer_id" text NOT NULL REFERENCES "offer"("id") ON DELETE CASCADE,
  "partner_id" text NOT NULL REFERENCES "partner"("id") ON DELETE CASCADE,
  "click_id" text NOT NULL,
  "transaction_id" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "payout_amount" integer NOT NULL,
  "currency" text DEFAULT 'usd' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cpa_lead_offer_transaction" ON "cpa_lead" USING btree ("offer_id", "transaction_id");
--> statement-breakpoint
CREATE INDEX "cpa_lead_partner_created" ON "cpa_lead" USING btree ("partner_id", "created_at");
--> statement-breakpoint

CREATE TABLE "payout_request" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL REFERENCES "workspace"("id") ON DELETE CASCADE,
  "partner_id" text NOT NULL REFERENCES "partner"("id") ON DELETE CASCADE,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'usd' NOT NULL,
  "method" text DEFAULT 'manual' NOT NULL,
  "destination" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "admin_note" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "reviewed_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "payout_request_partner_created" ON "payout_request" USING btree ("partner_id", "created_at");
--> statement-breakpoint
CREATE INDEX "payout_request_workspace_status" ON "payout_request" USING btree ("workspace_id", "status");
--> statement-breakpoint

ALTER TABLE "click" ADD COLUMN "offer_id" text REFERENCES "offer"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX "click_offer_created" ON "click" USING btree ("offer_id", "created_at") WHERE "offer_id" IS NOT NULL;
-- CPA verticals are stored as text (not a database enum), so these options need no enum rebuild.
-- `offer.category` accepts the LeadX category list defined by OFFER_CATEGORIES in schema.ts.
