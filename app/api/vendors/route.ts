import { NextRequest, NextResponse } from 'next/server';
import {
  getVendors,
  createVendor,
  getAllVendorCatalogItems,
} from '@/features/vendors/services/vendor.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const catalog = searchParams.get('catalog');
    const businessId = searchParams.get('businessId')
      ? Number(searchParams.get('businessId'))
      : undefined;

    if (catalog === 'true') {
      const items = await getAllVendorCatalogItems(businessId);
      return NextResponse.json(items);
    }

    const data = await getVendors(businessId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data rekanan vendor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Nama rekanan vendor wajib diisi' },
        { status: 400 }
      );
    }

    const newVendor = await createVendor({
      name: body.name.trim(),
      address: body.address || null,
      phone: body.phone || null,
      email: body.email || null,
      rating: body.rating ?? 5,
      qualityNotes: body.qualityNotes || null,
      category: body.category || 'general',
      businessId: body.businessId ?? null,
    });

    return NextResponse.json(newVendor, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan data rekanan vendor' },
      { status: 500 }
    );
  }
}
