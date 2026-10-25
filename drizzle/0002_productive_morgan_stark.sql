CREATE TABLE "vendor_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"vendor_name" varchar(255),
	"item_name" varchar(255) NOT NULL,
	"category" varchar(50) DEFAULT 'vendor' NOT NULL,
	"unit" varchar(50) DEFAULT 'pcs' NOT NULL,
	"base_cost" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendor_costs" ADD CONSTRAINT "vendor_costs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;