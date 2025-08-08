// src/app/(main)/partners/[slug]/client.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
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

type Partner = {
  id: string;
  name: string;
  subheadline: string;
};

const ITEMS_PER_PAGE = 24;

// PERBAIKAN: Komponen sekarang menerima 'slug' sebagai properti langsung
export default function PartnerDetailPageClient({ slug }: { slug: string }) {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPartnerFonts = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('id, name, subheadline')
        .eq('slug', slug) // Menggunakan 'slug' dari properti
        .single();
      
      if (partnerError) throw partnerError;
      if (!partnerData) throw new Error("Partner not found.");
      
      setPartner(partnerData);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: fontsData, error: fontsError, count } = await supabase
        .from('fonts')
        .select('*', { count: 'exact' })
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fontsError) throw fontsError;

      setFonts(fontsData || []);
      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

    } catch (error: any) {
      console.error('Error fetching partner data:', error);
      setErrorState(error.message || 'Failed to load partner data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, slug]); // PERBAIKAN: 'slug' sekarang adalah dependensi yang stabil

  useEffect(() => {
    fetchPartnerFonts();
  }, [fetchPartnerFonts]);

  const categoryOptions = ["Script", "Signature", "Handwritten", "Display"];
  const sortOptions = ["Popularity", "Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <SectionTitle 
          title={isLoading ? 'Loading...' : partner?.name || 'Partner Fonts'}
          subtitle={partner?.subheadline || ''}
        />
      </div>

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
            <FilterDropdown defaultValue="Category" options={categoryOptions} />
            <FilterDropdown label="Sort by:" defaultValue="Popularity" options={sortOptions} />
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <p className="text-center text-brand-gray-1">Loading fonts...</p>
        ) : errorState ? (
          <p className="text-center text-red-500">{errorState}</p>
        ) : fonts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {fonts.map(font => (
              <ProductCard key={font.id} font={font as any} />
            ))}
          </div>
        ) : (
          <p className="text-center text-brand-gray-1">No fonts found for this partner yet.</p>
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
