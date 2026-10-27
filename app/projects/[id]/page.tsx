import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjectById } from '@/features/projects/services/project.service';
import { ProjectDetailClient } from './ProjectDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(Number(id));
  if (!project) {
    return { title: 'Proyek Tidak Ditemukan | Vola ERP' };
  }
  return {
    title: `${project.name} | Rincian Modal & Margin Proyek`,
    description: `Analisis modal HPP riil dan laba kotor proyek ${project.name}`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(Number(id));

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient initialProject={project} />;
}
