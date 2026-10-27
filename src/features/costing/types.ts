export type CostCategory =
  | 'vendor'
  | 'shipping'
  | 'packaging'
  | 'overhead'
  | 'material'
  | 'labor'
  | 'other';

export interface CostItem {
  id: string;
  name: string;
  category: CostCategory;
  vendorName?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  vendorCostId?: number;
  notes?: string;
}

export type PricingMethod = 'margin' | 'markup';

export interface PriceTier {
  id: string;
  name: string;
  percentage: number;
  method: PricingMethod;
  unitPrice: number;
  totalPrice: number;
  unitProfit: number;
  totalProfit: number;
  badgeText: string;
  description: string;
}

export interface CalculationResult {
  outputQuantity: number;
  totalCost: number;
  unitCost: number;
  vendorCost: number;
  shippingCost: number;
  packagingCost: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  tiers: PriceTier[];
}

export interface VendorCostDTO {
  id: number;
  businessId: number;
  vendorName: string | null;
  itemName: string;
  category: string;
  unit: string;
  baseCost: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
