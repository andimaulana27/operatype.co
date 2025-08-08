// src/app/(main)/fonts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import { SearchIcon, ChevronDownIcon } from '@/components/icons';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';

type Font = {
  id: string;
  slug: string;
  name: string;
  main_image_url: string;
  description: string;
  price_desktop: number;
  tags?: string[] | null;
  is_bestseller?: boolean;
};

const ITEMS_PER_PAGE = 24;

export default function AllFontsPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchFonts = async () => {
      setIsLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // PERBAIKAN: Menambahkan filter .is('partner_id', null)
      const { data, error, count } = await supabase
        .from('fonts')
        .select('*', { count: 'exact' })
        .is('partner_id', null) // <-- HANYA MENGAMBIL FONT MILIK BRAND ANDA
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching fonts:', error);
        setFonts([]);
      } else {
        setFonts(data || []);
        if (count) {
          setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        }
      }
      setIsLoading(false);
    };

    fetchFonts();
  }, [currentPage]);

  const categoryOptions = ["Script", "Signature", "Handwritten", "Display"];
  const sortOptions = ["Popularity", "Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  return (
    <div className="bg-brand-white">
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-5xl font-medium text-brand-black">Our Font Collection</h1>
        <div className="w-20 h-[3px] bg-brand-orange mx-auto my-6"></div>
        <p className="text-lg font-light text-brand-gray-1 max-w-2xl mx-auto">
          Browse, filter, and find the perfect font for your next creative masterpiece.
        </p>
      </section>

      <section className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search font by name..."
              className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full placeholder:text-brand-gray-1 focus:outline-none focus:border-brand-orange transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <SearchIcon className="h-6 w-6 text-brand-orange" />
            </div>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            <FilterDropdown
              defaultValue="Category"
              options={categoryOptions}
            />
            <FilterDropdown
              label="Sort by:"
              defaultValue="Popularity"
              options={sortOptions}
            />
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <p className="text-center">Loading fonts...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {fonts.map(font => (
              <ProductCard key={font.id} font={font} />
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </section>
    </div>
  );
}
