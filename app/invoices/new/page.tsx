import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getAllClients } from '@/features/clients/services/client.service';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';
import { Business, Client } from '@/shared/db/schema';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Buat Tagihan Baru | Vola ERP',
  description: 'Formulir pembuatan invoice tagihan baru standar A4 profesional di Vola ERP',
};

export default async function NewInvoicePage() {
  let businesses: Business[] = [];
  let clients: Client[] = [];

  try {
    [businesses, clients] = await Promise.all([
      getAllBusinesses(),
      getAllClients(),
    ]);
  } catch (err) {
    console.error('Failed to load businesses or clients for new invoice:', err);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat formulir faktur...</div>}>
      <InvoiceForm businesses={businesses} initialClients={clients} />
    </Suspense>
  );
}
