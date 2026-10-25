import { CostItem, CalculationResult, PriceTier, PricingMethod } from '../types';

export function calculateSellingPrice(
  unitCost: number,
  percentage: number,
  method: PricingMethod
): number {
  if (unitCost <= 0) return 0;

  if (method === 'markup') {
    return Math.round(unitCost * (1 + percentage / 100));
  }

  // Margin method
  const safeMargin = Math.min(percentage, 99.9);
  return Math.round(unitCost / (1 - safeMargin / 100));
}

export function calculateCostingTotals(
  items: CostItem[],
  outputQuantity: number,
  method: PricingMethod = 'margin',
  customPercentage: number = 40
): CalculationResult {
  const safeQty = Math.max(1, outputQuantity);

  let vendorCost = 0;
  let shippingCost = 0;
  let packagingCost = 0;
  let materialCost = 0;
  let laborCost = 0;
  let overheadCost = 0;

  items.forEach((item) => {
    const cost = item.quantity * item.unitCost;
    if (item.category === 'vendor') vendorCost += cost;
    else if (item.category === 'shipping') shippingCost += cost;
    else if (item.category === 'packaging') packagingCost += cost;
    else if (item.category === 'material') materialCost += cost;
    else if (item.category === 'labor') laborCost += cost;
    else overheadCost += cost;
  });

  const totalCost = vendorCost + shippingCost + packagingCost + materialCost + laborCost + overheadCost;
  const unitCost = Math.round(totalCost / safeQty);

  const tierConfigs = [
    {
      id: 'lean',
      name: 'Margin Tipis (20%)',
      percentage: 20,
      badgeText: 'Borongan / Rekanan',
      description: 'Cocok untuk pesanan partai besar atau rekanan dekat dengan modal cepat berputar.',
    },
    {
      id: 'standard',
      name: 'Standar Pasar (35%)',
      percentage: 35,
      badgeText: 'Pasar Harian',
      description: 'Harga kompetitif harian untuk konsumen umum dengan profit yang sehat.',
    },
    {
      id: 'optimal',
      name: 'Rekomendasi / Ideal (50%)',
      percentage: 50,
      badgeText: 'Rekomendasi',
      description: 'Margin optimal yang sangat dianjurkan untuk menjamin keuntungan maksimal.',
    },
    {
      id: 'custom',
      name: `Kustom (${customPercentage}%)`,
      percentage: customPercentage,
      badgeText: 'Kustom Anda',
      description: 'Penetapan margin atau markup bebas sesuai kesepakatan khusus.',
    },
  ];

  const tiers: PriceTier[] = tierConfigs.map((cfg) => {
    const unitPrice = calculateSellingPrice(unitCost, cfg.percentage, method);
    const totalPrice = unitPrice * safeQty;
    const unitProfit = unitPrice - unitCost;
    const totalProfit = totalPrice - totalCost;

    return {
      id: cfg.id,
      name: cfg.name,
      percentage: cfg.percentage,
      method,
      unitPrice,
      totalPrice,
      unitProfit,
      totalProfit,
      badgeText: cfg.badgeText,
      description: cfg.description,
    };
  });

  return {
    outputQuantity: safeQty,
    totalCost,
    unitCost,
    vendorCost,
    shippingCost,
    packagingCost,
    materialCost,
    laborCost,
    overheadCost,
    tiers,
  };
}
