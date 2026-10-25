import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInvoiceById } from '@/features/invoices/services/invoice.service';
import { InvoicePrintView } from '@/features/invoices/components/InvoicePrintView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) {
    return { title: 'Invoice Tidak Ditemukan | Vola ERP' };
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return { title: 'Invoice Tidak Ditemukan | Vola ERP' };
  }

  const clientName = invoice.client?.name || 'Klien';
  const businessName = invoice.business?.name || 'Vola ERP';

  return {
    title: `Faktur #${invoice.invoiceNumber} - ${clientName} | Vola ERP`,
    description: `Faktur tagihan resmi nomor ${invoice.invoiceNumber} untuk ${clientName} dari ${businessName}`,
  };
}

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
