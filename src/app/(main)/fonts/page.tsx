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

// Tipe ini sekarang konsisten dengan ProductCard dan mengambil data diskon lengkap
type FontWithDetails = Database['public']['Tables']['fonts']['Row'] & {
  categories: { name: string } | null;
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

  // Mengambil opsi kategori saat komponen dimuat
  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('name').order('name');
        if (data) {
            setCategoryOptions(['All', ...data.map(c => c.name)]);
        }
    };
    fetchCategories();
  }, []);

  // Fungsi utama untuk mengambil dan memfilter data font
  const fetchFonts = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from('fonts')
      // --- PERBAIKAN 2: Query diubah untuk mengambil semua data diskon terkait ---
      .select('*, categories!inner(name), font_discounts(discounts(*))', { count: 'exact' })
      .is('partner_id', null) // Hanya font dari Operatype, bukan partner
      .eq('status', 'Published');

    // Terapkan filter pencarian
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    // Terapkan filter kategori
    if (selectedCategory !== 'All') {
      query = query.eq('categories.name', selectedCategory);
    }

    // Terapkan pengurutan non-harga di level database
    const isPriceSort = sortBy.includes('Price');
    if (!isPriceSort) {
        if (sortBy === 'Newest') query = query.order('created_at', { ascending: false });
        else if (sortBy === 'Oldest') query = query.order('created_at', { ascending: true });
        else if (sortBy === 'A to Z') query = query.order('name', { ascending: true });
        else if (sortBy === 'Z to A') query = query.order('name', { ascending: false });
    }
    
    // Eksekusi query
    // Jika sorting berdasarkan harga, ambil semua data dulu baru di-sort di client
    const { data, error, count } = isPriceSort 
      ? await query 
      : await query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

    if (error) {
      toast.error('Error fetching fonts: ' + error.message);
      setFonts([]);
    } else {
        let processedData = (data as FontWithDetails[]) || [];

        // --- PERBAIKAN 3: Logika sorting harga yang memperhitungkan diskon aktif ---
        if (isPriceSort) {
            processedData.sort((a, b) => {
                // Helper function untuk mendapatkan harga final (setelah diskon)
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

  // Efek untuk menjalankan fetchFonts dengan debounce saat filter berubah
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchFonts();
    }, 300); // Menunggu 300ms setelah user berhenti mengetik/memilih

    return () => clearTimeout(debounceFetch);
  }, [fetchFonts]);

  // Memoize data yang akan ditampilkan di halaman saat ini
  const paginatedFonts = useMemo(() => {
    // Jika sorting berdasarkan harga, paginasi dilakukan di client
    if (sortBy.includes('Price')) {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE;
        return fonts.slice(from, to);
    }
    // Jika tidak, data sudah dipaginasi oleh database
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
                  setCurrentPage(1); // Reset ke halaman 1 saat mencari
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
                  setCurrentPage(1); // Reset ke halaman 1 saat filter
              }}
              options={categoryOptions}
            />
            <FilterDropdown
              label="Sort by:"
              value={sortBy}
              onChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1); // Reset ke halaman 1 saat sorting
              }}
              options={sortOptions}
            />
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {isLoading ? (
          <div className="text-center py-16 text-lg text-gray-500">Loading fonts...</div>
        ) : fonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
