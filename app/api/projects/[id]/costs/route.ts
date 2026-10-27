import { NextRequest, NextResponse } from 'next/server';
import { addProjectCost, deleteProjectCost } from '@/features/projects/services/project.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    const body = await request.json();

    if (!body.itemName || !body.itemName.trim()) {
      return NextResponse.json(
        { error: 'Nama pos pengeluaran wajib diisi' },
        { status: 400 }
      );
    }

    const unitCost = Math.round(Number(body.unitCost) || 0);
    const quantity = (body.quantity !== undefined ? body.quantity : '1').toString();
    const qtyNum = parseFloat(quantity) || 1;
    const totalCost = Math.round(Number(body.totalCost) || unitCost * qtyNum);

    const cost = await addProjectCost({
      projectId,
      vendorId: body.vendorId ? Number(body.vendorId) : null,
      vendorNameSnapshot: body.vendorNameSnapshot ? body.vendorNameSnapshot.trim() : null,
      itemName: body.itemName.trim(),
      category: body.category || 'vendor',
      quantity,
      unit: body.unit ? body.unit.trim() : 'pcs',
      unitCost,
      totalCost,
      isPaidToVendor: Boolean(body.isPaidToVendor),
      notes: body.notes ? body.notes.trim() : null,
    });

    return NextResponse.json(cost, { status: 201 });
  } catch (error) {
    console.error('API Error POST /api/projects/[id]/costs:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal menambahkan pos biaya' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const costId = searchParams.get('costId');

    if (!costId) {
      return NextResponse.json(
        { error: 'Parameter costId wajib disertakan' },
        { status: 400 }
      );
    }

    const success = await deleteProjectCost(Number(costId));
    if (!success) {
      return NextResponse.json(
        { error: 'Pos biaya tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error DELETE /api/projects/[id]/costs:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal menghapus pos biaya' },
      { status: 500 }
    );
  }
}
