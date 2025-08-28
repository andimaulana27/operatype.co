// src/app/(main)/partners/[slug]/page.tsx

// Menghapus caching agar data selalu terbaru
export const revalidate = 0;

import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { FontWithDetailsForCard } from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import SearchInput from '@/components/SearchInput';
import FilterDropdown from '@/components/FilterDropdown';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';

type Partner = Database['public']['Tables']['partners']['Row'];

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
  
  const sortOptions = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low", "A to Z", "Z to A"];

  let query = supabase
    .from('fonts')
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
  let fonts: FontWithDetailsForCard[] = fontsData || [];

  if (isPriceSort && fonts) {
      fonts.sort((a, b) => {
          const getFinalPrice = (font: FontWithDetailsForCard) => {
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
          
          {/* ==================== PERBAIKAN DI SINI ==================== */}
          <div className="flex w-full md:w-auto items-center gap-2">
            <span className="font-light text-brand-gray-1">Sort by:</span>
            <FilterDropdown 
                paramName="sort"
                options={sortOptions} 
            />
          </div>
          {/* ========================================================= */}
        </div>
        <div className="border-b border-brand-black mt-6"></div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-24">
        {fonts.length > 0 ? (
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
          <p className="text-center text-brand-gray-1">No fonts found for this partner yet.</p>
        )}
      </section>
    </div>
  );
}