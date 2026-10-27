import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  updateVendor,
  deleteVendor,
} from '@/features/vendors/services/vendor.service';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = parseInt(id, 10);
    if (isNaN(vendorId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const vendor = await getVendorById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail vendor' },
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
    const vendorId = parseInt(id, 10);
    if (isNaN(vendorId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await updateVendor(vendorId, {
      name: body.name?.trim(),
      address: body.address ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      rating: body.rating,
      qualityNotes: body.qualityNotes ?? null,
      category: body.category,
      businessId: body.businessId ?? null,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Vendor tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui vendor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendorId = parseInt(id, 10);
    if (isNaN(vendorId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const success = await deleteVendor(vendorId);
    if (!success) {
      return NextResponse.json({ error: 'Vendor tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vendor berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus vendor' },
      { status: 500 }
    );
  }
}
