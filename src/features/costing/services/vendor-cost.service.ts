import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { vendorCosts, type VendorCost, type NewVendorCost } from '@/shared/db/schema';

export async function getVendorCosts(businessId?: number): Promise<VendorCost[]> {
  if (businessId) {
    return db
      .select()
      .from(vendorCosts)
      .where(eq(vendorCosts.businessId, businessId))
      .orderBy(desc(vendorCosts.id));
  }
  return db.select().from(vendorCosts).orderBy(desc(vendorCosts.id));
}

export async function createVendorCost(data: NewVendorCost): Promise<VendorCost> {
  const [created] = await db.insert(vendorCosts).values(data).returning();
  return created;
}

export async function updateVendorCost(
  id: number,
  data: Partial<NewVendorCost>
): Promise<VendorCost | null> {
  const [updated] = await db
    .update(vendorCosts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(vendorCosts.id, id))
    .returning();
  return updated || null;
}

export async function deleteVendorCost(id: number): Promise<boolean> {
  const result = await db.delete(vendorCosts).where(eq(vendorCosts.id, id)).returning();
  return result.length > 0;
}
