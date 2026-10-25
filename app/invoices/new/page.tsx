import React, { Suspense } from 'react';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getAllClients } from '@/features/clients/services/client.service';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';
import { Business, Client } from '@/shared/db/schema';

export const dynamic = 'force-dynamic';

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
