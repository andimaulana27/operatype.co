// src/app/(main)/account/orders/[invoiceId]/page.tsx
// Halaman ini tidak lagi menjadi Client Component
// --- PERBAIKAN: Hapus import yang tidak digunakan ---
import { getInvoiceDetailsAction } from '@/app/actions/invoiceActions';
import Link from 'next/link';
import InvoiceDisplay from './InvoiceDisplay';

export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
  const { data: invoice, error } = await getInvoiceDetailsAction(params.invoiceId);

  if (error || !invoice) {
    return (
      <div className="text-center p-12 text-red-600">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error || 'Invoice not found or you do not have permission to view it.'}</p>
        <Link href="/account/orders" className="text-brand-orange hover:underline mt-6 inline-block">
          &larr; Back to Order History
        </Link>
      </div>
    );
  }

  return <InvoiceDisplay invoice={invoice} />;
}