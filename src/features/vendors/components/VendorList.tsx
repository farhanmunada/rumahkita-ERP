'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Tag,
  FileText,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Vendor } from '@/shared/db/schema';
import { VendorRatingStars } from './VendorRatingStars';
import { VendorModal } from './VendorModal';
import { VendorCatalogModal } from './VendorCatalogModal';

interface VendorListProps {
  initialVendors?: Vendor[];
  businessId?: number;
}

export function VendorList({ initialVendors = [], businessId }: VendorListProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [selectedVendorForCatalog, setSelectedVendorForCatalog] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialVendors.length === 0) {
      fetchVendors();
    }
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus rekanan vendor "${name}"?`)) return;

    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVendors();
      } else {
        alert('Gagal menghapus vendor');
      }
    } catch (err) {
      alert('Error saat menghapus vendor');
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.address && v.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.qualityNotes && v.qualityNotes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating =
      ratingFilter === 'all' || v.rating === ratingFilter;

    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;

    return matchesSearch && matchesRating && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari vendor, alamat, atau spesialisasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
            <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
            <option value="3">⭐⭐⭐ (3 Bintang)</option>
            <option value="2">⭐⭐ (2 Bintang)</option>
            <option value="1">⭐ (1 Bintang)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
          >
            <option value="all">Semua Kategori</option>
            <option value="general">Umum</option>
            <option value="konveksi">Konveksi</option>
            <option value="sablon">Sablon</option>
            <option value="material">Bahan Baku</option>
            <option value="percetakan">Percetakan</option>
            <option value="packaging">Packaging</option>
            <option value="ekspedisi">Ekspedisi</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setVendorToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Vendor
          </button>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-8 shadow-xs">
          <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            {searchTerm || ratingFilter !== 'all' || selectedCategory !== 'all'
              ? 'Tidak ada rekanan vendor yang sesuai filter'
              : 'Belum ada rekanan vendor terdaftar'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Daftarkan vendor bahan baku, percetakan, konveksi, atau jasa pihak ketiga untuk membandingkan harga dan kualitas.
          </p>
          <button
            onClick={() => {
              setVendorToEdit(null);
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Daftarkan Vendor Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {vendor.name}
                    </h3>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {vendor.category || 'General'}
                    </span>
                  </div>
                  <div className="bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <VendorRatingStars rating={vendor.rating} size="sm" />
                  </div>
                </div>

                {/* Info section */}
                <div className="space-y-2 mt-3 text-xs text-slate-600">
                  {vendor.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{vendor.address}</span>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}

                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.email}</span>
                    </div>
                  )}

                  {vendor.qualityNotes && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 mb-0.5">
                        <FileText className="w-3 h-3 text-blue-600" />
                        Catatan Kualitas:
                      </div>
                      <p className="italic">&ldquo;{vendor.qualityNotes}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendorForCatalog(vendor);
                    setIsCatalogModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Katalog Item
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setVendorToEdit(vendor);
                      setIsModalOpen(true);
                    }}
                    title="Edit Vendor"
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vendor.id, vendor.name)}
                    title="Hapus Vendor"
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Form Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchVendors}
        vendorToEdit={vendorToEdit}
        businessId={businessId}
      />

      {/* Catalog Manager Modal */}
      {selectedVendorForCatalog && (
        <VendorCatalogModal
          isOpen={isCatalogModalOpen}
          onClose={() => {
            setIsCatalogModalOpen(false);
            setSelectedVendorForCatalog(null);
          }}
          vendor={selectedVendorForCatalog}
        />
      )}
    </div>
  );
}
