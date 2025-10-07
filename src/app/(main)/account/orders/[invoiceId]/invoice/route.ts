// src/app/(main)/account/orders/[invoiceId]/invoice/route.ts
import { NextResponse } from 'next/server';
import { getInvoiceDetailsAction } from '@/app/actions/invoiceActions';
import { generateInvoicePdf } from '@/lib/pdfGenerator';

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  const { invoiceId } = params;
  if (!invoiceId) {
    return new NextResponse('Invoice ID is required', { status: 400 });
  }
  const { data: invoice, error } = await getInvoiceDetailsAction(invoiceId);
  if (error || !invoice) {
    return new NextResponse(error || 'Invoice not found or you do not have permission.', { status: 404 });
  }
  
  try {
    // Hasilkan PDF Invoice sebagai ArrayBuffer
    const invoicePdfArrayBuffer = await generateInvoicePdf(invoice);

    // --- PERBAIKAN: Kirim ArrayBuffer secara langsung ---
    return new NextResponse(invoicePdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_id}.pdf"`,
      },
    });

  } catch (generationError) {
    console.error("Failed to generate Invoice PDF:", generationError);
    return new NextResponse('Failed to generate Invoice PDF.', { status: 500 });
  }
}