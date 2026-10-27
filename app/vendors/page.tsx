import React from 'react';
import type { Metadata } from 'next';
import { getVendors } from '@/features/vendors/services/vendor.service';
import { VendorList } from '@/features/vendors/components/VendorList';
import { Vendor } from '@/shared/db/schema';
import { Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Direktori Rekanan Vendor | Vola ERP',
  description: 'Kelola katalog rekanan vendor, alamat lokasi, rating reputasi, dan daftar tarif jasa',
};

export default async function VendorsPage() {
  let vendors: Vendor[] = [];
  try {
    vendors = await getVendors();
  } catch (error) {
    console.error('Failed to load vendors:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Direktori Rekanan & Vendor
          </h1>
          <p className="text-sm text-slate-500">
            Pusat database vendor subkon, bahan baku, alamat lokasi, rating bintang, dan katalog tarif
          </p>
        </div>
      </div>

      <VendorList initialVendors={vendors} />
    </div>
  );
}
