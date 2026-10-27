import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/features/projects/services/project.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId')
      ? parseInt(searchParams.get('businessId')!)
      : undefined;

    const data = await getProjects(businessId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error GET /api/projects:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal mengambil data proyek' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Nama proyek wajib diisi' },
        { status: 400 }
      );
    }

    const businessId = body.businessId || 1;
    const targetRevenue = parseFloat(body.targetRevenue) || 0;

    const newProject = await createProject({
      businessId,
      clientId: body.clientId ? Number(body.clientId) : null,
      name: body.name.trim(),
      description: body.description ? body.description.trim() : null,
      status: body.status || 'PLANNING',
      targetRevenue,
      totalCost: 0,
      grossProfit: targetRevenue,
      profitMargin: '100.00',
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('API Error POST /api/projects:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal membuat proyek baru' },
      { status: 500 }
    );
  }
}
