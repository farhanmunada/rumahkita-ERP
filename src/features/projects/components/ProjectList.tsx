'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { ProjectWithDetails } from '../types';
import { Business, Client } from '@/shared/db/schema';
import { formatRupiah } from '@/shared/lib/currency';
import { ProjectModal } from './ProjectModal';

interface ProjectListProps {
  initialProjects: ProjectWithDetails[];
  businesses: Business[];
  clients: Client[];
}

export function ProjectList({
  initialProjects,
  businesses,
  clients,
}: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectWithDetails[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectWithDetails | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus proyek ini beserta seluruh catatan modal HPP di dalamnya?')) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Gagal menghapus proyek');
      }
    } catch (err) {
      alert('Error saat menghapus proyek');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Planning
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama proyek atau klien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setProjectToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Rencana Proyek Baru
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Proyek & Klien</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Target Omzet</th>
                <th className="py-3.5 px-4 text-right">Modal Real (HPP)</th>
                <th className="py-3.5 px-4 text-right">Laba Kotor</th>
                <th className="py-3.5 px-4 text-center">Margin %</th>
                <th className="py-3.5 px-4 text-center">Invoice</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Belum ada data proyek. Buat rencana proyek baru untuk mulai memantau HPP dan laba real.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const marginNum = parseFloat(p.profitMargin || '0');
                  const isHealthy = marginNum >= 25;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                          {p.client ? (
                            <span>Klien: {p.client.name}</span>
                          ) : (
                            <span className="italic text-slate-400">Tanpa Klien</span>
                          )}
                          {p.startDate && <span>• Mulai: {p.startDate}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatRupiah(p.targetRevenue)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-600">
                        {formatRupiah(p.totalCost)}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        p.grossProfit >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {formatRupiah(p.grossProfit)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                          isHealthy
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {p.profitMargin || '0'}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {p.invoice ? (
                          <Link
                            href={`/invoices/${p.invoice.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            {p.invoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum Terbit
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/projects/${p.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded transition-colors"
                            title="Rincian Modal & Margin"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProjectToEdit(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit Proyek"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Project Form */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }}
        onSuccess={fetchProjects}
        projectToEdit={projectToEdit}
        businesses={businesses}
        clients={clients}
      />
    </div>
  );
}
