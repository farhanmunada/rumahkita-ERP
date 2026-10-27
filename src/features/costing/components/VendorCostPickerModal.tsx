'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, X, Store, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { formatRupiah } from '@/shared/lib/currency';
import { type VendorCost } from '@/shared/db/schema';
import { CostItem } from '../types';

interface VendorCostPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorCosts: VendorCost[];
  activeBusinessId: number;
  onSelectItem: (item: VendorCost) => void;
  onOpenManager: () => void;
}

export function VendorCostPickerModal({
  isOpen,
  onClose,
  vendorCosts,
  activeBusinessId,
  onSelectItem,
  onOpenManager,
}: VendorCostPickerModalProps) {
  const [search, setSearch] = useState('');
  const [filterBusiness, setFilterBusiness] = useState<number | 'all'>(activeBusinessId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    return vendorCosts.filter((item) => {
      const matchBusiness =
        filterBusiness === 'all' || item.businessId === filterBusiness;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        item.itemName.toLowerCase().includes(q) ||
        (item.vendorName && item.vendorName.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);
      return matchBusiness && matchSearch;
    });
  }, [vendorCosts, filterBusiness, search]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pilih dari Master HPP Vendor
              </h2>
              <p className="text-xs text-slate-500">
                Pilih tarif vendor yang tersimpan di database untuk dimasukkan ke kalkulator.
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

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari item, nama vendor, atau jenis pengerjaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterBusiness}
              onChange={(e) =>
                setFilterBusiness(
                  e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10)
                )
              }
              className="text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value={activeBusinessId}>Unit Bisnis Saat Ini</option>
              <option value="all">Semua Unit Bisnis</option>
            </select>
          </div>
        </div>

        {/* Item List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Belum ada data HPP vendor yang cocok.
              </p>
              <p className="text-[11px] text-slate-400">
                Anda dapat menambahkan master tarif vendor baru ke database sekarang.
              </p>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => {
                  onClose();
                  onOpenManager();
                }}
                className="text-xs h-8 gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Master HPP Baru</span>
              </Button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.itemName}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    {item.vendorName && (
                      <span className="font-medium text-blue-600">
                        Vendor: {item.vendorName}
                      </span>
                    )}
                    {item.notes && <span>• {item.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-slate-900 block">
                      {formatRupiah(item.baseCost)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      per {item.unit || 'pcs'}
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="text-xs h-7 gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pilih</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredItems.length} tarif tersedia di database</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManager();
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Kelola & Tambah Master HPP →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
