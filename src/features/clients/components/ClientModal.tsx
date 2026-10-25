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
      setFormData({
        name: clientToEdit.name || '',
        companyName: clientToEdit.companyName || '',
        phone: clientToEdit.phone || '',
        email: clientToEdit.email || '',
        address: clientToEdit.address || '',
      });
    } else {
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

    const isEdit = Boolean(clientToEdit);
    const url = isEdit ? `/api/clients/${clientToEdit?.id}` : '/api/clients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

        <Input
          label="Nama Kontak / PIC"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nama lengkap kontak klien"
          required
        />

        <Input
          label="Nama Perusahaan / Instansi"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="PT / CV / Lembaga (opsional)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nomor Telepon / WhatsApp"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="klien@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Penagihan / Kantor
          </label>
          <textarea
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="Alamat lengkap tujuan penagihan"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

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
