'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Business } from '@/shared/db/schema';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatRupiah } from '@/shared/lib/currency';
import { formatTanggalIndo } from '@/shared/lib/date';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  User,
  Filter,
} from 'lucide-react';

interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  businessId: number;
  business: {
    id: number;
    name: string;
    slug: string;
    invoicePrefix: string;
  };
  client: {
    id: number;
    name: string;
    companyName: string | null;
  };
}

interface InvoiceListProps {
  initialInvoices: InvoiceListItem[];
  businesses: Business[];
}

export function InvoiceList({ initialInvoices, businesses }: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initialInvoices);
  const [search, setSearch] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<number | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    // Filter business
    if (selectedBusiness !== 'ALL' && inv.businessId !== selectedBusiness) {
      return false;
    }
    // Filter status
    if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) {
      return false;
    }
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchClient = inv.client.name.toLowerCase().includes(q);
      const matchCompany = inv.client.companyName?.toLowerCase().includes(q) || false;
      return matchNum || matchClient || matchCompany;
    }
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus invoice ini? Data item terkait juga akan dihapus.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal menghapus invoice');
        return;
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      router.refresh();
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="paid">Lunas</Badge>;
      case 'SENT':
        return <Badge variant="sent">Terkirim</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">Batal</Badge>;
      default:
        return <Badge variant="draft">Draft</Badge>;
    }
  };

  const getBusinessColor = (slug: string) => {
    switch (slug) {
      case 'percetakan':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'desain':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'web-dev':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'konveksi':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no invoice, nama klien, atau PT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Business Select */}
          <select
            value={selectedBusiness}
            onChange={(e) =>
              setSelectedBusiness(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">Semua Unit Usaha</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Terkirim</option>
            <option value="PAID">Lunas</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        <Link href="/invoices/new">
          <Button className="gap-2 w-full md:w-auto">
            <Plus className="w-4 h-4" />
            <span>Buat Invoice Baru</span>
          </Button>
        </Link>
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-5 py-3">No. Invoice & Tanggal</th>
                <th className="px-5 py-3">Unit Usaha</th>
                <th className="px-5 py-3">Klien</th>
                <th className="px-5 py-3 text-right">Total Tagihan</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Tidak ada data invoice ditemukan</p>
                    <p className="text-xs">
                      Silakan sesuaikan filter atau buat invoice pertama Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Terbit: {formatTanggalIndo(inv.issueDate)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getBusinessColor(
                          inv.business.slug
                        )}`}
                      >
                        {inv.business.name}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{inv.client.name}</div>
                      {inv.client.companyName && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{inv.client.companyName}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-slate-900 font-mono">
                        {formatRupiah(inv.totalAmount)}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Jatuh Tempo: {formatTanggalIndo(inv.dueDate)}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/invoices/${inv.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === inv.id}
                          onClick={() => handleDelete(inv.id)}
                          className="text-slate-600 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
