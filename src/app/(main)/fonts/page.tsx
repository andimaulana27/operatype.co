// src/app/(main)/fonts/page.tsx

// Cache tetap penting untuk performa instan bagi pengunjung berulang
export const revalidate = 3600;

import ProductCard, { FontWithDetailsForCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import SearchInput from '@/components/SearchInput';

const ITEMS_PER_PAGE = 24;

type FontFromRPC = FontWithDetailsForCard & {
  total_count: number;
};

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
  
  const sortOptions = ["Newest", "Popular", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  const { data, error } = await supabase.rpc('get_filtered_fonts', {
    search_term: searchTerm,
    category_name: selectedCategory,
    sort_by: sortBy,
    page_limit: ITEMS_PER_PAGE,
    page_offset: (currentPage - 1) * ITEMS_PER_PAGE
  });

  if (error) {
    console.error("Error calling RPC 'get_filtered_fonts':", error);
  }

  const paginatedFonts = data as FontFromRPC[] || [];
  
  const totalItems = paginatedFonts[0]?.total_count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
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
            <FilterDropdown paramName="category" options={categoryOptions} />
            <div className="flex items-center gap-2">
              <span className="font-light text-brand-gray-1">Sort by:</span>
              <FilterDropdown paramName="sort" options={sortOptions} />
            </div>
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {paginatedFonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* PERUBAHAN DI SINI: Menambahkan prop `priority` pada ProductCard */}
              {paginatedFonts.map((font, index) => (
                <ProductCard 
                  key={font.id} 
                  font={font} 
                  // Prioritaskan 4 gambar pertama di halaman pertama
                  priority={currentPage === 1 && index < 4} 
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        ) : (
          <p className="text-center col-span-full py-16 text-gray-500">No fonts found matching your criteria.</p>
        )}
      </section>
    </div>
  );
}