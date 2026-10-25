import React from 'react';
import { notFound } from 'next/navigation';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getAllClients } from '@/features/clients/services/client.service';
import { getInvoiceById } from '@/features/invoices/services/invoice.service';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) notFound();

  const [invoice, businesses, clients] = await Promise.all([
    getInvoiceById(invoiceId),
    getAllBusinesses(),
    getAllClients(),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceForm
      businesses={businesses}
      initialClients={clients}
      initialData={invoice}
    />
  );
}
