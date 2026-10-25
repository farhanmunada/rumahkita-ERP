import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/features/invoices/services/invoice.service';
import { createInvoiceSchema } from '@/features/invoices/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessIdParam = searchParams.get('businessId');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');

    const filters = {
      businessId: businessIdParam ? parseInt(businessIdParam, 10) : undefined,
      status: statusParam || undefined,
      search: searchParam || undefined,
    };

    const data = await getAllInvoices(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Gagal mengambil data invoice' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi form invoice gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newInvoice = await createInvoice(validation.data);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Gagal membuat invoice baru' }, { status: 500 });
  }
}
