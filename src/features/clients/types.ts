import { z } from 'zod';
import type { Client } from '@/shared/db/schema';

export type { Client };

export const clientSchema = z.object({
  name: z.string().min(1, 'Nama kontak klien wajib diisi'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type CreateClientDTO = z.infer<typeof clientSchema>;
export type UpdateClientDTO = Partial<CreateClientDTO>;
