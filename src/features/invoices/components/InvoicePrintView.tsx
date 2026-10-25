'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { InvoiceWithRelations, InvoiceStatus } from '../types';
import { formatRupiah } from '@/shared/lib/currency';
import { formatTanggalIndo } from '@/shared/lib/date';
import { terbilangRupiah } from '@/shared/lib/terbilang';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Printer, ArrowLeft, Edit3, CheckCircle2, Send, XCircle, ShieldCheck } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: InvoiceWithRelations;
}

export function InvoicePrintView({ invoice: initialInvoice }: InvoicePrintViewProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceWithRelations>(initialInvoice);
  const [updating, setUpdating] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const verifyUrl = `${origin}/invoices/${invoice.id}/print`;
    QRCode.toString(verifyUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error('Failed to generate verification QR code:', err));
  }, [invoice.id]);

  const business = invoice.business;
  const client = invoice.client;

  // Unit business specific accent color
  const getThemeClass = (slug: string) => {
    switch (slug) {
      case 'percetakan':
        return {
          primary: 'text-blue-700',
          bgPrimary: 'bg-blue-700',
          borderPrimary: 'border-blue-700',
          tableHead: 'bg-blue-800 text-white',
          lightBg: 'bg-blue-50/50',
        };
      case 'desain':
        return {
          primary: 'text-purple-700',
          bgPrimary: 'bg-purple-700',
          borderPrimary: 'border-purple-700',
          tableHead: 'bg-purple-800 text-white',
          lightBg: 'bg-purple-50/50',
        };
      case 'web-dev':
        return {
          primary: 'text-cyan-700',
          bgPrimary: 'bg-cyan-700',
          borderPrimary: 'border-cyan-700',
          tableHead: 'bg-cyan-800 text-white',
          lightBg: 'bg-cyan-50/50',
        };
      case 'konveksi':
        return {
          primary: 'text-amber-700',
          bgPrimary: 'bg-amber-700',
          borderPrimary: 'border-amber-700',
          tableHead: 'bg-amber-800 text-white',
          lightBg: 'bg-amber-50/50',
        };
      default:
        return {
          primary: 'text-slate-800',
          bgPrimary: 'bg-slate-800',
          borderPrimary: 'border-slate-800',
          tableHead: 'bg-slate-800 text-white',
          lightBg: 'bg-slate-50',
        };
    }
  };

  const theme = getThemeClass(business.slug);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status');
      setInvoice((prev) => ({ ...prev, status: newStatus }));
      router.refresh();
    } catch {
      alert('Gagal memperbarui status invoice');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="paid">LUNAS / PAID</Badge>;
      case 'PARTIAL':
        return <Badge variant="partial">DP DITERIMA / PARTIAL</Badge>;
      case 'SENT':
        return <Badge variant="sent">TERKIRIM / SENT</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">DIBATALKAN</Badge>;
      default:
        return <Badge variant="draft">DRAFT</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar - Hidden during Print */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status saat ini:</span>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Actions */}
          {invoice.status !== 'PAID' && (
            <Button
              size="sm"
              variant="outline"
              disabled={updating}
              onClick={() => handleStatusChange('PAID')}
              className="text-emerald-700 hover:bg-emerald-50 border-emerald-300 gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{invoice.status === 'PARTIAL' ? 'Konfirmasi Pelunasan' : 'Tandai Lunas'}</span>
            </Button>
          )}

          {invoice.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="outline"
              disabled={updating}
              onClick={() => handleStatusChange('SENT')}
              className="text-blue-700 hover:bg-blue-50 border-blue-300 gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Tandai Terkirim</span>
            </Button>
          )}

          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <Button
              size="sm"
              variant="ghost"
              disabled={updating}
              onClick={() => handleStatusChange('CANCELLED')}
              className="text-rose-600 hover:bg-rose-50 gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Batalkan</span>
            </Button>
          )}

          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit3 className="w-4 h-4" />
              <span>Edit Invoice</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-2 bg-slate-900 text-white hover:bg-black shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </Button>
        </div>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="w-full flex justify-center print:block print:p-0">
        <div
          id="invoice-print-area"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white p-10 md:p-14 shadow-lg border border-slate-200/60 rounded-xl print:rounded-none print:shadow-none print:border-none print:p-0 print:m-0 flex flex-col justify-between"
        >
          {/* Kop Surat & Header */}
          <div>
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
              {/* Info Unit Usaha */}
              <div className="max-w-md space-y-1">
                <div className="flex items-center gap-2.5">
                  {business.slug === 'percetakan' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/logos/rumah-kita-icon.svg"
                      alt="Rumah Kita Percetakan"
                      className="w-8 h-8 object-contain shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center font-black text-white text-xs ${theme.bgPrimary}`}
                    >
                      {business.invoicePrefix}
                    </div>
                  )}
                  <h1 className={`text-2xl font-black tracking-tight ${theme.primary}`}>
                    {business.name}
                  </h1>
                </div>
                {business.tagline && (
                  <p className="text-xs italic font-medium text-slate-600">{business.tagline}</p>
                )}
                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  {business.address && <p>{business.address}</p>}
                  <p>
                    {business.phone && <span>Telp/WA: {business.phone}</span>}
                    {business.phone && business.email && <span className="mx-2">•</span>}
                    {business.email && <span>Email: {business.email}</span>}
                  </p>
                </div>
              </div>

              {/* Tag Judul & Nomor Invoice */}
              <div className="text-right space-y-1">
                <div className="text-3xl font-black tracking-wider text-slate-900 uppercase">
                  INVOICE
                </div>
                <div className="font-mono text-sm font-bold text-slate-700">
                  {invoice.invoiceNumber}
                </div>
                <div className="inline-block mt-1">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            </div>

            {/* Baris Informasi Tagihan & Pelanggan */}
            <div className="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
              {/* Kolom Kiri: Klien */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  DITAGIHKAN KEPADA:
                </span>
                {client.companyName ? (
                  <>
                    <div className="text-base font-bold text-slate-900">{client.companyName}</div>
                    <div className="text-xs font-medium text-slate-700">u.p. / PIC: {client.name}</div>
                  </>
                ) : (
                  <>
                    <div className="text-base font-bold text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Konsumen Langsung</div>
                  </>
                )}
                {client.address && <div className="text-slate-600">{client.address}</div>}
                {(client.phone || client.email) && (
                  <div className="text-slate-600">
                    {client.phone && <span>Telp/WA: {client.phone}</span>}
                    {client.phone && client.email && <span className="mx-1.5">•</span>}
                    {client.email && <span>{client.email}</span>}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Tanggal & Due Date */}
              <div className="flex flex-col justify-end items-end space-y-1.5 text-right">
                <div className="flex justify-between w-48">
                  <span className="text-slate-500">Tanggal Terbit:</span>
                  <span className="font-semibold text-slate-900">
                    {formatTanggalIndo(invoice.issueDate)}
                  </span>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-slate-500">Jatuh Tempo:</span>
                  <span className="font-bold text-rose-600">
                    {formatTanggalIndo(invoice.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-semibold text-slate-800">Transfer Bank</span>
                </div>
              </div>
            </div>

            {/* Tabel Item Rincian Tagihan */}
            <div className="py-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`${theme.tableHead} uppercase tracking-wider`}>
                    <th className="py-2.5 px-3 w-10 text-center font-bold">No</th>
                    <th className="py-2.5 px-3 font-bold">Deskripsi Barang / Jasa</th>
                    <th className="py-2.5 px-3 w-16 text-center font-bold">Qty</th>
                    <th className="py-2.5 px-3 w-20 text-center font-bold">Satuan</th>
                    <th className="py-2.5 px-3 w-32 text-right font-bold">Harga (Rp)</th>
                    <th className="py-2.5 px-3 w-36 text-right font-bold">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, index) => {
                    const rowQty = Number(item.quantity) || 0;
                    const rowPrice = Number(item.unitPrice) || 0;
                    const rowTotal = item.totalPrice || rowQty * rowPrice;

                    return (
                      <tr
                        key={item.id}
                        className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="py-3 px-3 text-center text-slate-500 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900">{item.description}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                          {rowQty}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {item.unit || '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatRupiah(rowPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          {formatRupiah(rowTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Rincian Kalkulasi Finansial Bawah */}
              <div className="mt-4 flex justify-between items-start gap-8">
                {/* Bagian Kiri: Terbilang & Catatan */}
                <div className="flex-1 space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      {(invoice.downPayment || 0) > 0 && invoice.status !== 'PAID'
                        ? 'TERBILANG SISA PELUNASAN:'
                        : 'TERBILANG TOTAL:'}
                    </span>
                    <p className="text-xs font-semibold italic text-slate-800">
                      &ldquo;
                      {terbilangRupiah(
                        (invoice.downPayment || 0) > 0 && invoice.status !== 'PAID'
                          ? Math.max(0, invoice.totalAmount - (invoice.downPayment || 0))
                          : invoice.totalAmount
                      )}
                      &rdquo;
                    </p>
                  </div>

                  {invoice.notes && (
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Catatan: </span>
                      {invoice.notes}
                    </div>
                  )}
                </div>

                {/* Bagian Kanan: Kalkulasi Subtotal, Diskon, Pajak, Grand Total & DP */}
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(invoice.subtotal)}
                    </span>
                  </div>

                  {(invoice.discountValue || 0) > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                      <span>
                        Potongan Diskon {invoice.discountType === 'percent' ? `(${invoice.discountValue}%)` : ''}:
                      </span>
                      <span className="font-mono font-semibold">
                        -{formatRupiah(
                          invoice.discountType === 'percent'
                            ? Math.round(invoice.subtotal * ((invoice.discountValue || 0) / 100))
                            : (invoice.discountValue || 0)
                        )}
                      </span>
                    </div>
                  )}

                  {(invoice.taxPercent || 0) > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">PPN / Pajak ({invoice.taxPercent}%):</span>
                      <span className="font-mono font-semibold text-slate-800">
                        +{formatRupiah(invoice.taxAmount || 0)}
                      </span>
                    </div>
                  )}

                  {(invoice.downPayment || 0) > 0 ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100 font-bold">
                        <span className="text-slate-700">Total Order:</span>
                        <span className="font-mono text-slate-900">
                          {formatRupiah(invoice.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-medium">
                        <span>Uang Muka (DP) Diterima:</span>
                        <span className="font-mono font-bold">
                          -{formatRupiah(invoice.downPayment || 0)}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between items-center py-2 px-3 rounded-lg ${theme.lightBg} border ${theme.borderPrimary}`}
                      >
                        <div>
                          <span className="font-black text-slate-900 uppercase block">
                            Sisa Pelunasan:
                          </span>
                          {invoice.status === 'PAID' ? (
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                              (LUNAS)
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                              (SISA TAGIHAN)
                            </span>
                          )}
                        </div>
                        <span className={`text-base font-black font-mono ${theme.primary}`}>
                          {invoice.status === 'PAID'
                            ? formatRupiah(0)
                            : formatRupiah(Math.max(0, invoice.totalAmount - (invoice.downPayment || 0)))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`flex justify-between items-center py-2 px-3 rounded-lg ${theme.lightBg} border ${theme.borderPrimary}`}
                    >
                      <span className="font-black text-slate-900 uppercase">Grand Total:</span>
                      <span className={`text-base font-black font-mono ${theme.primary}`}>
                        {formatRupiah(invoice.totalAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Bawah: Instruksi Pembayaran Rekening & Tanda Tangan */}
          <div className="pt-6 border-t-2 border-slate-200 mt-6">
            <div className="grid grid-cols-2 gap-8 text-xs">
              {/* Info Transfer & Syarat */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    PEMBAYARAN DITRANSFER KE:
                  </div>
                  <div className="font-medium text-slate-700">
                    Bank: <span className="font-bold text-slate-900">{business.bankName || 'BCA'}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    No. Rek: {business.bankAccountNumber || '-'}
                  </div>
                  <div className="text-slate-600">
                    Atas Nama: <span className="font-semibold text-slate-800">{business.bankAccountHolder || business.name}</span>
                  </div>
                </div>

                {invoice.terms && (
                  <div className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-0.5">Ketentuan Pembayaran:</span>
                    {invoice.terms}
                  </div>
                )}
              </div>

              {/* Otorisasi Digital via QR Code Verifikasi */}
              <div className="flex flex-col items-center justify-center p-4 border border-slate-200/90 rounded-xl bg-slate-50/60 text-center">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verifikasi Digital Sistem</span>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs inline-block">
                  {qrSvg ? (
                    <div
                      className="w-24 h-24 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-slate-400 text-[10px]">
                      Memuat QR...
                    </div>
                  )}
                </div>

                {/* Nomor Invoice & Identitas Bisnis */}
                <div className="mt-2 font-mono font-bold text-[11px] text-slate-900">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {business.name}
                </div>

                {/* Note di Bawah Barcode / QR */}
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500 max-w-[260px]">
                  Dokumen ini diterbitkan secara otomatis dan sah melalui sistem RK-ERP. Pindai kode untuk memverifikasi keaslian dokumen.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
              <span>Dicetak otomatis melalui RK-ERP Invoice System</span>
              <span>Halaman 1 dari 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
