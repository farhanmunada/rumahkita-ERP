import React from 'react';
import Link from 'next/link';
import { getDashboardStats, getAllInvoices } from '@/features/invoices/services/invoice.service';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getAllClients } from '@/features/clients/services/client.service';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatRupiah } from '@/shared/lib/currency';
import { formatTanggalIndo } from '@/shared/lib/date';
import {
  FileText,
  DollarSign,
  Clock,
  Users,
  Plus,
  ArrowRight,
  Building2,
  Printer,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let stats = {
    totalInvoices: 0,
    draftCount: 0,
    sentCount: 0,
    paidCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
  };
  let recentInvoices: any[] = [];
  let businesses: any[] = [];
  let clientCount = 0;

  try {
    const [statsData, allInvoices, allBusinesses, allClients] = await Promise.all([
      getDashboardStats(),
      getAllInvoices(),
      getAllBusinesses(),
      getAllClients(),
    ]);
    stats = statsData;
    recentInvoices = allInvoices.slice(0, 5);
    businesses = allBusinesses;
    clientCount = allClients.length;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }

  const statCards = [
    {
      label: 'Total Tagihan Lunas',
      value: formatRupiah(stats.totalRevenue),
      subtext: `${stats.paidCount} lunas${(stats as any).partialCount ? `, ${(stats as any).partialCount} DP` : ''}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Menunggu Pembayaran',
      value: formatRupiah(stats.pendingRevenue),
      subtext: `${stats.sentCount + stats.draftCount + ((stats as any).partialCount || 0)} tagihan / sisa DP`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Seluruh Invoice',
      value: stats.totalInvoices.toString(),
      subtext: `${stats.sentCount} terkirim, ${stats.draftCount} draft`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Klien Terdaftar',
      value: clientCount.toString(),
      subtext: 'Direktori pelanggan aktif',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="paid">Lunas</Badge>;
      case 'PARTIAL':
        return <Badge variant="partial">DP Diterima</Badge>;
      case 'SENT':
        return <Badge variant="sent">Terkirim</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">Batal</Badge>;
      default:
        return <Badge variant="draft">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner Selamat Datang & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">RK-ERP Invoice Hub</h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Sistem penerbitan tagihan profesional standar A4 untuk 4 lini usaha: Percetakan, Desain Grafis, Web Development, dan Konveksi.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/invoices/new">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Buat Tagihan Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid 4 Kartu Metrik Finansial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i}>
              <CardBody className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900 font-mono">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Grid 4 Unit Lini Bisnis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">4 Pilar Unit Usaha</h2>
          </div>
          <Link
            href="/settings/businesses"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Atur Kop & Rekening Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {b.invoicePrefix}
                </span>
                <span className="text-[11px] text-slate-400">Unit #{b.id}</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900">{b.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{b.tagline || '-'}</p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                <div>Bank: <span className="font-medium text-slate-800">{b.bankName || 'BCA'}</span></div>
                <div className="font-mono">{b.bankAccountNumber || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat Invoice Terbaru */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Tagihan Terakhir Diterbitkan</h2>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Lihat Semua Invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                <tr>
                  <th className="px-5 py-3">No. Invoice</th>
                  <th className="px-5 py-3">Unit Usaha</th>
                  <th className="px-5 py-3">Klien</th>
                  <th className="px-5 py-3">Tanggal Terbit</th>
                  <th className="px-5 py-3 text-right">Total (Rp)</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                      Belum ada invoice yang dibuat. Klik tombol &quot;Buat Tagihan Baru&quot; di atas.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold font-mono text-blue-600">
                        <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                        {inv.business.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {inv.client.companyName || inv.client.name}
                        </div>
                        {inv.client.companyName ? (
                          <div className="text-[11px] text-slate-400">PIC: {inv.client.name}</div>
                        ) : (
                          <div className="text-[11px] text-emerald-600 font-medium">Konsumen</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {formatTanggalIndo(inv.issueDate)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold font-mono text-slate-900">
                        {formatRupiah(inv.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 py-1 text-xs">
                            <Printer className="w-3.5 h-3.5" />
                            <span>Lihat / Cetak</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
