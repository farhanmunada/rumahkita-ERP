'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  User,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Pencil,
  X,
} from 'lucide-react';
import { ProjectWithDetails } from '../types';
import { formatRupiah } from '@/shared/lib/currency';
import { ProjectCostManager } from './ProjectCostManager';

interface ProjectDetailViewProps {
  project: ProjectWithDetails;
  onRefresh: () => void;
}

export function ProjectDetailView({ project, onRefresh }: ProjectDetailViewProps) {
  const [status, setStatus] = useState(project.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeMessage, setBridgeMessage] = useState<string | null>(null);

  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [newRevenue, setNewRevenue] = useState(project.targetRevenue ? String(project.targetRevenue) : '');
  const [isSavingRevenue, setIsSavingRevenue] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    project.clientId ? project.clientId.toString() : ''
  );

  useEffect(() => {
    setMounted(true);
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setNewRevenue(project.targetRevenue ? String(project.targetRevenue) : '');
    setSelectedClientId(project.clientId ? project.clientId.toString() : '');
  }, [project.targetRevenue, project.clientId]);

  useEffect(() => {
    if (isEditingRevenue) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditingRevenue]);

  const handleSaveRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRevenue(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRevenue: Number(newRevenue) || 0,
          clientId: selectedClientId ? Number(selectedClientId) : null,
        }),
      });
      if (res.ok) {
        setIsEditingRevenue(false);
        onRefresh();
      } else {
        alert('Gagal memperbarui nilai penawaran proyek');
      }
    } catch {
      alert('Error memperbarui nilai penawaran proyek');
    } finally {
      setIsSavingRevenue(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update project status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBridgeInvoice = async () => {
    if (!project.clientId) {
      alert('Tentukan klien terlebih dahulu sebelum menerbitkan invoice.');
      return;
    }

    if (!confirm(`Terbitkan invoice resmi untuk proyek "${project.name}" senilai ${formatRupiah(project.targetRevenue)}?`)) {
      return;
    }

    setIsBridging(true);
    setBridgeMessage(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/generate-invoice`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menerbitkan invoice');
      }

      setBridgeMessage(`Invoice #${data.invoiceNumber} berhasil diterbitkan!`);
      onRefresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsBridging(false);
    }
  };

  const marginNum = parseFloat(project.profitMargin || '0');
  const isHealthyMargin = marginNum >= 25;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {project.name}
              </h1>

              {/* Status Select */}
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="PLANNING">📝 Perencanaan (Planning)</option>
                <option value="IN_PROGRESS">⚙️ Sedang Berjalan (In Progress)</option>
                <option value="COMPLETED">✅ Selesai (Completed)</option>
                <option value="CANCELLED">❌ Dibatalkan (Cancelled)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
              {project.business && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building2 className="w-3.5 h-3.5" />
                  {project.business.name}
                </span>
              )}

              {project.client ? (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5" />
                  Klien: {project.client.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingRevenue(true)}
                  className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
                  title="Klik untuk memilih klien proyek"
                >
                  <User className="w-3.5 h-3.5" />
                  + Tentukan Klien
                </button>
              )}

              {(project.startDate || project.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.startDate || '-'} s/d {project.endDate || '-'}
                </span>
              )}
            </div>

            {project.description && (
              <p className="text-xs text-slate-600 mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {project.invoiceId ? (
              <Link
                href={`/invoices/${project.invoiceId}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Lihat Invoice Klien
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleBridgeInvoice}
                disabled={isBridging}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isBridging ? 'Menerbitkan...' : 'Terbitkan Invoice'}
              </button>
            )}
          </div>
        </div>

        {bridgeMessage && (
          <div className="mt-4 p-3 text-xs text-blue-800 bg-blue-50 border border-blue-300 rounded-lg flex items-center justify-between">
            <span>{bridgeMessage}</span>
            {project.invoiceId && (
              <Link
                href={`/invoices/${project.invoiceId}`}
                className="font-bold underline ml-2"
              >
                Buka Dokumen
              </Link>
            )}
          </div>
        )}
      </div>

      {/* KPI Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omzet Target */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Penawaran / Omzet
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setNewRevenue(project.targetRevenue ? String(project.targetRevenue) : '');
                  setIsEditingRevenue(true);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                title="Atur atau ubah nilai penawaran proyek"
              >
                <Pencil className="w-3 h-3" />
                <span className="text-[11px]">Ubah</span>
              </button>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {formatRupiah(project.targetRevenue)}
          </div>
          {project.targetRevenue === 0 ? (
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Belum ditentukan • Klik &apos;Ubah&apos; untuk menetapkan
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Total nilai tagihan proyek ke klien
            </p>
          )}
        </div>

        {/* Card 2: Total Modal HPP Real */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Modal (HPP Real)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-2">
            {formatRupiah(project.totalCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {project.costs?.length || 0} pos pengeluaran riil tercatat
          </p>
        </div>

        {/* Card 3: Laba Kotor Riil */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Laba Kotor (Gross Profit)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-bold font-mono mt-2 ${
            project.grossProfit >= 0
              ? 'text-emerald-600'
              : 'text-rose-600'
          }`}>
            {formatRupiah(project.grossProfit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Omzet dikurangi pengeluaran modal
          </p>
        </div>

        {/* Card 4: Margin Keuntungan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Margin Keuntungan
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-xl font-bold font-mono ${
              isHealthyMargin
                ? 'text-emerald-600'
                : 'text-amber-500'
            }`}>
              {project.profitMargin || '0'}%
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {isHealthyMargin ? 'Sehat' : 'Ketat'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Rasio efisiensi laba kotor terhadap omzet
          </p>
        </div>
      </div>

      {/* Project Cost Table Manager */}
      <ProjectCostManager
        projectId={project.id}
        initialCosts={project.costs || []}
        businessId={project.businessId}
        onCostChanged={onRefresh}
      />

      {/* Edit Revenue Modal */}
      {isEditingRevenue && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ubah Nilai Penawaran Proyek</h3>
                <p className="text-xs text-slate-500 mt-0.5">{project.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingRevenue(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRevenue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Omzet / Nilai Penawaran (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan 0 jika nilai penawaran belum disepakati dengan klien.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Klien Proyek
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Belum Ditentukan / Internal</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Wajib ditentukan sebelum menerbitkan invoice resmi.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingRevenue(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingRevenue}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  {isSavingRevenue ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
