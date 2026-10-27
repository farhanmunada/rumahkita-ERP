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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Planning
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600">
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
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari nama proyek atau klien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Rencana Proyek Baru
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 italic">
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
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-bold text-sm text-neutral-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                          {p.name}
                        </Link>
                        <div className="flex items-center gap-2 text-neutral-500 text-[11px] mt-0.5">
                          {p.client ? (
                            <span>Klien: {p.client.name}</span>
                          ) : (
                            <span className="italic text-neutral-400">Tanpa Klien</span>
                          )}
                          {p.startDate && <span>• Mulai: {p.startDate}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-900 dark:text-white">
                        {formatRupiah(p.targetRevenue)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {formatRupiah(p.totalCost)}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        p.grossProfit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatRupiah(p.grossProfit)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          isHealthy
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        }`}>
                          {p.profitMargin || '0'}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {p.invoice ? (
                          <Link
                            href={`/invoices/${p.invoice.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            {p.invoice.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">
                            Belum Terbit
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/projects/${p.id}`}
                            className="p-1.5 text-neutral-600 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 rounded transition-colors"
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
                            className="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors"
                            title="Edit Proyek"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
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
