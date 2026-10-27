'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Award, FileText } from 'lucide-react';
import { Vendor } from '@/shared/db/schema';
import { VendorRatingStars } from './VendorRatingStars';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  vendorToEdit?: Vendor | null;
  businessId?: number;
}

export function VendorModal({
  isOpen,
  onClose,
  onSaved,
  vendorToEdit,
  businessId,
}: VendorModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [qualityNotes, setQualityNotes] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendorToEdit) {
      setName(vendorToEdit.name);
      setAddress(vendorToEdit.address || '');
      setPhone(vendorToEdit.phone || '');
      setEmail(vendorToEdit.email || '');
      setRating(vendorToEdit.rating || 5);
      setQualityNotes(vendorToEdit.qualityNotes || '');
      setCategory(vendorToEdit.category || 'general');
    } else {
      setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      setRating(5);
      setQualityNotes('');
      setCategory('general');
    }
    setError(null);
  }, [vendorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama vendor wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        rating,
        qualityNotes: qualityNotes.trim() || null,
        category,
        businessId: businessId || vendorToEdit?.businessId || null,
      };

      const url = vendorToEdit
        ? `/api/vendors/${vendorToEdit.id}`
        : '/api/vendors';
      const method = vendorToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan vendor');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {vendorToEdit ? 'Edit Data Rekanan Vendor' : 'Tambah Vendor Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Nama Rekanan / Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: CV Sablon Kilat"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Rating Kualitas (1 - 5)
              </label>
              <div className="py-2 px-3 border border-slate-300 rounded-lg bg-white">
                <VendorRatingStars
                  rating={rating}
                  interactive={true}
                  onChange={setRating}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Kategori Spesialisasi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="general">Umum / Lainnya</option>
                <option value="konveksi">Konveksi / Jahit</option>
                <option value="sablon">Sablon / Cetak Kain</option>
                <option value="material">Bahan Baku / Kain</option>
                <option value="percetakan">Percetakan / Offset</option>
                <option value="packaging">Kemasan / Packaging</option>
                <option value="ekspedisi">Ekspedisi / Logistik</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Alamat Lengkap / Lokasi
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Percetakan Negara No. 12, Senen, Jakarta Pusat"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-XXXX-XXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@mail.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Catatan Reputasi & Kualitas (Internal)
            </label>
            <textarea
              rows={2}
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              placeholder="Catatan kelebihan, kekurangan, ketepatan waktu pengiriman..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? 'Menyimpan...' : vendorToEdit ? 'Simpan Perubahan' : 'Tambah Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
