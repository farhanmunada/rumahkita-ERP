import { NextRequest, NextResponse } from 'next/server';
import { getBusinessById, updateBusiness } from '@/features/businesses/services/business.service';
import { updateBusinessSchema } from '@/features/businesses/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id, 10);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'ID unit bisnis tidak valid' }, { status: 400 });
    }

    const business = await getBusinessById(businessId);
    if (!business) {
      return NextResponse.json({ error: 'Unit bisnis tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching business by id:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id, 10);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'ID unit bisnis tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateBusinessSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateBusiness(businessId, validation.data);
    if (!updated) {
      return NextResponse.json({ error: 'Unit bisnis tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ error: 'Gagal memperbarui unit bisnis' }, { status: 500 });
  }
}
