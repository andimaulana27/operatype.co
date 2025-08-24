// src/app/(main)/account/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { DownloadIcon } from '@/components/icons';
import toast from 'react-hot-toast';
import { getSecureDownloadUrlAction } from '@/app/actions/downloadActions';
import AccountPagination from '@/components/AccountPagination'; // Impor Paginasi

type PurchasedFont = {
  id: string; name: string | null; main_image_url: string | null; slug: string | null;
};

const ITEMS_PER_PAGE = 5; // Tentukan jumlah item per halaman

// ... (Komponen DownloadButton tidak berubah)
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


export default function MyFontsPage() {
  const { user } = useAuth();
  const [allFonts, setAllFonts] = useState<PurchasedFont[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFonts = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_purchased_fonts_for_user', { p_user_id: user.id });
      if (error) {
        toast.error('Failed to fetch your fonts.');
      } else {
        setAllFonts(data as PurchasedFont[] || []);
      }
      setIsLoading(false);
    };
    fetchFonts();
  }, [user]);

  const totalPages = Math.ceil(allFonts.length / ITEMS_PER_PAGE);
  const paginatedFonts = allFonts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section>
      <h2 className="text-3xl font-medium text-brand-black mb-6">My Fonts ({allFonts.length})</h2>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {isLoading ? (
          <p className="text-center py-8 text-brand-gray-1">Loading your fonts...</p>
        ) : allFonts.length > 0 ? (
          <div className="space-y-4">
            {paginatedFonts.map(font => (
              <div key={font.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md hover:shadow-md transition-shadow">
                <Image src={font.main_image_url || '/placeholder.png'} alt={font.name || ''} width={120} height={80} className="w-32 h-20 object-cover rounded-md bg-gray-100" />
                <div className="flex-grow text-center sm:text-left">
                  <Link href={`/fonts/${font.slug || ''}`}><h3 className="text-xl font-medium hover:text-brand-orange">{font.name}</h3></Link>
                  <p className="text-sm text-gray-500">View Product Page</p>
                </div>
                <DownloadButton fontId={font.id} />
              </div>
            ))}
            <AccountPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        ) : (
          <p className="text-center py-8 text-brand-gray-1">You haven't purchased any fonts yet.</p>
        )}
      </div>
    </section>
  );
}