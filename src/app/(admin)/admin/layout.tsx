// src/app/(admin)/admin/layout.tsx
// ==================== PERBAIKAN BUILD VERCEL ====================
// Memaksa Next.js untuk merender halaman ini secara dinamis pada setiap request,
// mencegah error "Dynamic server usage" saat proses build di Vercel.
export const dynamic = 'force-dynamic';
// ================================================================

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    // Ganti `h-screen` menjadi `min-h-screen` agar tinggi kontainer bisa lebih panjang dari layar.
    <div className="flex min-h-screen bg-brand-gray-2">
      <Sidebar />
      <div className="w-px bg-brand-black"></div>
      {/* Hapus `overflow-y-auto` agar seluruh halaman bisa di-scroll, bukan hanya area <main>. */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}