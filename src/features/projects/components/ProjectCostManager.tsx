'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Building2,
  Tag,
  CheckCircle2,
  DollarSign,
  Package,
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menambahkan pos biaya modal');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Rincian Modal Riil Proyek (HPP Real)
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Semua pengeluaran bahan, vendor subkon, ongkir, dan jasa internal. Data ini STRICTLY INTERNAL dan tidak tampil di invoice klien.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          Pilih dari Rekanan Vendor
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Form New Real Cost */}
      <form
        onSubmit={handleAddCost}
        className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Tambah Pos Biaya Modal Baru
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Deskripsi pengeluaran / bahan / jasa *"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              required
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Nama Vendor / Toko (opsional)"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
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
              className="w-full px-2 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-center"
              required
            />
          </div>

          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Biaya Satuan (Rp) *"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
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
            className="w-full sm:max-w-md px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {isSubmitting ? 'Menyimpan...' : 'Tambah Pos Biaya'}
          </button>
        </div>
      </form>

      {/* Costs Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Deskripsi Pos Biaya</th>
                <th className="py-3 px-4">Vendor / Suplier</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Volume</th>
                <th className="py-3 px-4 text-right">Biaya Satuan</th>
                <th className="py-3 px-4 text-right">Total Biaya Modal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {costs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 italic">
                    Belum ada pos biaya modal real untuk proyek ini. Tambahkan di atas atau gunakan picker vendor.
                  </td>
                </tr>
              ) : (
                costs.map((cost) => (
                  <tr
                    key={cost.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {cost.itemName}
                      </div>
                      {cost.notes && (
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {cost.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {cost.vendorNameSnapshot ? (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                          <Building2 className="w-3 h-3" />
                          {cost.vendorNameSnapshot}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {cost.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cost.quantity} {cost.unit || 'pcs'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-600 dark:text-neutral-300">
                      {formatRupiah(cost.unitCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 dark:text-white">
                      {formatRupiah(cost.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCost(cost.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Hapus Biaya"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}
