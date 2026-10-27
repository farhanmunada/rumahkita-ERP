import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProject,
  recalculateProjectTotals,
} from '@/features/projects/services/project.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(Number(id));
    if (!project) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('API Error GET /api/projects/[id]:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal memuat detail proyek' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.businessId !== undefined) updateData.businessId = body.businessId;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.targetRevenue !== undefined) updateData.targetRevenue = Number(body.targetRevenue);
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;

    const updated = await updateProject(projectId, updateData);
    if (!updated) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }

    // If target revenue updated, recalculate profit
    const finalProject = await recalculateProjectTotals(projectId);

    return NextResponse.json(finalProject || updated);
  } catch (error) {
    console.error('API Error PUT /api/projects/[id]:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal memperbarui proyek' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProject(Number(id));
    if (!success) {
      return NextResponse.json(
        { error: 'Proyek tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error DELETE /api/projects/[id]:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal menghapus proyek' },
      { status: 500 }
    );
  }
}
