import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorCosts,
  createVendorCost,
} from '@/features/costing/services/vendor-cost.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessIdParam = searchParams.get('businessId');
    const businessId = businessIdParam ? parseInt(businessIdParam, 10) : undefined;

    const data = await getVendorCosts(businessId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to get vendor costs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data master HPP vendor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.businessId || !body.itemName || typeof body.baseCost !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Business ID, nama item, dan harga modal wajib diisi' },
        { status: 400 }
      );
    }

    const created = await createVendorCost({
      businessId: Number(body.businessId),
      vendorId: body.vendorId ? Number(body.vendorId) : null,
      vendorName: body.vendorName || null,
      itemName: body.itemName,
      category: body.category || 'vendor',
      unit: body.unit || 'pcs',
      baseCost: Math.max(0, Math.round(body.baseCost)),
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create vendor cost:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan data master HPP vendor' },
      { status: 500 }
    );
  }
}
