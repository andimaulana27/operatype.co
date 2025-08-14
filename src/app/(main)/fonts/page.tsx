// src/app/(main)/fonts/page.tsx
'use client';

// DIPERBARUI: Menambahkan 'useMemo' ke dalam import dari React
import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import { SearchIcon } from '@/components/icons';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';

type Discount = Database['public']['Tables']['discounts']['Row'];
type FontWithDiscount = Database['public']['Tables']['fonts']['Row'] & {
  categories: { name: string } | null;
  font_discounts: { discounts: Pick<Discount, 'name' | 'percentage'> | null }[];
};

const ITEMS_PER_PAGE = 24;

export default function AllFontsPage() {
  const [fonts, setFonts] = useState<FontWithDiscount[]>([]);
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
      .select('*, categories!inner(name), font_discounts(discounts(name, percentage))', { count: 'exact' })
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

    // Untuk sorting harga, kita tidak bisa melakukan pagination di database
    // jadi kita ambil semua data yang cocok
    const { data, error, count } = isPriceSort ? await query : await query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);


    if (error) {
      toast.error('Error fetching fonts: ' + error.message);
      setFonts([]);
    } else {
        let processedData = (data as FontWithDiscount[]) || [];

        if (isPriceSort) {
            processedData.sort((a, b) => {
                const getFinalPrice = (font: FontWithDiscount) => {
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
        
        setTotalItems(count || 0);
        setFonts(processedData);
    }
    setIsLoading(false);
  }, [searchTerm, selectedCategory, sortBy, currentPage]); // Menambahkan currentPage agar data fetch ulang saat pindah halaman

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchFonts();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchFonts]);

  const paginatedFonts = useMemo(() => {
    // Jika sorting berdasarkan harga, paginasi dilakukan di sini
    if (sortBy.includes('Price')) {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE;
        return fonts.slice(from, to);
    }
    // Jika tidak, data sudah dipaginasi oleh Supabase
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
          <p className="text-center py-16">Loading fonts...</p>
        ) : fonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* DIPERBARUI: Memberikan tipe eksplisit pada parameter 'font' */}
              {paginatedFonts.map((font: FontWithDiscount) => (
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