import { sql, and, eq, like } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { businesses, invoices } from '@/shared/db/schema';

export async function generateInvoiceNumber(businessId: number, issueDateStr: string): Promise<string> {
  const business = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  const prefix = business[0]?.invoicePrefix?.toUpperCase() || 'INV';
  const year = new Date(issueDateStr).getFullYear() || new Date().getFullYear();

  const pattern = `INV/${prefix}/${year}/%`;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(eq(invoices.businessId, businessId), like(invoices.invoiceNumber, pattern)));

  const count = Number(countResult[0]?.count || 0);
  const sequence = String(count + 1).padStart(4, '0');

  return `INV/${prefix}/${year}/${sequence}`;
}
