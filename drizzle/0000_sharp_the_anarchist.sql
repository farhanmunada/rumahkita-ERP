CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"tagline" text,
	"invoice_prefix" varchar(20) NOT NULL,
	"address" text,
	"phone" varchar(50),
	"email" varchar(255),
	"bank_name" varchar(100),
	"bank_account_number" varchar(100),
	"bank_account_holder" varchar(255),
	"default_terms" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"item_type" varchar(20) DEFAULT 'service' NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit" varchar(50),
	"unit_price" integer DEFAULT 0 NOT NULL,
	"total_price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"issue_date" varchar(10) NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount_type" varchar(20) DEFAULT 'fixed',
	"discount_value" integer DEFAULT 0,
	"tax_percent" integer DEFAULT 0,
	"tax_amount" integer DEFAULT 0,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"terms" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;