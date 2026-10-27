import { NextRequest, NextResponse } from 'next/server';
import { addProjectCost, deleteProjectCost, updateProjectCost } from '@/features/projects/services/project.service';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    const { searchParams } = new URL(request.url);
    const costId = searchParams.get('costId');

    if (!costId) {
      return NextResponse.json(
        { error: 'Parameter costId wajib disertakan' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.itemName !== undefined) updateData.itemName = body.itemName.trim();
    if (body.vendorId !== undefined) updateData.vendorId = body.vendorId ? Number(body.vendorId) : null;
    if (body.vendorNameSnapshot !== undefined) updateData.vendorNameSnapshot = body.vendorNameSnapshot ? body.vendorNameSnapshot.trim() : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.quantity !== undefined) updateData.quantity = body.quantity.toString();
    if (body.unit !== undefined) updateData.unit = body.unit.trim();
    if (body.unitCost !== undefined) updateData.unitCost = Math.round(Number(body.unitCost) || 0);
    if (body.totalCost !== undefined) {
      updateData.totalCost = Math.round(Number(body.totalCost) || 0);
    } else if (body.unitCost !== undefined || body.quantity !== undefined) {
      const q = parseFloat(updateData.quantity || '1') || 1;
      const u = updateData.unitCost !== undefined ? updateData.unitCost : 0;
      updateData.totalCost = Math.round(u * q);
    }
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : null;

    const updated = await updateProjectCost(Number(costId), updateData);
    if (!updated) {
      return NextResponse.json(
        { error: 'Pos biaya tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error PUT /api/projects/[id]/costs:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal memperbarui pos biaya' },
      { status: 500 }
    );
  }
}
