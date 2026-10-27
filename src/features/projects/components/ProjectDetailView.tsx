'use client';

import React, { useState } from 'react';
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

              {project.client && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5" />
                  Klien: {project.client.name}
                </span>
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Penawaran / Omzet
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {formatRupiah(project.targetRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total nilai tagihan proyek ke klien
          </p>
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
    </div>
  );
}
