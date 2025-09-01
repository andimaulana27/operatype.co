// src/app/(main)/account/orders/[invoiceId]/page.tsx

// Halaman ini tidak lagi menjadi Client Component
// export const revalidate = 0; // Tidak perlu revalidate untuk halaman dinamis per user

import { getInvoiceDetailsAction, InvoiceDetails } from '@/app/actions/invoiceActions';
import { DownloadIcon } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link'; // Gunakan Link untuk navigasi
import InvoiceDisplay from './InvoiceDisplay'; // Komponen baru untuk sisi klien

export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
  // 1. Ambil data langsung di Server Component.
  // Pengguna tidak akan melihat state loading sama sekali.
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

  // 2. Kirim data yang sudah siap ke komponen klien.
  // Komponen klien hanya bertugas untuk menampilkan data dan menangani interaksi (seperti download PDF).
  return <InvoiceDisplay invoice={invoice} />;
}