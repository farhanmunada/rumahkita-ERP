import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/features/invoices/services/invoice.service';
import { createInvoiceSchema } from '@/features/invoices/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 });
    }

    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(
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
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateInvoice(invoiceId, validation.data);
    if (!updated) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Gagal memperbarui invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'ID invoice tidak valid' }, { status: 400 });
    }

    const deleted = await deleteInvoice(invoiceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Gagal menghapus invoice' }, { status: 500 });
  }
}
