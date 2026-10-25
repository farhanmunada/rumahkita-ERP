import { eq, desc } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { clients, type Client } from '@/shared/db/schema';
import { type CreateClientDTO, type UpdateClientDTO } from '../types';

export async function getAllClients(): Promise<Client[]> {
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number): Promise<Client | null> {
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0] || null;
}

export async function createClient(data: CreateClientDTO): Promise<Client> {
  const created = await db
    .insert(clients)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created[0];
}

export async function updateClient(id: number, data: UpdateClientDTO): Promise<Client | null> {
  const updated = await db
    .update(clients)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();

  return updated[0] || null;
}

export async function deleteClient(id: number): Promise<boolean> {
  const deleted = await db.delete(clients).where(eq(clients.id, id)).returning();
  return deleted.length > 0;
}
