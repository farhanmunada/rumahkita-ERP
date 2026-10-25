import { NextRequest, NextResponse } from 'next/server';
import {
  updateVendorCost,
  deleteVendorCost,
} from '@/features/costing/services/vendor-cost.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const vendorCostId = parseInt(id, 10);
    if (isNaN(vendorCostId)) {
      return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateVendorCost(vendorCostId, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Data HPP tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update vendor cost:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data HPP vendor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const vendorCostId = parseInt(id, 10);
    if (isNaN(vendorCostId)) {
      return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });
    }

    const deleted = await deleteVendorCost(vendorCostId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Data HPP tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data HPP berhasil dihapus' });
  } catch (error) {
    console.error('Failed to delete vendor cost:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data HPP vendor' },
      { status: 500 }
    );
  }
}
