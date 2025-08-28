// src/app/(main)/fonts/page.tsx

import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Database } from '@/lib/database.types';
import SearchInput from '@/components/SearchInput';

type Discount = Database['public']['Tables']['discounts']['Row'];
type FontWithDetails = Database['public']['Tables']['fonts']['Row'] & {
  categories: { name: string } | null;
  // Tambahkan order_items di sini untuk menghitung popularitas
  order_items: { count: number }[];
  font_discounts: { discounts: Discount | null }[];
};

const ITEMS_PER_PAGE = 24;

async function getCategories() {
    const { data, error } = await supabase.from('categories').select('name').order('name');
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data.map(c => c.name);
}

export default async function AllFontsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : '';
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : 'All';
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

  const categoryOptions = ['All', ...(await getCategories())];
  // ==================== PERBAIKAN 1: TAMBAHKAN OPSI POPULAR ====================
  const sortOptions = ["Popular", "Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  // 3. Bangun query ke database
  let query = supabase
    .from('fonts')
    // Ambil `order_items` untuk menghitung penjualan
    .select('*, categories!inner(name), order_items(count), font_discounts(discounts(*))', { count: 'exact' })
    .eq('status', 'Published');

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }
  if (selectedCategory !== 'All') {
    query = query.eq('categories.name', selectedCategory);
  }

  const isPriceOrPopularSort = sortBy.includes('Price') || sortBy === 'Popular';
  
  // Lakukan sorting di database untuk yang non-manual
  if (!isPriceOrPopularSort) {
      if (sortBy === 'Newest') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'Oldest') query = query.order('created_at', { ascending: true });
      else if (sortBy === 'A to Z') query = query.order('name', { ascending: true });
      else if (sortBy === 'Z to A') query = query.order('name', { ascending: false });
  }

  // Eksekusi query
  const { data, error, count } = await query;
  let fonts: FontWithDetails[] = data || [];

  // Lakukan sorting manual untuk Harga dan Popularitas di server
  if (isPriceOrPopularSort && fonts) {
      fonts.sort((a, b) => {
          if (sortBy === 'Popular') {
              const salesA = a.order_items[0]?.count || 0;
              const salesB = b.order_items[0]?.count || 0;
              return salesB - salesA; // Urutkan dari penjualan terbanyak
          }

          // Logika sorting harga tetap sama
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
              if (activeDiscount?.percentage) {
                  return originalPrice - (originalPrice * activeDiscount.percentage / 100);
              }
              return originalPrice;
          };
          const priceA = getFinalPrice(a);
          const priceB = getFinalPrice(b);
          return sortBy === 'Price: Low to High' ? priceA - priceB : priceB - priceA;
      });
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedFonts = fonts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
          <div className="w-full md:w-1/3">
            <SearchInput placeholder="Search font by name..." />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            <FilterDropdown
              paramName="category"
              options={categoryOptions}
            />
            {/* ==================== PERBAIKAN 2: PISAHKAN LABEL DROPDOWN ==================== */}
            <div className="flex items-center gap-2">
              <span className="font-light text-brand-gray-1">Sort by:</span>
              <FilterDropdown
                paramName="sort"
                options={sortOptions}
              />
            </div>
            {/* ========================================================================== */}
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {fonts.length > 0 ? (
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