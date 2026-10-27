'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Layers, Check } from 'lucide-react';
import { Vendor, VendorCost } from '@/shared/db/schema';
import { formatRupiah, parseRupiahInput } from '@/shared/lib/currency';

interface VendorCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
}

export function VendorCatalogModal({
  isOpen,
  onClose,
  vendor,
}: VendorCatalogModalProps) {
  const [items, setItems] = useState<VendorCost[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('vendor');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vendor-costs`);
      if (res.ok) {
        const json = await res.json();
        const all: VendorCost[] = json.data || [];
        // Filter items that match this vendorId or vendorName
        const matched = all.filter(
          (i) =>
            i.vendorId === vendor.id ||
            (i.vendorName && i.vendorName.toLowerCase() === vendor.name.toLowerCase())
        );
        setItems(matched);
      }
    } catch (err) {
      console.error('Failed to fetch vendor catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen, vendor.id]);

  if (!isOpen) return null;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseRupiahInput(unitCost);
    if (!itemName.trim() || cost <= 0) {
      setError('Nama item dan harga modal harus valid');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/vendor-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: vendor.businessId || 1,
          vendorId: vendor.id,
          vendorName: vendor.name,
          itemName: itemName.trim(),
          category,
          unit: unit.trim() || 'pcs',
          baseCost: cost,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menambahkan tarif item');
      }

      setItemName('');
      setUnitCost('');
      setNotes('');
      fetchItems();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Hapus item tarif ini?')) return;
    try {
      const res = await fetch(`/api/vendor-costs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Katalog Tarif: {vendor.name}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola daftar produk, jasa, atau material yang disediakan oleh vendor ini
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          {/* Form input item baru */}
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Tambah Tarif / Jasa Vendor
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama item / jasa (cth: Sablon DTF A3)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Harga Modal (Rp)"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Satuan (pcs, lembar, meter)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Catatan spesifikasi (opsional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : 'Tambah ke Katalog'}
              </button>
            </div>
          </form>

          {/* List items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
              Daftar Tarif Tersimpan ({items.length})
            </h4>

            {loading ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Memuat item...</p>
            ) : items.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center italic">
                Belum ada tarif item yang tersimpan untuk vendor ini.
              </p>
            ) : (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                        {item.itemName}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        Kategori: <span className="capitalize">{item.category}</span>
                        {item.notes && <span> • {item.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(item.baseCost)}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          per {item.unit || 'pcs'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
