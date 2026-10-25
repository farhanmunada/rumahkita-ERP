import { NextResponse } from 'next/server';
import { getAllBusinesses } from '@/features/businesses/services/business.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAllBusinesses();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Gagal mengambil data unit bisnis' }, { status: 500 });
  }
}
