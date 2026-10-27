import React from 'react';
import type { Metadata } from 'next';
import { getProjects } from '@/features/projects/services/project.service';
import { getAllBusinesses } from '@/features/businesses/services/business.service';
import { getAllClients } from '@/features/clients/services/client.service';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { Briefcase } from 'lucide-react';
import { ProjectWithDetails } from '@/features/projects/types';
import { Business, Client } from '@/shared/db/schema';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manajemen Proyek & Modal Riil (HPP) | Vola ERP',
  description: 'Pantau modal pengeluaran riil, laba kotor, dan margin keuntungan tiap proyek tanpa wajib invoice',
};

export default async function ProjectsPage() {
  let projects: ProjectWithDetails[] = [];
  let businesses: Business[] = [];
  let clients: Client[] = [];

  try {
    const [p, b, c] = await Promise.all([
      getProjects(),
      getAllBusinesses(),
      getAllClients(),
    ]);
    projects = p;
    businesses = b;
    clients = c;
  } catch (err) {
    console.error('Failed to load projects data:', err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Pelacakan Proyek & Modal HPP Riil
          </h1>
          <p className="text-sm text-neutral-500">
            Kalkulasi akurat modal pengeluaran vendor, laba kotor, dan terbitkan invoice resmi jika siap ditagih
          </p>
        </div>
      </div>

      <ProjectList
        initialProjects={projects}
        businesses={businesses}
        clients={clients}
      />
    </div>
  );
}
