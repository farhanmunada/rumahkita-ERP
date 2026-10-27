'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectWithDetails } from '@/features/projects/types';
import { ProjectDetailView } from '@/features/projects/components/ProjectDetailView';

interface ProjectDetailClientProps {
  initialProject: ProjectWithDetails;
}

export function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  const [project, setProject] = useState<ProjectWithDetails>(initialProject);

  const handleRefresh = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (err) {
      console.error('Failed to refresh project data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Proyek
      </Link>

      <ProjectDetailView project={project} onRefresh={handleRefresh} />
    </div>
  );
}
