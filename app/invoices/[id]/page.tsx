import React from 'react';
import { notFound } from 'next/navigation';
import { getInvoiceById } from '@/features/invoices/services/invoice.service';
import { InvoicePrintView } from '@/features/invoices/components/InvoicePrintView';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) notFound();

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) notFound();

  return <InvoicePrintView invoice={invoice} />;
}
