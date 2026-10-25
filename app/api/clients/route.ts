import { NextRequest, NextResponse } from 'next/server';
import { getAllClients, createClient } from '@/features/clients/services/client.service';
import { clientSchema } from '@/features/clients/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAllClients();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Gagal mengambil data klien' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = clientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi data klien gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newClient = await createClient(validation.data);
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Gagal menambahkan klien' }, { status: 500 });
  }
}
