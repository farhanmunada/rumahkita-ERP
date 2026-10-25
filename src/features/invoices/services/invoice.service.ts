import { eq, desc, and, like, or } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { invoices, invoiceItems, businesses, clients, type Invoice, type InvoiceItem } from '@/shared/db/schema';
import { CreateInvoiceDTO, InvoiceStatus, InvoiceWithRelations } from '../types';
import { generateInvoiceNumber } from './invoice-number.service';

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  taxPercent: number = 0,
  discountType: 'fixed' | 'percent' = 'fixed',
  discountValue: number = 0
) {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = Math.round(subtotal * (Math.min(100, Math.max(0, discountValue)) / 100));
  } else {
    discountAmount = Math.min(Math.max(0, discountValue || 0), subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * ((taxPercent || 0) / 100));
  const totalAmount = taxableAmount + taxAmount;

  return { subtotal, discountAmount, taxAmount, totalAmount };
}

export async function createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
  const discountType = data.discountType || 'fixed';
  const discountValue = data.discountValue || 0;
  const taxPercent = data.taxPercent || 0;

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    data.items,
    taxPercent,
    discountType,
    discountValue
  );

  const invoiceNumber = await generateInvoiceNumber(data.businessId, data.issueDate);

  const downPayment = Math.min(Math.max(0, data.downPayment || 0), totalAmount);
  const initialStatus = downPayment >= totalAmount && totalAmount > 0 
    ? 'PAID' 
    : downPayment > 0 
    ? 'PARTIAL' 
    : 'DRAFT';

  const [insertedInvoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      businessId: data.businessId,
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: initialStatus,
      subtotal,
      discountType,
      discountValue,
      taxPercent,
      taxAmount,
      totalAmount,
      downPayment,
      notes: data.notes || '',
      terms: data.terms || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (data.items.length > 0) {
    const itemRecords = data.items.map((item) => ({
      invoiceId: insertedInvoice.id,
      itemType: item.itemType || 'service',
      description: item.description,
      quantity: String(item.quantity),
      unit: item.unit || '',
      unitPrice: Math.round(item.unitPrice),
      totalPrice: Math.round(item.quantity * item.unitPrice),
    }));
    await db.insert(invoiceItems).values(itemRecords);
  }

  return insertedInvoice;
}

export async function getInvoiceById(id: number): Promise<InvoiceWithRelations | null> {
  const invoiceRes = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoiceRes[0]) return null;

  const invoice = invoiceRes[0];

  const [businessRes, clientRes, itemsRes] = await Promise.all([
    db.select().from(businesses).where(eq(businesses.id, invoice.businessId)).limit(1),
    db.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1),
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id)),
  ]);

  if (!businessRes[0] || !clientRes[0]) return null;

  return {
    ...invoice,
    business: businessRes[0],
    client: clientRes[0],
    items: itemsRes,
  };
}

export async function getAllInvoices(filters?: {
  businessId?: number;
  status?: string;
  search?: string;
}) {
  const conditions = [];

  if (filters?.businessId) {
    conditions.push(eq(invoices.businessId, filters.businessId));
  }

  if (filters?.status && filters.status !== 'ALL') {
    conditions.push(eq(invoices.status, filters.status));
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(invoices.invoiceNumber, term),
        like(clients.name, term),
        like(clients.companyName, term)
      )
    );
  }

  const query = db
    .select({
      invoice: invoices,
      business: businesses,
      client: clients,
    })
    .from(invoices)
    .innerJoin(businesses, eq(invoices.businessId, businesses.id))
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.createdAt));

  const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return rows.map((r) => ({
    ...r.invoice,
    business: r.business,
    client: r.client,
  }));
}

export async function updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<boolean> {
  const res = await db
    .update(invoices)
    .set({ status, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return res.length > 0;
}

export async function updateInvoice(id: number, data: CreateInvoiceDTO): Promise<Invoice | null> {
  const discountType = data.discountType || 'fixed';
  const discountValue = data.discountValue || 0;
  const taxPercent = data.taxPercent || 0;

  const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
    data.items,
    taxPercent,
    discountType,
    discountValue
  );

  const downPayment = data.downPayment !== undefined
    ? Math.min(Math.max(0, data.downPayment), totalAmount)
    : undefined;

  const [updatedInvoice] = await db
    .update(invoices)
    .set({
      businessId: data.businessId,
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal,
      discountType,
      discountValue,
      taxPercent,
      taxAmount,
      totalAmount,
      ...(downPayment !== undefined ? { downPayment } : {}),
      notes: data.notes || '',
      terms: data.terms || '',
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
    .returning();

  if (!updatedInvoice) return null;

  // Replace items
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

  if (data.items.length > 0) {
    const itemRecords = data.items.map((item) => ({
      invoiceId: id,
      itemType: item.itemType || 'service',
      description: item.description,
      quantity: String(item.quantity),
      unit: item.unit || '',
      unitPrice: Math.round(item.unitPrice),
      totalPrice: Math.round(item.quantity * item.unitPrice),
    }));
    await db.insert(invoiceItems).values(itemRecords);
  }

  return updatedInvoice;
}

export async function deleteInvoice(id: number): Promise<boolean> {
  const deleted = await db.delete(invoices).where(eq(invoices.id, id)).returning();
  return deleted.length > 0;
}

export async function getDashboardStats() {
  const all = await db.select().from(invoices);

  const totalInvoices = all.length;
  const draftCount = all.filter((i) => i.status === 'DRAFT').length;
  const sentCount = all.filter((i) => i.status === 'SENT').length;
  const partialCount = all.filter((i) => i.status === 'PARTIAL').length;
  const paidCount = all.filter((i) => i.status === 'PAID').length;
  const cancelledCount = all.filter((i) => i.status === 'CANCELLED').length;

  const totalRevenue = all
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) +
    all
      .filter((i) => i.status === 'PARTIAL')
      .reduce((acc, curr) => acc + (curr.downPayment || 0), 0);

  const pendingRevenue = all
    .filter((i) => i.status === 'SENT' || i.status === 'DRAFT')
    .reduce((acc, curr) => acc + Math.max(0, (curr.totalAmount || 0) - (curr.downPayment || 0)), 0) +
    all
      .filter((i) => i.status === 'PARTIAL')
      .reduce((acc, curr) => acc + Math.max(0, (curr.totalAmount || 0) - (curr.downPayment || 0)), 0);

  return {
    totalInvoices,
    draftCount,
    sentCount,
    partialCount,
    paidCount,
    cancelledCount,
    totalRevenue,
    pendingRevenue,
  };
}
