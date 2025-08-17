'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import { supabase } from '@/lib/supabaseClient';
import { SearchIcon } from '@/components/icons';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { FontWithDetailsForCard } from '@/components/ProductCard'; // Impor tipe yang benar

// Tipe Partner
type Partner = Database['public']['Tables']['partners']['Row'];

const ITEMS_PER_PAGE = 24;

// Komponen sekarang menerima data awal sebagai props
export default function PartnerDetailPageClient({ 
  partner, 
  initialFonts, 
  initialCount 
}: { 
  partner: Partner,
  initialFonts: FontWithDetailsForCard[],
  initialCount: number,
}) {
  const [fonts, setFonts] = useState<FontWithDetailsForCard[]>(initialFonts);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(initialCount);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fungsi fetch hanya untuk paginasi atau filter, bukan untuk load awal
  const fetchFilteredFonts = useCallback(async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('fonts')
        // PERBAIKAN: Query diubah untuk mengambil semua data diskon `discounts(*)`
        .select('*, font_discounts(discounts(*))', { count: 'exact' })
        .eq('partner_id', partner.id)
        .eq('status', 'Published');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const isPriceSort = sortBy.includes('Price');
      if (!isPriceSort) {
          if (sortBy === 'Newest') query = query.order('created_at', { ascending: false });
          else if (sortBy === 'Oldest') query = query.order('created_at', { ascending: true });
          else if (sortBy === 'A to Z') query = query.order('name', { ascending: true });
          else if (sortBy === 'Z to A') query = query.order('name', { ascending: false });
      }

      const { data: fontsData, error: fontsError, count } = await query;
      
      if (fontsError) throw fontsError;
      
      let processedData = (fontsData as FontWithDetailsForCard[]) || [];

      if (isPriceSort) {
        processedData.sort((a, b) => {
            const getFinalPrice = (font: FontWithDetailsForCard) => {
                const discount = font.font_discounts?.[0]?.discounts;
                const originalPrice = font.price_desktop || 0;
                if (discount && discount.percentage) {
                    return originalPrice - (originalPrice * discount.percentage / 100);
                }
                return originalPrice;
            };
            const priceA = getFinalPrice(a);
            const priceB = getFinalPrice(b);
            return sortBy === 'Price: Low to High' ? priceA - priceB : priceB - priceA;
        });
      }
      
      setFonts(processedData);
      setTotalItems(count || 0);

    } catch (error: any) {
      toast.error(error.message || 'Failed to load partner data.');
    } finally {
      setIsLoading(false);
    }
  }, [partner.id, searchTerm, sortBy]);

  useEffect(() => {
    // Jalankan fetch hanya jika ada perubahan filter, bukan saat load pertama
    const debounceFetch = setTimeout(() => {
        fetchFilteredFonts();
    }, 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchFilteredFonts]);
  
  const paginatedFonts = useMemo(() => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;
      return fonts.slice(from, to);
  }, [fonts, currentPage]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const sortOptions = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <SectionTitle 
          title={partner?.name || 'Partner Fonts'}
          subtitle={partner?.subheadline || ''}
        />
      </div>

      <section className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search font by name..."
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
              }}
              className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full placeholder:text-brand-gray-1 focus:outline-none focus:border-brand-orange transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <SearchIcon className="h-6 w-6 text-brand-orange" />
            </div>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            <FilterDropdown 
                label="Sort by:" 
                value={sortBy}
                onChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                }}
                options={sortOptions} 
            />
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <p className="text-center text-brand-gray-1">Filtering fonts...</p>
        ) : fonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedFonts.map(font => (
                <ProductCard key={font.id} font={font} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
        ) : (
          <p className="text-center text-brand-gray-1">No fonts found for this partner yet.</p>
        )}
      </section>
    </div>
  );
}