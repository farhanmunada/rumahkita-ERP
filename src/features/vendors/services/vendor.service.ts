import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import {
  vendors,
  vendorCosts,
  type Vendor,
  type NewVendor,
  type VendorCost,
} from '@/shared/db/schema';

export async function getVendors(businessId?: number): Promise<Vendor[]> {
  if (businessId) {
    return db
      .select()
      .from(vendors)
      .where(eq(vendors.businessId, businessId))
      .orderBy(desc(vendors.rating), desc(vendors.id));
  }
  return db
    .select()
    .from(vendors)
    .orderBy(desc(vendors.rating), desc(vendors.id));
}

export async function getVendorById(id: number): Promise<Vendor | null> {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, id))
    .limit(1);
  return vendor || null;
}

export async function createVendor(data: NewVendor): Promise<Vendor> {
  const [created] = await db.insert(vendors).values(data).returning();
  return created;
}

export async function updateVendor(
  id: number,
  data: Partial<NewVendor>
): Promise<Vendor | null> {
  const [updated] = await db
    .update(vendors)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, id))
    .returning();
  return updated || null;
}

export async function deleteVendor(id: number): Promise<boolean> {
  const result = await db.delete(vendors).where(eq(vendors.id, id)).returning();
  return result.length > 0;
}

export interface CatalogItemWithVendor extends VendorCost {
  vendorNameDisplay: string;
  vendorAddress: string | null;
  vendorRating: number;
  vendorNotes: string | null;
  vendorPhone: string | null;
}

export async function getAllVendorCatalogItems(
  businessId?: number
): Promise<CatalogItemWithVendor[]> {
  const query = db
    .select({
      id: vendorCosts.id,
      businessId: vendorCosts.businessId,
      vendorId: vendorCosts.vendorId,
      vendorName: vendorCosts.vendorName,
      itemName: vendorCosts.itemName,
      category: vendorCosts.category,
      unit: vendorCosts.unit,
      baseCost: vendorCosts.baseCost,
      notes: vendorCosts.notes,
      createdAt: vendorCosts.createdAt,
      updatedAt: vendorCosts.updatedAt,
      vendorOfficialName: vendors.name,
      vendorAddress: vendors.address,
      vendorRating: vendors.rating,
      vendorQualityNotes: vendors.qualityNotes,
      vendorPhone: vendors.phone,
    })
    .from(vendorCosts)
    .leftJoin(vendors, eq(vendorCosts.vendorId, vendors.id))
    .orderBy(desc(vendorCosts.id));

  if (businessId) {
    query.where(eq(vendorCosts.businessId, businessId));
  }

  const rows = await query;

  return rows.map((r) => ({
    id: r.id,
    businessId: r.businessId,
    vendorId: r.vendorId,
    vendorName: r.vendorName,
    itemName: r.itemName,
    category: r.category,
    unit: r.unit,
    baseCost: r.baseCost,
    notes: r.notes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    vendorNameDisplay: r.vendorOfficialName || r.vendorName || 'Vendor Umum',
    vendorAddress: r.vendorAddress,
    vendorRating: r.vendorRating ?? 5,
    vendorNotes: r.vendorQualityNotes || r.notes,
    vendorPhone: r.vendorPhone,
  }));
}
