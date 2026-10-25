import React from 'react';
import { getAllInvoices } from '@/features/invoices/services/invoice.service';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { InvoiceList } from '@/features/invoices/components/InvoiceList';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  let invoices: any[] = [];
  let businesses: any[] = [];

  try {
    [invoices, businesses] = await Promise.all([
      getAllInvoices(),
      getAllBusinesses(),
    ]);
  } catch (error) {
    console.error('Failed to load invoices list:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daftar Tagihan & Invoice</h1>
          <p className="text-sm text-slate-500">
            Kelola seluruh tagihan invoice 4 unit bisnis dengan filter status dan preview cetak A4
          </p>
        </div>
      </div>

      <InvoiceList initialInvoices={invoices} businesses={businesses} />
    </div>
  );
}
