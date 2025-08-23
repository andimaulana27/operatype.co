// src/app/(main)/account/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react'; // 1. Impor useTransition
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPencilIcon, KeyIcon, LogoutIcon, DownloadIcon } from '@/components/icons';
import toast from 'react-hot-toast';
import { logoutAction } from '@/app/actions/authActions'; // 2. Impor logoutAction

// Tipe data disesuaikan dengan struktur asli dari Supabase
type PurchaseHistoryItem = {
  id: string;
  created_at: string;
  license_type: string;
  // 'fonts' adalah array yang berisi satu objek, atau bisa jadi null
  fonts: { name: string }[] | null;
};

export default function AccountPage() {
  const { user, session, profile } = useAuth(); // 3. Hapus 'logout' dari sini
  const router = useRouter();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition(); // 4. Tambahkan state transisi

  // 5. Buat handler untuk logout menggunakan Server Action
  const handleLogout = () => {
    startTransition(async () => {
      toast.loading('Logging out...');
      await logoutAction();
      toast.dismiss();
    });
  };

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchPurchaseHistory = async () => {
      if (!user) { 
        setIsLoading(false); 
        return; 
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          license_type,
          fonts ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error fetching purchase history: ' + error.message);
      } else {
        setPurchaseHistory((data as PurchaseHistoryItem[]) || []);
      }
      setIsLoading(false);
    };

    fetchPurchaseHistory();
  }, [session, user, router]);

  if (isLoading || !session || !user) {
    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <p className="text-lg text-gray-500">Loading your account details...</p>
        </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
  };

  const SidebarLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string; }) => (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-md text-brand-black hover:bg-gray-100 transition-colors">
      <span className="w-5 h-5 text-brand-orange">{icon}</span>
      <span>{text}</span>
    </Link>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">My Account</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg text-brand-gray-1">Welcome back, {profile?.full_name || user.email}!</p>
          <p className="font-light text-brand-gray-1">Here you can view your purchase history and re-download your fonts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <aside className="lg:col-span-1">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-brand-black mb-4">Account Details</h3>
              <div className="mb-6">
                <p className="font-medium text-brand-black text-lg">{profile?.full_name}</p>
                <p className="text-sm text-brand-gray-1 break-words">{user.email}</p>
              </div>
              <nav className="flex flex-col space-y-1 font-medium">
                <SidebarLink href="/account/edit-profile" icon={<UserPencilIcon />} text="Edit Profile" />
                <SidebarLink href="/account/change-password" icon={<KeyIcon />} text="Change Password" />
                {/* 6. Ganti 'button' dengan 'form' dan 'onClick' dengan 'action' */}
                <form action={handleLogout}>
                  <button 
                    type="submit"
                    disabled={isPending}
                    className="flex items-center w-full gap-3 p-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 disabled:opacity-50"
                  >
                    <span className="w-5 h-5"><LogoutIcon /></span>
                    <span>{isPending ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3 mt-12 lg:mt-0">
            <h2 className="text-3xl font-medium text-brand-black mb-6">Purchase History</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License</th>
                      <th className="relative px-6 py-4"><span className="sr-only">Download</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchaseHistory.length > 0 ? (
                      purchaseHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {item.fonts?.[0]?.name || 'Font not found'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.license_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button className="bg-brand-orange text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-brand-orange-hover flex items-center gap-2 transition-colors">
                              <DownloadIcon className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-brand-gray-1">You have no purchase history yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}