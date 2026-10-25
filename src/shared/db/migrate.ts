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
