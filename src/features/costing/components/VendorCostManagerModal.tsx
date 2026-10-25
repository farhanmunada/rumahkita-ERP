'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { formatRupiah, parseRupiahInput } from '@/shared/lib/currency';
import { type VendorCost } from '@/shared/db/schema';

interface BusinessOption {
  id: number;
  name: string;
  slug: string;
}

interface VendorCostManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessOption[];
  activeBusinessId: number;
  vendorCosts: VendorCost[];
  onRefresh: () => Promise<void>;
}

export function VendorCostManagerModal({
  isOpen,
  onClose,
  businesses,
  activeBusinessId,
  vendorCosts,
  onRefresh,
}: VendorCostManagerModalProps) {
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [businessId, setBusinessId] = useState<number>(activeBusinessId);
  const [itemName, setItemName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('vendor');
  const [unit, setUnit] = useState('pcs');
  const [baseCostStr, setBaseCostStr] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setItemName('');
    setVendorName('');
    setCategory('vendor');
    setUnit('pcs');
    setBaseCostStr('');
    setNotes('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleStartEdit = (item: VendorCost) => {
    setEditingId(item.id);
    setBusinessId(item.businessId);
    setItemName(item.itemName);
    setVendorName(item.vendorName || '');
    setCategory(item.category || 'vendor');
    setUnit(item.unit || 'pcs');
    setBaseCostStr(formatRupiah(item.baseCost));
    setNotes(item.notes || '');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const costNum = parseRupiahInput(baseCostStr);
    if (!itemName.trim()) {
      setErrorMessage('Nama item / pekerjaan wajib diisi');
      return;
    }
    if (costNum <= 0) {
      setErrorMessage('Harga modal dasar wajib lebih dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/vendor-costs/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            itemName: itemName.trim(),
            vendorName: vendorName.trim() || null,
            category,
            unit: unit.trim() || 'pcs',
            baseCost: costNum,
            notes: notes.trim() || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Gagal memperbarui data vendor');
        }

        setSuccessMessage('Data tarif vendor berhasil diperbarui!');
        resetForm();
      } else {
        const res = await fetch('/api/vendor-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            itemName: itemName.trim(),
            vendorName: vendorName.trim() || null,
            category,
            unit: unit.trim() || 'pcs',
            baseCost: costNum,
            notes: notes.trim() || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Gagal menyimpan ke database');
        }

        setSuccessMessage('Tarif HPP berhasil ditambahkan ke database!');
        resetForm();
      }

      await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tarif HPP ini dari database?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/vendor-costs/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus');
      }
      if (editingId === id) {
        resetForm();
      }
      await onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kelola Master HPP Vendor
              </h2>
              <p className="text-xs text-slate-500">
                Simpan daftar tarif riil vendor subkontrak/maklon ke database untuk digunakan di kalkulator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Form & Table */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Add / Edit */}
          <div className="lg:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {editingId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-600" />
                    <span>Edit Tarif Vendor</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Tambah Tarif Baru</span>
                  </>
                )}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Batal Edit</span>
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Bisnis
                </label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(parseInt(e.target.value, 10))}
                  className="w-full text-xs h-8 rounded-lg border border-slate-200 bg-white px-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Item / Pekerjaan *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Brosur A4 150gr 1000 lembar"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Vendor Rekanan
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: CV Makmur Jaya"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs h-8 rounded-lg border border-slate-200 bg-white px-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="vendor">Tagihan Vendor</option>
                    <option value="shipping">Ongkir Vendor</option>
                    <option value="packaging">Kemasan & Dus</option>
                    <option value="labor">Jasa / Man-Days</option>
                    <option value="material">Bahan Baku</option>
                    <option value="overhead">Operasional</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan
                  </label>
                  <Input
                    type="text"
                    placeholder="pcs / rim / paket"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HPP Satuan (Rp) *
                  </label>
                  <Input
                    type="text"
                    placeholder="Rp 0"
                    value={baseCostStr ? formatRupiah(parseRupiahInput(baseCostStr)) : ''}
                    onChange={(e) => setBaseCostStr(e.target.value)}
                    className="text-xs h-8 font-mono text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Syarat Vendor
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Min order 500 pcs, estimasi 3 hari"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="pt-1 flex gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="w-1/3 text-xs h-8"
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className={`text-xs h-8 gap-1.5 ${editingId ? 'w-2/3 bg-amber-600 hover:bg-amber-700 text-white' : 'w-full'}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{editingId ? 'Memperbarui...' : 'Menyimpan...'}</span>
                    </>
                  ) : editingId ? (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan ke Database</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Table: Database List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar HPP Tersimpan ({vendorCosts.length})
              </h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3">Item & Vendor</th>
                    <th className="py-2 px-2 text-right">HPP</th>
                    <th className="py-2 px-2 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorCosts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400">
                        Belum ada item HPP tersimpan di database.
                      </td>
                    </tr>
                  ) : (
                    vendorCosts.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          editingId === item.id ? 'bg-amber-50/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">
                            {item.itemName}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            {item.vendorName && (
                              <span className="text-blue-600 font-medium">
                                {item.vendorName}
                              </span>
                            )}
                            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                              {item.category}
                            </span>
                            {item.notes && (
                              <span className="text-slate-400 truncate max-w-[150px]">
                                · {item.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className="font-mono font-bold text-slate-800 block">
                            {formatRupiah(item.baseCost)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            /{item.unit || 'pcs'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="text-slate-400 hover:text-amber-600 p-1.5 rounded hover:bg-amber-50 transition-colors"
                              title="Edit tarif vendor"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                              title="Hapus dari database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
