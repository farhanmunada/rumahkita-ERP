import { NextRequest, NextResponse } from 'next/server';
import { bridgeProjectToInvoice } from '@/features/projects/services/project.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = Number(id);

    const result = await bridgeProjectToInvoice(projectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error POST /api/projects/[id]/generate-invoice:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal menerbitkan invoice dari proyek' },
      { status: 400 }
    );
  }
}
