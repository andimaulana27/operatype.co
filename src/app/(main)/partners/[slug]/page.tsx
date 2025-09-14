// src/app/(main)/partners/[slug]/page.tsx

export const revalidate = 3600;

import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
// import { Database } from '@/lib/database.types'; // Dihapus
import SectionTitle from '@/components/SectionTitle';
import SearchInput from '@/components/SearchInput';
import FilterDropdown from '@/components/FilterDropdown';
import ProductCard, { FontWithDetailsForCard } from '@/components/ProductCard';
import Pagination from '@/components/Pagination';

type FontFromRPC = FontWithDetailsForCard & {
  total_count: number;
};

const ITEMS_PER_PAGE = 24;

export default async function PartnerDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (partnerError || !partner) {
    notFound();
  }

  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : '';
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  
  const sortOptions = ["Newest", "Popular", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  const { data, error: fontsError } = await supabase.rpc('get_partner_fonts', {
    p_partner_id: partner.id,
    search_term: searchTerm,
    sort_by: sortBy,
    page_limit: ITEMS_PER_PAGE,
    page_offset: (currentPage - 1) * ITEMS_PER_PAGE
  });

  if (fontsError) {
    console.error("Error calling RPC 'get_partner_fonts':", fontsError);
  }

  const paginatedFonts = data as FontFromRPC[] || [];
  const totalItems = paginatedFonts[0]?.total_count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        
        <SectionTitle 
          title={partner.name}
          subtitle={partner.subheadline}
        />
      </div>

      <section className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <SearchInput placeholder="Search font by name..." />
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <span className="font-light text-brand-gray-1">Sort by:</span>
            <FilterDropdown 
                paramName="sort"
                options={sortOptions} 
            />
          </div>
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {paginatedFonts.length > 0 ? (
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
              />
            )}
          </>
        ) : (
          <p className="text-center text-brand-gray-1 py-16">No fonts found for this partner yet.</p>
        )}
      </section>
    </div>
  );
}