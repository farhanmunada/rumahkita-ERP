import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/features/clients/services/client.service';
import { clientSchema } from '@/features/clients/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'ID klien tidak valid' }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Klien tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'ID klien tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const validation = clientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateClient(clientId, validation.data);
    if (!updated) {
      return NextResponse.json({ error: 'Klien tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Gagal memperbarui klien' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'ID klien tidak valid' }, { status: 400 });
    }

    const deleted = await deleteClient(clientId);
    if (!deleted) {
      return NextResponse.json({ error: 'Klien tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus klien (kemungkinan masih memiliki riwayat invoice)' },
      { status: 500 }
    );
  }
}
