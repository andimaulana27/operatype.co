// src/app/(main)/fonts/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import { SearchIcon } from '@/components/icons';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';

// --- PERBAIKAN 1: Menggunakan tipe Discount lengkap ---
type Discount = Database['public']['Tables']['discounts']['Row'];

// Mengganti nama tipe agar lebih jelas dan cocok dengan komponen lain
type FontWithDetails = Database['public']['Tables']['fonts']['Row'] & {
  categories: { name: string } | null;
  // Tipe `discounts` sekarang menggunakan `Discount` lengkap, bukan `Pick`
  font_discounts: { discounts: Discount | null }[];
};

const ITEMS_PER_PAGE = 24;

export default function AllFontsPage() {
  const [fonts, setFonts] = useState<FontWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('name').order('name');
        if (data) {
            setCategoryOptions(['All', ...data.map(c => c.name)]);
        }
    };
    fetchCategories();
  }, []);

  const fetchFonts = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from('fonts')
      // --- PERBAIKAN 2: Mengubah query untuk mengambil semua data diskon ---
      .select('*, categories!inner(name), font_discounts(discounts(*))', { count: 'exact' })
      .is('partner_id', null)
      .eq('status', 'Published');

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    if (selectedCategory !== 'All') {
      query = query.eq('categories.name', selectedCategory);
    }

    const isPriceSort = sortBy.includes('Price');
    if (!isPriceSort) {
        if (sortBy === 'Newest') query = query.order('created_at', { ascending: false });
        else if (sortBy === 'Oldest') query = query.order('created_at', { ascending: true });
        else if (sortBy === 'A to Z') query = query.order('name', { ascending: true });
        else if (sortBy === 'Z to A') query = query.order('name', { ascending: false });
    }
    
    const { data, error, count } = isPriceSort 
      ? await query 
      : await query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    if (error) {
      toast.error('Error fetching fonts: ' + error.message);
      setFonts([]);
    } else {
        let processedData = (data as FontWithDetails[]) || [];

        if (isPriceSort) {
            processedData.sort((a, b) => {
                const getFinalPrice = (font: FontWithDetails) => {
                    const now = new Date();
                    const activeDiscount = font.font_discounts
                        .map(fd => fd.discounts)
                        .find(d => 
                            d && d.is_active &&
                            d.start_date && new Date(d.start_date) <= now &&
                            d.end_date && new Date(d.end_date) >= now
                        );

                    const originalPrice = font.price_desktop || 0;
                    if (activeDiscount && activeDiscount.percentage) {
                        return originalPrice - (originalPrice * activeDiscount.percentage / 100);
                    }
                    return originalPrice;
                };

                const priceA = getFinalPrice(a);
                const priceB = getFinalPrice(b);

                return sortBy === 'Price: Low to High' ? priceA - priceB : priceB - priceA;
            });
        }
        
        setTotalItems(count || 0);
        setFonts(processedData);
    }
    setIsLoading(false);
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchFonts();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchFonts]);

  const paginatedFonts = useMemo(() => {
    if (sortBy.includes('Price')) {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE;
        return fonts.slice(from, to);
    }
    return fonts;
  }, [fonts, currentPage, sortBy]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const sortOptions = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

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
              value={selectedCategory}
              onChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
              }}
              options={categoryOptions}
            />
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
          <div className="text-center py-16">Loading fonts...</div>
        ) : fonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Tidak perlu lagi memberikan tipe eksplisit di sini karena sudah benar dari state */}
              {paginatedFonts.map((font) => (
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
          <p className="text-center col-span-full py-16 text-gray-500">No fonts found matching your criteria.</p>
        )}
      </section>
    </div>
  );
}