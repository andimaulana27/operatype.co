// src/app/(main)/fonts/page.tsx

// Hapus 'use client'. Ini sekarang adalah Server Component.
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Database } from '@/lib/database.types';
import SearchInput from '@/components/SearchInput'; // Komponen baru untuk pencarian

// Tipe data yang konsisten
type Discount = Database['public']['Tables']['discounts']['Row'];
type FontWithDetails = Database['public']['Tables']['fonts']['Row'] & {
  categories: { name: string } | null;
  font_discounts: { discounts: Discount | null }[];
};

const ITEMS_PER_PAGE = 24;

// Fungsi untuk mengambil kategori (dijalankan di server)
async function getCategories() {
    const { data, error } = await supabase.from('categories').select('name').order('name');
    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data.map(c => c.name);
}

// Komponen halaman sekarang `async` dan menerima `searchParams`
export default async function AllFontsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Baca state dari URL, bukan dari useState
  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : '';
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : 'All';
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

  // 2. Ambil data kategori untuk dropdown filter
  const categoryOptions = ['All', ...(await getCategories())];
  const sortOptions = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  // 3. Bangun query ke database berdasarkan parameter dari URL
  let query = supabase
    .from('fonts')
    .select('*, categories!inner(name), font_discounts(discounts(*))', { count: 'exact' })
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

  // 4. Eksekusi query
  const { data, error, count } = await query;
  let fonts: FontWithDetails[] = data || [];

  // 5. Lakukan sorting harga di server jika diperlukan
  if (isPriceSort && fonts) {
      fonts.sort((a, b) => {
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

  // 6. Lakukan paginasi di server
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
            {/* Komponen SearchInput baru yang mengontrol URL */}
            <SearchInput placeholder="Search font by name..." />
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-4">
            {/* FilterDropdown sekarang menerima `paramName` untuk memanipulasi URL */}
            <FilterDropdown
              paramName="category"
              options={categoryOptions}
            />
            <FilterDropdown
              paramName="sort"
              label="Sort by:"
              options={sortOptions}
            />
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
