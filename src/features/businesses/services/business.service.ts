import { eq } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { businesses, type Business } from '@/shared/db/schema';
import { type UpdateBusinessDTO } from '../types';

export async function getAllBusinesses(): Promise<Business[]> {
  return db.select().from(businesses).orderBy(businesses.id);
}

export async function getBusinessById(id: number): Promise<Business | null> {
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0] || null;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const result = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return result[0] || null;
}

export async function updateBusiness(id: number, data: UpdateBusinessDTO): Promise<Business | null> {
  const updated = await db
    .update(businesses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, id))
    .returning();

  return updated[0] || null;
}
