// src/app/(main)/account/MyFontsDisplay.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AccountPagination from '@/components/AccountPagination';
import DownloadButton from './DownloadButton'; // Tombol download yang sudah kita buat

// Tipe data untuk font yang dibeli
type PurchasedFont = {
  id: string;
  name: string | null;
  main_image_url: string | null;
  slug: string | null;
};

type MyFontsDisplayProps = {
  fonts: PurchasedFont[];
  totalPages: number;
  currentPage: number;
};

export default function MyFontsDisplay({ fonts, totalPages, currentPage }: MyFontsDisplayProps) {
  const router = useRouter();

  // PERBAIKAN: Membuat fungsi onPageChange di Client Component
  const handlePageChange = (page: number) => {
    router.push(`/account?page=${page}`);
  };

  return (
    <section>
      <h2 className="text-3xl font-medium text-brand-black mb-6">My Fonts ({fonts.length > 0 ? fonts.length : 0})</h2>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {fonts.length > 0 ? (
          <div className="space-y-4">
            {fonts.map((font) => (
              <div key={font.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md hover:shadow-md transition-shadow">
                <Image 
                  src={font.main_image_url || '/placeholder.png'} 
                  alt={font.name || 'Font image'} 
                  width={120} 
                  height={80} 
                  className="w-32 h-20 object-cover rounded-md bg-gray-100" 
                />
                <div className="flex-grow text-center sm:text-left">
                  <Link href={`/fonts/${font.slug || ''}`}>
                    <h3 className="text-xl font-medium hover:text-brand-orange">{font.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">View Product Page</p>
                </div>
                <DownloadButton fontId={font.id} />
              </div>
            ))}
            {totalPages > 1 && (
              // PERBAIKAN: Memberikan prop onPageChange yang dibutuhkan
              <AccountPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        ) : (
          <p className="text-center py-8 text-brand-gray-1">You haven&apos;t purchased any fonts yet.</p>
        )}
      </div>
    </section>
  );
}