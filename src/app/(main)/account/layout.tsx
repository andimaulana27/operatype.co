// src/app/(main)/account/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountSidebar from '@/components/AccountSidebar';

// Ini sekarang adalah Server Component (async)
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  // 1. Ambil sesi langsung di server
  const { data: { session } } = await supabase.auth.getSession();

  // 2. Jika tidak ada sesi, langsung redirect dari server
  if (!session) {
    redirect('/login');
  }

  // 3. Ambil data profil pengguna di server
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">My Dashboard</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          {/* Tampilkan nama dari data yang di-fetch di server */}
          <p className="text-lg text-brand-gray-1">Welcome back, {profile?.full_name || session.user.email}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <aside className="lg:col-span-1">
            {/* 4. Render Sidebar sebagai komponen terpisah dan kirim data user/profile sebagai props */}
            <AccountSidebar user={session.user} profile={profile} />
          </aside>

          <main className="lg:col-span-3 mt-12 lg:mt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
