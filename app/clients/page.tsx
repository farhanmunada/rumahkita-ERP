import React from 'react';
import type { Metadata } from 'next';
import { getAllClients } from '@/features/clients/services/client.service';
import { ClientList } from '@/features/clients/components/ClientList';
import { Client } from '@/shared/db/schema';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manajemen Data Klien | Vola ERP',
  description: 'Kelola direktori kontak klien, email, nomor WhatsApp, dan riwayat tagihan',
};

export default async function ClientsPage() {
  let clients: Client[] = [];
  try {
    clients = await getAllClients();
  } catch (error) {
    console.error('Failed to load clients:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Direktori Pelanggan</h1>
          <p className="text-sm text-slate-500">
            Kelola data kontak dan perusahaan klien untuk pembuatan invoice cepat
          </p>
        </div>
      </div>

      <ClientList initialClients={clients} />
    </div>
  );
}
