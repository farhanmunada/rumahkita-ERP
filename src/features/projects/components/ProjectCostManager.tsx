'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Trash2,
  Building2,
  Tag,
  CheckCircle2,
  DollarSign,
  Package,
  Pencil,
  X,
} from 'lucide-react';
import { ProjectCost } from '@/shared/db/schema';
import { formatRupiah, parseRupiahInput } from '@/shared/lib/currency';
import { VendorItemPickerModal } from './VendorItemPickerModal';
import { CatalogItemWithVendor } from '@/features/vendors/services/vendor.service';

interface ProjectCostManagerProps {
  projectId: number;
  initialCosts?: ProjectCost[];
  businessId?: number;
  onCostChanged: () => void;
}

export function ProjectCostManager({
  projectId,
  initialCosts = [],
  businessId,
  onCostChanged,
}: ProjectCostManagerProps) {
  const [costs, setCosts] = useState<ProjectCost[]>(initialCosts);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    setCosts(initialCosts || []);
  }, [initialCosts]);

  // New cost form state
  const [itemName, setItemName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [category, setCategory] = useState('vendor');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [unitCost, setUnitCost] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit cost modal state
  const [editingCost, setEditingCost] = useState<ProjectCost | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editCategory, setEditCategory] = useState('vendor');
  const [editVendorName, setEditVendorName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editUnitCost, setEditUnitCost] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingCost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editingCost]);

  const handleStartEditCost = (cost: ProjectCost) => {
    setEditingCost(cost);
    setEditItemName(cost.itemName);
    setEditCategory(cost.category);
    setEditVendorName(cost.vendorNameSnapshot || '');
    setEditQuantity(cost.quantity);
    setEditUnit(cost.unit || 'pcs');
    setEditUnitCost(cost.unitCost.toString());
    setEditNotes(cost.notes || '');
  };

  const handleSaveEditCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCost) return;
    setIsSavingEdit(true);
    try {
      const qtyNum = parseFloat(editQuantity) || 1;
      const uCostNum = Math.round(Number(editUnitCost) || 0);
      const tCostNum = Math.round(qtyNum * uCostNum);

      const payload = {
        itemName: editItemName.trim(),
        category: editCategory,
        vendorNameSnapshot: editVendorName.trim() || null,
        quantity: editQuantity.toString(),
        unit: editUnit.trim() || 'pcs',
        unitCost: uCostNum,
        totalCost: tCostNum,
        notes: editNotes.trim() || null,
      };

      const res = await fetch(`/api/projects/${projectId}/costs?costId=${editingCost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui pos biaya');
      }

      const updatedData = await res.json();
      setCosts((prev) => prev.map((c) => (c.id === editingCost.id ? updatedData : c)));
      setEditingCost(null);
      onCostChanged();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // When vendor item is picked
  const handleVendorItemSelect = (item: CatalogItemWithVendor) => {
    setItemName(item.itemName);
    setVendorName(item.vendorNameDisplay);
    setVendorId(item.vendorId || null);
    setCategory(item.category || 'vendor');
    setUnit(item.unit || 'pcs');
    setUnitCost(item.baseCost.toString());
    setNotes(item.notes || '');
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = parseRupiahInput(unitCost);
    const parsedQty = parseFloat(quantity) || 1;

    if (!itemName.trim() || parsedCost <= 0) {
      setError('Nama pengeluaran dan harga satuan harus diisi');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        projectId,
        vendorId,
        vendorNameSnapshot: vendorName.trim() || null,
        itemName: itemName.trim(),
        category,
        quantity: parsedQty.toString(),
        unit: unit.trim() || 'pcs',
        unitCost: parsedCost,
        totalCost: Math.round(parsedCost * parsedQty),
        notes: notes.trim() || null,
      };

      const res = await fetch(`/api/projects/${projectId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menambahkan pos biaya modal');
      }

      if (resData.data) {
        setCosts((prev) => [resData.data, ...prev]);
      }

      // Reset form
      setItemName('');
      setVendorName('');
      setVendorId(null);
      setUnitCost('');
      setQuantity('1');
      setNotes('');

      // Refresh parent
      onCostChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCost = async (costId: number) => {
    if (!confirm('Hapus pos biaya modal proyek ini?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/costs?costId=${costId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCosts((prev) => prev.filter((c) => c.id !== costId));
        onCostChanged();
      } else {
        alert('Gagal menghapus biaya');
      }
    } catch (err) {
      alert('Error saat menghapus biaya modal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Vendor Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Rincian Modal Riil Proyek (HPP Real)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Semua pengeluaran bahan, vendor subkon, ongkir, dan jasa internal. Data ini STRICTLY INTERNAL dan tidak tampil di invoice klien.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          Pilih dari Rekanan Vendor
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Form New Real Cost */}
      <form
        onSubmit={handleAddCost}
        className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Tambah Pos Biaya Modal Baru
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Deskripsi pengeluaran / bahan / jasa *"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Nama Vendor / Toko (opsional)"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vendor">Vendor Jasa</option>
              <option value="material">Bahan Baku</option>
              <option value="labor">Ongkos Kerja</option>
              <option value="shipping">Ongkos Kirim</option>
              <option value="packaging">Kemasan</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <input
              type="number"
              step="any"
              min="0.01"
              placeholder="Qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Biaya Satuan (Rp) *"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <input
            type="text"
            placeholder="Catatan tambahan (nomor resi, bukti bayar, catatan pengerjaan...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full sm:max-w-md px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {isSubmitting ? 'Menyimpan...' : 'Tambah Pos Biaya'}
          </button>
        </div>
      </form>

      {/* Costs Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Rincian Item & Jasa yang Digunakan
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
              {costs.length} Item
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total Modal: <strong className="text-slate-900">{formatRupiah(costs.reduce((sum, c) => sum + (c.totalCost || 0), 0))}</strong>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Deskripsi Pos Biaya</th>
                <th className="py-3 px-4">Vendor / Suplier</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Volume</th>
                <th className="py-3 px-4 text-right">Biaya Satuan</th>
                <th className="py-3 px-4 text-right">Total Biaya Modal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {costs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Belum ada rincian item atau jasa</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tambahkan pos pengeluaran di form atas untuk memantau HPP real proyek.
                    </p>
                  </td>
                </tr>
              ) : (
                costs.map((cost) => {
                  const catBadge = (() => {
                    switch (cost.category) {
                      case 'vendor':
                        return { label: 'Jasa/Vendor', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
                      case 'material':
                        return { label: 'Bahan Baku', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
                      case 'labor':
                        return { label: 'Tenaga Kerja', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                      case 'shipping':
                        return { label: 'Pengiriman', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                      case 'packaging':
                        return { label: 'Kemasan', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                      default:
                        return { label: 'Lainnya', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
                    }
                  })();

                  return (
                    <tr
                      key={cost.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {cost.itemName}
                        </div>
                        {cost.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {cost.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {cost.vendorNameSnapshot ? (
                          <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            {cost.vendorNameSnapshot}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${catBadge.cls}`}>
                          {catBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {cost.quantity} {cost.unit || 'pcs'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatRupiah(cost.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(cost.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditCost(cost)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Pos Biaya"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCost(cost.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Biaya"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Item Picker Modal */}
      <VendorItemPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectItem={handleVendorItemSelect}
        businessId={businessId}
      />

      {/* Edit Cost Item Modal */}
      {editingCost && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Pos Biaya Modal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui harga, kuantitas, atau item pengeluaran</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCost(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Item / Jasa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vendor">Jasa/Vendor</option>
                    <option value="material">Bahan Baku</option>
                    <option value="labor">Tenaga Kerja</option>
                    <option value="shipping">Pengiriman</option>
                    <option value="packaging">Kemasan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor / Suplier
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Vendor"
                    value={editVendorName}
                    onChange={(e) => setEditVendorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Biaya Satuan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Keterangan opsional"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-sans">Kalkulasi Total Biaya:</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah((Math.round(Number(editUnitCost) || 0)) * (parseFloat(editQuantity) || 1))}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCost(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
