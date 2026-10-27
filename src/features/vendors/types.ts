import { Vendor, VendorCost } from '@/shared/db/schema';

export type VendorDTO = Vendor;

export interface VendorWithCosts extends Vendor {
  costs?: VendorCost[];
}

export interface CreateVendorInput {
  businessId?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  rating?: number; // 1 - 5
  qualityNotes?: string;
  category?: string;
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
  id: number;
}
