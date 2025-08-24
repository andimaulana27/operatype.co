// src/app/(main)/account/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserPencilIcon, KeyIcon, LogoutIcon, DownloadIcon } from '@/components/icons';
import toast from 'react-hot-toast';
import { logoutAction } from '@/app/actions/authActions';
import { getSecureDownloadUrlAction } from '@/app/actions/downloadActions';

// Tipe data baru untuk data yang lebih lengkap
type PurchasedFont = {
  id: string;
  name: string | null;
  main_image_url: string | null;
  slug: string | null;
};

type OrderHistory = {
  id: string;
  created_at: string;
  license_type: string | null;
  amount: number | null;
  invoice_id: string | null;
  fonts: {
    name: string | null;
  } | null;
};

// Komponen Tombol Download Terpisah untuk logika yang bersih
const DownloadButton = ({ fontId }: { fontId: string }) => {
    const [isDownloading, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            toast.loading('Preparing download...');
            const result = await getSecureDownloadUrlAction(fontId);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else if (result.url) {
                // Memicu download di browser dengan membuka URL di tab baru
                window.open(result.url, '_blank');
                toast.success("Your download will begin shortly!");
            }
        });
    };

    return (
        <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-full hover:bg-brand-orange-hover transition-colors disabled:opacity-50"
        >
            <DownloadIcon className="w-4 h-4" />
            <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
        </button>
    );
};


export default function AccountPage() {
  const { user, session, profile, loading } = useAuth();
  const router = useRouter();
  const [purchasedFonts, setPurchasedFonts] = useState<PurchasedFont[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      toast.loading('Logging out...');
      await logoutAction();
      toast.dismiss();
    });
  };

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. Panggil fungsi database untuk mendapatkan daftar font unik
      const { data: fontData, error: fontError } = await supabase.rpc('get_purchased_fonts_for_user', { p_user_id: user.id });

      // 2. Query untuk mendapatkan riwayat pesanan yang mendetail
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`*, fonts (name)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fontError || orderError) {
        toast.error('Failed to fetch your account data.');
        console.error("Fetch Error:", fontError || orderError);
      } else {
        setPurchasedFonts(fontData as PurchasedFont[] || []);
        setOrderHistory(orderData as OrderHistory[] || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [session, user, router, loading]);

  if (isLoading || loading || !session || !user) {
    return (
        <div className="container mx-auto px-4 py-32 text-center">
            <p className="text-lg text-gray-500">Loading your account dashboard...</p>
        </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-brand-black">My Dashboard</h1>
          <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
          <p className="text-lg text-brand-gray-1">Welcome back, {profile?.full_name || user.email}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          {/* --- SIDEBAR --- */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-brand-black mb-4">Account Details</h3>
              <div className="mb-6">
                <p className="font-medium text-brand-black text-lg">{profile?.full_name}</p>
                <p className="text-sm text-brand-gray-1 break-words">{user.email}</p>
              </div>
              <nav className="flex flex-col space-y-1 font-medium">
                <Link href="#" className="flex items-center gap-3 p-3 rounded-md text-brand-black hover:bg-gray-100"><UserPencilIcon className="w-5 h-5 text-brand-orange" /><span>Edit Profile</span></Link>
                <Link href="#" className="flex items-center gap-3 p-3 rounded-md text-brand-black hover:bg-gray-100"><KeyIcon className="w-5 h-5 text-brand-orange" /><span>Change Password</span></Link>
                <form action={handleLogout}>
                  <button type="submit" disabled={isPending} className="flex items-center w-full gap-3 p-3 rounded-md hover:bg-red-50 transition-colors text-left text-red-600 disabled:opacity-50">
                    <LogoutIcon className="w-5 h-5" /><span>{isPending ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </form>
              </nav>
            </div>
          </aside>

          {/* --- KONTEN UTAMA DASHBOARD --- */}
          <main className="lg:col-span-3 mt-12 lg:mt-0 space-y-12">
            
            <section>
              <h2 className="text-3xl font-medium text-brand-black mb-6">My Fonts ({purchasedFonts.length})</h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
                {purchasedFonts.length > 0 ? (
                  purchasedFonts.map(font => (
                    <div key={font.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md hover:shadow-md transition-shadow">
                      <Image src={font.main_image_url || '/placeholder.png'} alt={font.name || ''} width={120} height={80} className="w-32 h-20 object-cover rounded-md bg-gray-100" />
                      <div className="flex-grow text-center sm:text-left">
                        <Link href={`/fonts/${font.slug || ''}`}><h3 className="text-xl font-medium hover:text-brand-orange">{font.name || 'Font Not Found'}</h3></Link>
                        <p className="text-sm text-gray-500">View Product Page</p>
                      </div>
                      <DownloadButton fontId={font.id} />
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-brand-gray-1">You haven't purchased any fonts yet.</p>
                )}
              </div>
            </section>
            
            <section>
              <h2 className="text-3xl font-medium text-brand-black mb-6">Order History</h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderHistory.length > 0 ? (
                        orderHistory.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.invoice_id || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.fonts?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.amount?.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                              <button className="text-brand-orange hover:underline">View</button>
                              <button className="text-brand-orange hover:underline">Download</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="text-center py-16 text-brand-gray-1">You have no purchase history yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </main>
        </div>  
      </div>
    </div>
  );
}