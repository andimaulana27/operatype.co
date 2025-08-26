// src/app/(main)/account/orders/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OrderHistoryDisplay from './OrderHistoryDisplay';

// ==================== PERBAIKAN TIPE DATA DI SINI ====================
// Tipe ini disesuaikan agar cocok dengan struktur array dari Supabase
export type Order = {
  id: string;
  created_at: string;
  invoice_id: string | null;
  total_amount: number;
  // Nama properti diubah menjadi 'order_items' dan ini adalah sebuah array
  order_items: {
    // 'fonts' adalah objek tunggal, bukan array, sesuai relasi
    fonts: {
      name: string | null;
    } | null; // fonts bisa jadi null jika font dihapus
  }[];
};
// ====================================================================

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // ==================== PERBAIKAN QUERY DI SINI ====================
  // Mengubah 'purchase_items' menjadi 'order_items' agar sesuai dengan nama tabel
  const { data: allOrders, error } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
      invoice_id,
      total_amount,
      order_items (
        fonts (
          name
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  // ====================================================================

  if (error) {
    console.error("Error fetching order history:", error.message);
    return <OrderHistoryDisplay orders={[]} totalPages={0} currentPage={1} />;
  }

  const ITEMS_PER_PAGE = 10;
  const currentPage = Number(searchParams?.page) || 1;
  const totalOrders = allOrders || [];
  const totalPages = Math.ceil(totalOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = totalOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <OrderHistoryDisplay
      // Sekarang tidak ada lagi error karena tipe datanya sudah cocok
      orders={paginatedOrders as unknown as Order[]}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}