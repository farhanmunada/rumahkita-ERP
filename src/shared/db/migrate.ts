import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment');
  }

  const sql = neon(connectionString);

  console.log('Running migration: creating vendor_costs table...');

  await sql`
    CREATE TABLE IF NOT EXISTS "vendor_costs" (
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
  `;

  console.log('Table vendor_costs verified/created.');

  try {
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'vendor_costs_business_id_businesses_id_fk'
        ) THEN
          ALTER TABLE "vendor_costs"
          ADD CONSTRAINT "vendor_costs_business_id_businesses_id_fk"
          FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id")
          ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `;
    console.log('Foreign key constraint verified/added.');
  } catch (err) {
    console.warn('FK creation note:', (err as Error).message);
  }

  // Also verify by querying
  const check = await sql`SELECT COUNT(*)::int as count FROM "vendor_costs";`;
  console.log('Verification check: vendor_costs row count =', check[0].count);

  // 1. vendors table
  await sql`
    CREATE TABLE IF NOT EXISTS "vendors" (
      "id" serial PRIMARY KEY NOT NULL,
      "business_id" integer REFERENCES "businesses"("id") ON DELETE SET NULL,
      "name" varchar(255) NOT NULL,
      "address" text,
      "phone" varchar(50),
      "email" varchar(255),
      "rating" integer DEFAULT 5 NOT NULL,
      "quality_notes" text,
      "category" varchar(50) DEFAULT 'general' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;
  console.log('Table vendors verified/created.');

  // Ensure vendor_id in vendor_costs
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_costs' AND column_name = 'vendor_id'
      ) THEN
        ALTER TABLE "vendor_costs" ADD COLUMN "vendor_id" integer REFERENCES "vendors"("id") ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  // 3. projects table
  await sql`
    CREATE TABLE IF NOT EXISTS "projects" (
      "id" serial PRIMARY KEY NOT NULL,
      "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
      "client_id" integer REFERENCES "clients"("id") ON DELETE SET NULL,
      "invoice_id" integer REFERENCES "invoices"("id") ON DELETE SET NULL,
      "name" varchar(255) NOT NULL,
      "description" text,
      "status" varchar(30) DEFAULT 'PLANNING' NOT NULL,
      "target_revenue" integer DEFAULT 0 NOT NULL,
      "total_cost" integer DEFAULT 0 NOT NULL,
      "gross_profit" integer DEFAULT 0 NOT NULL,
      "profit_margin" numeric(5, 2) DEFAULT '0',
      "start_date" varchar(10),
      "end_date" varchar(10),
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;
  console.log('Table projects verified/created.');

  // 4. project_costs table
  await sql`
    CREATE TABLE IF NOT EXISTS "project_costs" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
      "vendor_id" integer REFERENCES "vendors"("id") ON DELETE SET NULL,
      "vendor_name_snapshot" varchar(255),
      "item_name" varchar(255) NOT NULL,
      "category" varchar(50) DEFAULT 'vendor' NOT NULL,
      "quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
      "unit" varchar(50),
      "unit_cost" integer DEFAULT 0 NOT NULL,
      "total_cost" integer DEFAULT 0 NOT NULL,
      "is_paid_to_vendor" boolean DEFAULT false NOT NULL,
      "notes" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;
  console.log('Table project_costs verified/created.');
}

runMigration()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
