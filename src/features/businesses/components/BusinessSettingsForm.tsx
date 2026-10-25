'use client';

import React, { useState } from 'react';
import { Business } from '@/shared/db/schema';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Building2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface BusinessSettingsFormProps {
  initialBusinesses: Business[];
}

export function BusinessSettingsForm({ initialBusinesses }: BusinessSettingsFormProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [selectedId, setSelectedId] = useState<number>(initialBusinesses[0]?.id || 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeBusiness = businesses.find((b) => b.id === selectedId);

  const [formData, setFormData] = useState({
    name: activeBusiness?.name || '',
    tagline: activeBusiness?.tagline || '',
    invoicePrefix: activeBusiness?.invoicePrefix || '',
    address: activeBusiness?.address || '',
    phone: activeBusiness?.phone || '',
    email: activeBusiness?.email || '',
    bankName: activeBusiness?.bankName || '',
    bankAccountNumber: activeBusiness?.bankAccountNumber || '',
    bankAccountHolder: activeBusiness?.bankAccountHolder || '',
    defaultTerms: activeBusiness?.defaultTerms || '',
  });

  const handleSelectBusiness = (b: Business) => {
    setSelectedId(b.id);
    setMessage(null);
    setFormData({
      name: b.name || '',
      tagline: b.tagline || '',
      invoicePrefix: b.invoicePrefix || '',
      address: b.address || '',
      phone: b.phone || '',
      email: b.email || '',
      bankName: b.bankName || '',
      bankAccountNumber: b.bankAccountNumber || '',
      bankAccountHolder: b.bankAccountHolder || '',
      defaultTerms: b.defaultTerms || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyimpan profil');
      }

      const updated = await res.json();
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setMessage({ type: 'success', text: `Profil unit ${updated.name} berhasil disimpan.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigasi 4 Unit Bisnis */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {businesses.map((b) => {
          const isActive = b.id === selectedId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBusiness(b)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{b.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {b.invoicePrefix}
              </span>
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Konfigurasi Unit Terpilih */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-slate-900">
              Konfigurasi Kop Surat & Rekening — {activeBusiness?.name}
            </h2>
            <p className="text-xs text-slate-500">
              Data ini otomatis digunakan pada kop surat dan tagihan invoice resmi unit ini.
            </p>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Resmi Unit Bisnis"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Prefix Penomoran Invoice (e.g. PRT, DSN)"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Tagline / Slogan Bisnis"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Contoh: Solusi Cetak Cepat dan Berkualitas"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon / WhatsApp"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Alamat Email Resmi"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Operasional Bisnis
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Informasi Rekening Bank Tujuan Transfer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nama Bank (e.g. BCA, Mandiri)"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                />
                <Input
                  label="Nomor Rekening"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                />
                <Input
                  label="Nama Pemilik Rekening (a.n.)"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Syarat & Ketentuan Pembayaran Default (Terms & Conditions)
              </label>
              <textarea
                name="defaultTerms"
                rows={3}
                value={formData.defaultTerms}
                onChange={handleChange}
                placeholder="Ketentuan garansi, DP, atau batas waktu pembayaran..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Profil Unit'}</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
