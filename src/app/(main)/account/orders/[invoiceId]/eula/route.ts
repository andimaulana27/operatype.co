// src/app/(main)/account/orders/[invoiceId]/eula/route.ts
import { NextResponse } from 'next/server';
import { getInvoiceDetailsAction } from '@/app/actions/invoiceActions';
import { generateEulaPdf } from '@/lib/eulaGenerator';

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
    // Hasilkan PDF EULA sebagai ArrayBuffer
    const eulaPdfArrayBuffer = await generateEulaPdf(invoice);

    // --- PERBAIKAN: Kirim ArrayBuffer secara langsung ---
    return new NextResponse(eulaPdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EULA-${invoice.invoice_id}.pdf"`,
      },
    });

  } catch (generationError) {
    console.error("Failed to generate EULA PDF:", generationError);
    return new NextResponse('Failed to generate EULA PDF.', { status: 500 });
  }
}