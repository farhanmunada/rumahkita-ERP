import React from 'react';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getVendorCosts } from '@/features/costing/services/vendor-cost.service';
import { CostCalculator } from '@/features/costing/components/CostCalculator';

export const metadata = {
  title: 'Kalkulator HPP & Estimasi Harga Jual | Vola ERP',
  description: 'Hitung modal awal produksi dan simulasikan perbandingan margin harga jual ke konsumen.',
};

export const dynamic = 'force-dynamic';

export default async function CalculatorPage() {
  const [businesses, vendorCosts] = await Promise.all([
    getAllBusinesses(),
    getVendorCosts(),
  ]);

  return (
    <div className="space-y-6">
      <CostCalculator
        businesses={businesses.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          invoicePrefix: b.invoicePrefix,
        }))}
        initialVendorCosts={vendorCosts}
      />
    </div>
  );
}
