'use client';

import React, { useState } from 'react';
import { Client } from '@/shared/db/schema';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ClientModal } from './ClientModal';
import { Users, Plus, Search, Edit2, Trash2, Building, Phone, Mail, MapPin, User } from 'lucide-react';

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'personal' | 'business'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const personalCount = clients.filter((c) => !c.companyName || c.companyName.trim() === '').length;
  const businessCount = clients.filter((c) => Boolean(c.companyName && c.companyName.trim() !== '')).length;

  const filteredClients = clients.filter((c) => {
    const isBusiness = Boolean(c.companyName && c.companyName.trim() !== '');
    if (typeFilter === 'personal' && isBusiness) return false;
    if (typeFilter === 'business' && !isBusiness) return false;

    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setClientToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setClientToEdit(c);
    setModalOpen(true);
  };

  const handleSaveSuccess = (saved: Client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data klien ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal menghapus klien');
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, perusahaan, no hp, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('personal')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                typeFilter === 'personal'
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konsumen Langsung ({personalCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('business')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                typeFilter === 'business'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bisnis B2B ({businessCount})
            </button>
          </div>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </Button>
      </div>

      {/* Directory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <tr>
                <th className="px-6 py-3">Pelanggan & Kategori</th>
                <th className="px-6 py-3">Kontak / WhatsApp</th>
                <th className="px-6 py-3">Alamat</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum ada data pelanggan</p>
                    <p className="text-xs">Klik tombol &quot;Tambah Pelanggan&quot; untuk menambahkan klien baru.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isBusiness = Boolean(client.companyName && client.companyName.trim() !== '');

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          {isBusiness ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Building className="w-3 h-3" />
                              <span>Bisnis B2B</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <User className="w-3 h-3" />
                              <span>Konsumen Langsung</span>
                            </span>
                          )}
                        </div>

                        {isBusiness ? (
                          <div>
                            <div className="font-bold text-slate-900">{client.companyName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              PIC: <span className="text-slate-700 font-medium">{client.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {!client.phone && !client.email && <span className="text-xs text-slate-400">-</span>}
                      </td>
                    <td className="px-6 py-4 max-w-xs">
                      {client.address ? (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 line-clamp-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{client.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(client)}
                          className="text-slate-600 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === client.id}
                          onClick={() => handleDelete(client.id)}
                          className="text-slate-600 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSaveSuccess}
        clientToEdit={clientToEdit}
      />
    </div>
  );
}
