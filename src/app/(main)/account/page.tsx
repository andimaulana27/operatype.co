// src/app/(main)/account/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MyFontsDisplay from './MyFontsDisplay'; // 1. Import komponen baru

// Tipe data untuk font yang dibeli
type PurchasedFont = {
  id: string;
  name: string | null;
  main_image_url: string | null;
  slug: string | null;
};

// Ini adalah Server Component, tugasnya hanya mengambil data
export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: allFonts, error } = await supabase.rpc('get_purchased_fonts_for_user', { 
    p_user_id: session.user.id 
  });

  if (error) {
    console.error("Error fetching purchased fonts:", error.message);
    // Jika ada error, kita bisa menampilkannya di komponen klien
    return <MyFontsDisplay fonts={[]} totalPages={0} currentPage={1} />;
  }

  // Logika Paginasi tetap di server
  const ITEMS_PER_PAGE = 5;
  const currentPage = Number(searchParams?.page) || 1;
  const totalFonts = allFonts || [];
  const totalPages = Math.ceil(totalFonts.length / ITEMS_PER_PAGE);
  const paginatedFonts = totalFonts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // 2. Render komponen klien dan kirim data sebagai props
  return (
    <MyFontsDisplay 
      fonts={paginatedFonts as PurchasedFont[]}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}
