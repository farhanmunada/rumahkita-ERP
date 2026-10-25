import React from 'react';
import type { Metadata } from 'next';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { BusinessSettingsForm } from '@/features/businesses/components/BusinessSettingsForm';
import { Business } from '@/shared/db/schema';
import { Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pengaturan Unit Bisnis | Vola ERP',
  description: 'Konfigurasi profil usaha, rekening bank, alamat kop surat, dan syarat ketentuan tagihan',
};

export default async function BusinessSettingsPage() {
  let businesses: Business[] = [];
  try {
    businesses = await getAllBusinesses();
  } catch (error) {
    console.error('Failed to load businesses:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Profil Unit Bisnis</h1>
          <p className="text-sm text-slate-500">
            Kelola identitas, nomor rekening transfer, prefix invoice, dan syarat pembayaran untuk 4 lini usaha
          </p>
        </div>
      </div>

      <BusinessSettingsForm initialBusinesses={businesses} />
    </div>
  );
}
