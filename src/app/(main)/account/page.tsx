// src/app/(main)/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPencilIcon, KeyIcon, LogoutIcon } from '@/components/icons';

type PurchaseHistoryItem = {
  id: string;
  created_at: string;
  license_type: string;
  fonts: { name: string }[] | null;
};

export default function AccountPage() {
  const { user, session, profile, logout } = useAuth(); // Ambil 'profile'
  const router = useRouter();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchPurchaseHistory = async () => {
      if (!user) { setIsLoading(false); return; }

      const { data, error } = await supabase
        .from('orders').select(`id, created_at, license_type, fonts ( name )`)
        .eq('user_id', user.id).order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
      } else {
        setPurchaseHistory((data as any) || []);
      }
      setIsLoading(false);
    };

    fetchPurchaseHistory();
  }, [session, user, router]);

  if (isLoading || !session || !user) {
    return <p className="text-center p-12">Loading...</p>;
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const SidebarLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string; }) => (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-md text-brand-black hover:bg-brand-gray-2 transition-colors">
      <span className="w-5 h-5 text-brand-orange">{icon}</span>
      <span>{text}</span>
    </Link>
  );

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">My Account</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          {/* PERBAIKAN: Gunakan nama dari profile */}
          <p className="text-lg text-brand-gray-1">Welcome back, {profile?.full_name || 'User'}!</p>
          <p className="font-light text-brand-gray-1">Here you can view your purchase history and re-download your fonts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          <aside className="lg:col-span-1 lg:border-r lg:border-brand-black lg:pr-8">
            <div className="p-6 border lg:border-none border-brand-gray-2 rounded-lg">
              <h3 className="text-xl font-medium text-brand-black mb-4">Account Details</h3>
              <div className="mb-6">
                {/* PERBAIKAN: Tampilkan nama dari profile */}
                <p className="font-medium text-brand-black text-lg">{profile?.full_name}</p>
                {/* PERBAIKAN: Warna email dikembalikan ke abu-abu */}
                <p className="text-sm text-brand-gray-1 break-words">{user.email}</p>
              </div>
              <nav className="flex flex-col space-y-2 font-medium">
                <SidebarLink href="/account/edit-profile" icon={<UserPencilIcon />} text="Edit Profile" />
                <SidebarLink href="/account/change-password" icon={<KeyIcon />} text="Change Password" />
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-brand-gray-2 transition-colors text-left text-red-500"
                >
                  <span className="w-5 h-5 text-red-500"><LogoutIcon /></span>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3 mt-12 lg:mt-0">
            <h2 className="text-3xl font-medium text-brand-black mb-6">Purchase History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-brand-gray-2">
                  <tr>
                    {/* PERBAIKAN: Teks tidak uppercase dan warna diubah */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-black tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-black tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-black tracking-wider">License</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Download</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray-2">
                  {purchaseHistory.length > 0 ? (
                    purchaseHistory.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-brand-white' : 'bg-brand-gray-2/50'}>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-black">{item.fonts?.[0]?.name || 'Font not found'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.license_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="bg-brand-orange text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-brand-orange-hover">
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-brand-gray-1">You have no purchase history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
