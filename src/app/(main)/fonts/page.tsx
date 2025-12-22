// src/app/(main)/fonts/page.tsx

export const revalidate = 3600;

import ProductCard, { FontWithDetailsForCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import SearchInput from '@/components/SearchInput';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Fonts',
  description: 'Browse, filter, and discover the perfect high-quality script and display font from our collection for your next creative masterpiece.',
};

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
  const selectedTag = typeof searchParams.tag === 'string' ? searchParams.tag : undefined; 
  
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

  const categoryOptions = ['All', ...(await getCategories())];
  const sortOptions = ["Newest", "Popular", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  let paginatedFonts: FontWithDetailsForCard[] = [];
  let totalItems = 0;

  if (selectedTag) {
    // 1. FILTER BERDASARKAN TAG (Query Manual)
    // PERBAIKAN: Gunakan JSON.stringify agar formatnya valid untuk kolom JSONB
    let query = supabase
      .from('fonts')
      .select('*, partners(name, slug), categories(name), font_discounts(discounts(*))', { count: 'exact' })
      .eq('status', 'Published')
      .contains('tags', JSON.stringify([selectedTag])); // <-- Fix untuk Error 22P02

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    switch (sortBy) {
      case 'Newest': query = query.order('created_at', { ascending: false }); break;
      case 'Oldest': query = query.order('created_at', { ascending: true }); break;
      case 'Price: Low to High': query = query.order('price_desktop', { ascending: true }); break;
      case 'Price: High to Low': query = query.order('price_desktop', { ascending: false }); break;
      case 'A to Z': query = query.order('name', { ascending: true }); break;
      case 'Z to A': query = query.order('name', { ascending: false }); break;
      case 'Popular': query = query.eq('is_bestseller', true); break; 
      default: query = query.order('created_at', { ascending: false });
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;
    
    const { data, count, error } = await query.range(start, end);
    
    if (error) {
      console.error("Error fetching tagged fonts:", error);
    } else {
      paginatedFonts = data as FontWithDetailsForCard[] || [];
      totalItems = count || 0;
    }

  } else {
    // 2. FILTER STANDAR (RPC Existing)
    const { data, error } = await supabase.rpc('get_filtered_fonts', {
      search_term: searchTerm,
      category_name: selectedCategory,
      sort_by: sortBy,
      page_limit: ITEMS_PER_PAGE,
      page_offset: (currentPage - 1) * ITEMS_PER_PAGE
    });

    if (error) {
      console.error("Error calling RPC 'get_filtered_fonts':", error);
    } else {
      const rpcData = data as FontFromRPC[] || [];
      paginatedFonts = rpcData;
      totalItems = rpcData[0]?.total_count || 0;
    }
  }
  
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
            {!selectedTag && (
              <FilterDropdown paramName="category" options={categoryOptions} />
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-light text-brand-gray-1">Sort by:</span>
              <FilterDropdown paramName="sort" options={sortOptions} />
            </div>
          </div>
        </div>

        {selectedTag && (
           <div className="mt-4 flex items-center gap-3">
             <span className="text-brand-gray-1">Showing results for tag:</span>
             <span className="bg-brand-orange text-white px-4 py-1 rounded-full text-sm font-medium">
               {selectedTag}
             </span>
             <Link href="/fonts" className="text-sm text-brand-gray-1 hover:text-brand-orange underline decoration-1 underline-offset-2">
               Clear filter
             </Link>
           </div>
        )}

        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {paginatedFonts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedFonts.map((font, index) => (
                <ProductCard 
                  key={font.id} 
                  font={font} 
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