'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Business, Client } from '@/shared/db/schema';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { ClientModal } from '@/features/clients/components/ClientModal';
import { formatRupiah } from '@/shared/lib/currency';
import { getTodayDateString, getDefaultDueDateString } from '@/shared/lib/date';
import { calculateInvoiceTotals } from '../services/invoice.service';
import { Plus, Trash2, UserPlus, Save, Printer, ArrowLeft } from 'lucide-react';

interface InvoiceFormItem {
  id?: number;
  itemType: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface InvoiceFormProps {
  businesses: Business[];
  initialClients: Client[];
  initialData?: any; // For edit mode
}

export function InvoiceForm({ businesses, initialClients, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const defaultBusiness = businesses[0];

  const [businessId, setBusinessId] = useState<number>(
    initialData?.businessId || defaultBusiness?.id || 1
  );
  const [clientId, setClientId] = useState<number>(
    initialData?.clientId || (initialClients[0]?.id ? initialClients[0].id : 0)
  );
  const [issueDate, setIssueDate] = useState<string>(
    initialData?.issueDate || getTodayDateString()
  );
  const [dueDate, setDueDate] = useState<string>(
    initialData?.dueDate || getDefaultDueDateString(14)
  );
  const [taxPercent, setTaxPercent] = useState<number>(
    initialData?.taxPercent ?? 0
  );
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>(
    initialData?.discountType || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialData?.discountValue || 0
  );
  const [notes, setNotes] = useState<string>(
    initialData?.notes || 'Terima kasih atas kepercayaan dan kerja samanya.'
  );

  const selectedBusiness = businesses.find((b) => b.id === businessId);
  const selectedClient = clients.find((c) => c.id === clientId);

  const [terms, setTerms] = useState<string>(
    initialData?.terms || selectedBusiness?.defaultTerms || ''
  );

  const [items, setItems] = useState<InvoiceFormItem[]>(
    initialData?.items?.map((it: any) => ({
      id: it.id,
      itemType: it.itemType || 'service',
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unit: it.unit || '',
      unitPrice: it.unitPrice || 0,
    })) || [
      { itemType: 'service', description: '', quantity: 1, unit: '', unitPrice: 0 },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business change handler - update terms if empty or default
  const handleBusinessChange = (newBusId: number) => {
    setBusinessId(newBusId);
    const bus = businesses.find((b) => b.id === newBusId);
    if (bus?.defaultTerms && (!terms || terms === selectedBusiness?.defaultTerms)) {
      setTerms(bus.defaultTerms);
    }
  };

  // Add Item Row
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemType: 'service', description: '', quantity: 1, unit: '', unitPrice: 0 },
    ]);
  };

  // Remove Item Row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Item field
  const handleItemChange = (index: number, field: keyof InvoiceFormItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Quick Client Added Handler
  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    setClientId(newClient.id);
  };

  // Calculate live totals
  const totals = calculateInvoiceTotals(items, taxPercent, discountType, discountValue);

  const handleSubmit = async (redirectPreview: boolean = true) => {
    if (!businessId) {
      setError('Silakan pilih unit bisnis');
      return;
    }
    if (!clientId) {
      setError('Silakan pilih klien penerima invoice');
      return;
    }
    if (items.some((it) => !it.description.trim())) {
      setError('Semua baris barang/jasa wajib memiliki deskripsi');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      businessId,
      clientId,
      issueDate,
      dueDate,
      taxPercent,
      discountType,
      discountValue,
      notes,
      terms,
      items: items.map((it) => ({
        itemType: it.itemType || 'service',
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unit: it.unit || '',
        unitPrice: Number(it.unitPrice) || 0,
      })),
    };

    try {
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan invoice');
      }

      const savedInvoice = await res.json();

      if (redirectPreview) {
        router.push(`/invoices/${savedInvoice.id}`);
      } else {
        router.push('/invoices');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h1 className="text-xl font-bold text-slate-900">
            {initialData ? `Edit Invoice #${initialData.invoiceNumber}` : 'Buat Invoice Baru'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan</span>
          </Button>
          <Button
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            <span>{saving ? 'Memproses...' : 'Simpan & Preview Cetak'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Header Details */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-slate-900">Informasi Penerbit & Pelanggan</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Unit Bisnis Penerbit"
                  value={businessId}
                  onChange={(e) => handleBusinessChange(Number(e.target.value))}
                  options={
                    businesses.length > 0
                      ? businesses.map((b) => ({
                          value: b.id,
                          label: `${b.name} (${b.invoicePrefix})`,
                        }))
                      : [{ value: 0, label: 'Data unit bisnis kosong' }]
                  }
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Klien / Pelanggan *</label>
                    <button
                      type="button"
                      onClick={() => setClientModalOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Klien Baru</span>
                    </button>
                  </div>
                  {clients.length === 0 ? (
                    <div className="text-xs text-rose-500 py-2">
                      Belum ada klien. Klik &quot;Klien Baru&quot; di atas.
                    </div>
                  ) : (
                    <>
                      <select
                        value={clientId}
                        onChange={(e) => setClientId(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {clients.map((c) => {
                          const isB2B = Boolean(c.companyName && c.companyName.trim() !== '');
                          return (
                            <option key={c.id} value={c.id}>
                              {isB2B
                                ? `${c.companyName} [B2B - PIC: ${c.name}]`
                                : `${c.name} [Konsumen Langsung${c.phone ? ' - ' + c.phone : ''}]`}
                            </option>
                          );
                        })}
                      </select>

                      {selectedClient && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span
                              className={
                                selectedClient.companyName
                                  ? 'text-blue-700 font-bold'
                                  : 'text-emerald-700 font-bold'
                              }
                            >
                              {selectedClient.companyName
                                ? `[B2B] ${selectedClient.companyName}`
                                : `[Konsumen] ${selectedClient.name}`}
                            </span>
                            {selectedClient.companyName && (
                              <span className="text-slate-500 font-normal">
                                • PIC: {selectedClient.name}
                              </span>
                            )}
                          </div>
                          {selectedClient.phone && (
                            <div className="text-slate-600">
                              WhatsApp / HP: <span className="font-medium text-slate-800">{selectedClient.phone}</span>
                            </div>
                          )}
                          {selectedClient.address && (
                            <div className="text-slate-500 line-clamp-1">
                              Alamat: {selectedClient.address}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Input
                  type="date"
                  label="Tanggal Invoice"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  label="Jatuh Tempo Pembayaran"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </CardBody>
          </Card>

          {/* Card: Item Rows Builder */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Rincian Barang & Jasa</h2>
              <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3 min-w-[200px]">Deskripsi</th>
                      <th className="px-3 py-3 w-20">Qty</th>
                      <th className="px-3 py-3 w-24">Satuan</th>
                      <th className="px-4 py-3 min-w-[140px]">Harga Satuan (Rp)</th>
                      <th className="px-4 py-3 min-w-[120px] text-right">Subtotal</th>
                      <th className="px-3 py-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              placeholder="Deskripsi layanan atau barang..."
                              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              placeholder="pcs/rim"
                              className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(idx, 'unitPrice', parseInt(e.target.value, 10) || 0)
                              }
                              className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                          </td>
                          <td className="p-3 text-right font-medium text-slate-800 font-mono text-sm">
                            {formatRupiah(rowTotal)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={items.length <= 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-start">
                <Button size="sm" variant="secondary" onClick={handleAddItem} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Item</span>
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Card: Notes & Terms */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold text-slate-900">Catatan & Ketentuan Pembayaran</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan untuk Klien (Notes)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan di bagian bawah invoice..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Syarat & Ketentuan Pembayaran (Terms & Conditions)
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Aturan DP, transfer bank, dan garansi..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Financial Calculations & Summary */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <h2 className="text-sm font-bold text-slate-900">Ringkasan Tagihan</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Subtotal Item:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatRupiah(totals.subtotal)}
                </span>
              </div>

              {/* Diskon */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Diskon / Potongan</label>
                  <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-2 py-0.5 font-medium ${discountType === 'fixed' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                    >
                      Nominal
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-2 py-0.5 font-medium ${discountType === 'percent' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'}`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === 'percent' ? 'Persen (%)' : 'Rp 0'}
                />
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600">
                    <span>Potongan diskon:</span>
                    <span>-{formatRupiah(totals.discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Pajak / PPN */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Pajak / PPN</label>
                  <div className="flex gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setTaxPercent(0)}
                      className={`px-2 py-0.5 rounded border ${taxPercent === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxPercent(11)}
                      className={`px-2 py-0.5 rounded border ${taxPercent === 11 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}
                    >
                      11%
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  placeholder="Persentase pajak (%)"
                />
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Nilai Pajak ({taxPercent}%):</span>
                    <span>+{formatRupiah(totals.taxAmount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t-2 border-slate-200 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Tagihan (Grand Total)
                </div>
                <div className="text-2xl font-black text-blue-700 font-mono">
                  {formatRupiah(totals.totalAmount)}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSuccess={handleClientAdded}
      />
    </div>
  );
}
