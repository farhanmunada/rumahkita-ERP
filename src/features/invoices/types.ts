import { z } from 'zod';
import type { Invoice, InvoiceItem, Business, Client } from '@/shared/db/schema';

export type { Invoice, InvoiceItem };

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

export interface InvoiceItemWithTotal extends InvoiceItem {
  totalPrice: number;
}

export interface InvoiceWithRelations extends Invoice {
  business: Business;
  client: Client;
  items: InvoiceItem[];
}

export const invoiceItemSchema = z.object({
  id: z.number().optional(),
  itemType: z.string().default('service'),
  description: z.string().min(1, 'Deskripsi barang/jasa wajib diisi'),
  quantity: z.number().min(0.01, 'Jumlah minimal 0.01'),
  unit: z.string().optional(),
  unitPrice: z.number().min(0, 'Harga satuan tidak boleh negatif'),
});

export const createInvoiceSchema = z.object({
  businessId: z.number({ required_error: 'Unit bisnis wajib dipilih' }),
  clientId: z.number({ required_error: 'Klien wajib dipilih' }),
  issueDate: z.string().min(1, 'Tanggal invoice wajib diisi'),
  dueDate: z.string().min(1, 'Jatuh tempo wajib diisi'),
  taxPercent: z.number().min(0).max(100).default(0),
  discountType: z.enum(['fixed', 'percent']).default('fixed'),
  discountValue: z.number().min(0).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Minimal harus ada 1 baris item invoice'),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']),
});

export type CreateInvoiceDTO = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceDTO = Partial<CreateInvoiceDTO>;
