'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Building2,
  MapPin,
  Phone,
  Tag,
  Check,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { CatalogItemWithVendor } from '@/features/vendors/services/vendor.service';
import { VendorRatingStars } from '@/features/vendors/components/VendorRatingStars';
import { formatRupiah } from '@/shared/lib/currency';

interface VendorItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: CatalogItemWithVendor) => void;
  businessId?: number;
}

export function VendorItemPickerModal({
  isOpen,
  onClose,
  onSelectItem,
  businessId,
}: VendorItemPickerModalProps) {
  const [items, setItems] = useState<CatalogItemWithVendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'rating_desc'>('name');
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

  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        try {
          setLoading(true);
          const url = businessId
            ? `/api/vendors?catalog=true&businessId=${businessId}`
            : '/api/vendors?catalog=true';
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setItems(data);
          }
        } catch (err) {
          console.error('Failed to fetch vendor catalog:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchCatalog();
    }
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendorNameDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.vendorAddress &&
          item.vendorAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.baseCost - b.baseCost;
      }
      if (sortBy === 'rating_desc') {
        return b.vendorRating - a.vendorRating;
      }
      return a.itemName.localeCompare(b.itemName);
    });

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Pilih dari Rekanan Vendor Terdaftar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bandingkan harga modal, reputasi rating bintang, dan jarak alamat vendor
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari item, nama vendor, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" /> Urutan:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating_desc">⭐ Rating Tertinggi</option>
              <option value="price_asc">💰 Harga Termurah</option>
              <option value="name_asc">🔤 Nama Item (A-Z)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="vendor">Vendor Jasa</option>
              <option value="material">Bahan Baku</option>
              <option value="shipping">Ekspedisi</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>
        </div>

        {/* Item List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Memuat katalog vendor...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada item vendor yang cocok dengan filter.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {item.itemName}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      {item.vendorNameDisplay}
                    </span>
                    <VendorRatingStars rating={item.vendorRating} size="sm" />
                  </div>

                  {item.vendorAddress && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{item.vendorAddress}</span>
                    </div>
                  )}

                  {item.vendorNotes && (
                    <p className="text-[11px] text-slate-500 italic">
                      &ldquo;{item.vendorNotes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="sm:text-right">
                    <div className="text-base font-bold font-mono text-slate-900">
                      {formatRupiah(item.baseCost)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      per {item.unit || 'pcs'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Pilih Item
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
