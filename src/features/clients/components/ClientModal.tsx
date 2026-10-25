'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Client } from '@/shared/db/schema';
import { CreateClientDTO } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
  clientToEdit?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSuccess, clientToEdit }: ClientModalProps) {
  const [clientType, setClientType] = useState<'personal' | 'business'>('personal');
  const [formData, setFormData] = useState<CreateClientDTO>({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      const isBusiness = Boolean(clientToEdit.companyName && clientToEdit.companyName.trim() !== '');
      setClientType(isBusiness ? 'business' : 'personal');
      setFormData({
        name: clientToEdit.name || '',
        companyName: clientToEdit.companyName || '',
        phone: clientToEdit.phone || '',
        email: clientToEdit.email || '',
        address: clientToEdit.address || '',
      });
    } else {
      setClientType('personal');
      setFormData({
        name: '',
        companyName: '',
        phone: '',
        email: '',
        address: '',
      });
    }
    setError(null);
  }, [clientToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: CreateClientDTO = {
      ...formData,
      companyName: clientType === 'business' ? formData.companyName?.trim() : '',
    };

    const isEdit = Boolean(clientToEdit);
    const url = isEdit ? `/api/clients/${clientToEdit?.id}` : '/api/clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyimpan klien');
      }

      const savedClient = await res.json();
      onSuccess(savedClient);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200">
            {error}
          </div>
        )}

        {/* Tipe Pelanggan: Konsumen Akhir vs B2B */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tipe Pelanggan
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setClientType('personal')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                clientType === 'personal'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konsumen Langsung (Retail/Personal)
            </button>
            <button
              type="button"
              onClick={() => setClientType('business')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                clientType === 'business'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bisnis / Perusahaan (B2B)
            </button>
          </div>
        </div>

        {clientType === 'personal' ? (
          /* Form Konsumen Langsung */
          <div className="space-y-3">
            <Input
              label="Nama Lengkap Pelanggan"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="cth: Ahmad Fauzi / Ibu Rina"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nomor WhatsApp / HP"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
              />
              <Input
                label="Email (Opsional)"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pelanggan@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Domisili / Pengiriman (Opsional)
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat rumah atau alamat pengiriman barang"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
        ) : (
          /* Form Perusahaan / Bisnis B2B */
          <div className="space-y-3">
            <Input
              label="Nama Perusahaan / Instansi / Usaha"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="cth: PT Maju Bersama / Toko Sinar Jaya"
              required
            />

            <Input
              label="Nama PIC / Kontak Person"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="cth: Ibu Dian (Purchasing)"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nomor Telepon Kantor / WA"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="021-xxxxxx / 08xxxxxxxx"
              />
              <Input
                label="Email Perusahaan"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="finance@perusahaan.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Kantor / Penagihan
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Alamat kantor atau lokasi penagihan"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : clientToEdit ? 'Simpan Perubahan' : 'Tambah Klien'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
