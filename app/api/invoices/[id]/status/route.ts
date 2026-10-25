import { NextRequest, NextResponse } from 'next/server';
import { updateInvoiceStatus } from '@/features/invoices/services/invoice.service';
import { updateInvoiceStatusSchema } from '@/features/invoices/types';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateInvoiceStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi status gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateInvoiceStatus(invoiceId, validation.data.status);
    if (!updated) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: validation.data.status });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status invoice' }, { status: 500 });
  }
}
