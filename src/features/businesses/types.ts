import { z } from 'zod';
import type { Business } from '@/shared/db/schema';

export type { Business };

export const updateBusinessSchema = z.object({
  name: z.string().min(1, 'Nama unit bisnis wajib diisi'),
  tagline: z.string().optional(),
  invoicePrefix: z.string().min(1, 'Prefix invoice wajib diisi').max(10, 'Maksimal 10 karakter'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  defaultTerms: z.string().optional(),
});

export type UpdateBusinessDTO = z.infer<typeof updateBusinessSchema>;
