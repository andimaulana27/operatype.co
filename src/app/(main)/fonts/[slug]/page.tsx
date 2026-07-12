// src/app/(main)/fonts/[slug]/page.tsx

// ==================== PERBAIKAN VERCEL CACHE ====================
// Menghapus export const revalidate = 3600; 
// Menggantinya dengan force-dynamic agar data (khususnya diskon) 
// selalu fresh dari database setiap kali user memuat halaman.
export const dynamic = 'force-dynamic';
// ================================================================

import { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from 'next/link';
import FontImageGallery from '@/components/FontImageGallery';
import ProductCard from '@/components/ProductCard';
import LicenseSelector from '@/components/LicenseSelector';
import SectionHeader from '@/components/SectionHeader';
import { FileIcon, ArchiveIcon, FolderIcon } from '@/components/icons';
import { Database } from "@/lib/database.types";
import DynamicFontLoader from "@/components/DynamicFontLoader";
import { FontWithDetailsForCard } from "@/components/ProductCard";

const TypeTester = dynamicImport(() => import('@/components/TypeTester'), { ssr: false });
const GlyphViewer = dynamicImport(() => import('@/components/GlyphViewer'), { ssr: false });

type Discount = Database['public']['Tables']['discounts']['Row'];
type FontDetail = Database['public']['Tables']['fonts']['Row'] & {
  partners: { name: string; slug: string } | null;
  categories: { name: string } | null;
  font_discounts: { discounts: Discount | null }[];
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  const { data: font } = await supabase
    .from('fonts')
    .select('name, description, tags, main_image_url, categories(name)')
    .eq('slug', slug)
    .single();

  if (!font) {
    return {
      title: 'Font Not Found | Operatype',
      description: 'The font you are looking for could not be found.',
    };
  }

  const shortDescription = font.description ? font.description.split('.')[0] + '.' : 'Discover a new high-quality font from Operatype.';

  const keywords = [
    font.name,
    `${font.name} font`,
    font.categories?.[0]?.name,
    ...(Array.isArray(font.tags) ? (font.tags as string[]) : []),
    'script font',
    'display font',
    'typography',
    'operatype',
  ].filter(Boolean);

  return {
    title: `${font.name} Font | Operatype`,
    description: shortDescription,
    keywords: keywords.join(', '),
    openGraph: {
        title: `${font.name} Font | Operatype`,
        description: shortDescription,
        images: [
            {
                url: font.main_image_url,
                width: 1200,
                height: 630,
                alt: `${font.name} Font Preview`,
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${font.name} Font | Operatype`,
        description: shortDescription,
        images: [font.main_image_url],
    },
  };
}

async function getFontBySlug(slug: string): Promise<FontDetail | null> {
  const { data, error } = await supabase
    .from('fonts')
    .select(`*, partners(name, slug), categories(name), font_discounts(discounts(*))`)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching font with slug "${slug}":`, error.message);
    return null;
  }
  return data as FontDetail;
}

async function getRelatedFonts(currentId: string): Promise<FontWithDetailsForCard[]> {
    const { data, error } = await supabase
    .from('fonts')
    .select('*, partners(name), categories(name), font_discounts(discounts(*))')
    .neq('id', currentId)
    .limit(4);

  if (error) {
    console.error('Error fetching related fonts:', error);
    return [];
  }
  return data as FontWithDetailsForCard[];
}

export default async function FontDetailPage({ 
    params 
}: { 
    params: { slug: string } 
}) {
  const font = await getFontBySlug(params.slug);
  
  if (!font) {
    notFound();
  }

  const relatedFonts = await getRelatedFonts(font.id);
  
  const dynamicFontFamilyRegular = `dynamic-${font.slug}-Regular`;
  const dynamicFontFamilyItalic = `dynamic-${font.slug}-Italic`;

  // ==================== PERBAIKAN DISKON ====================
  // Mencari diskon yang aktif tanpa memvalidasi start_date dan end_date
  // agar admin dapat mengontrol diskon secara realtime hanya dengan is_active
  const activeDiscount = font.font_discounts
      .map(fd => fd.discounts)
      .find(d => d && d.is_active);
  // ==========================================================

  const getFontMimeType = (url: string | null) => {
    if (!url) return '';
    if (url.endsWith('.otf')) return 'font/otf';
    if (url.endsWith('.ttf')) return 'font/ttf';
    return '';
  };

  return (
    <>
      {font.display_font_italic_url && (
        <link
          rel="preload"
          href={font.display_font_italic_url}
          as="font"
          type={getFontMimeType(font.display_font_italic_url)}
          crossOrigin="anonymous"
        />
      )}

      <DynamicFontLoader 
        fontFamily={dynamicFontFamilyRegular} 
        fontUrl={font.display_font_regular_url} 
      />
      <DynamicFontLoader 
        fontFamily={dynamicFontFamilyItalic} 
        fontUrl={font.display_font_italic_url} 
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="w-full lg:col-span-2">
            <FontImageGallery 
              mainImage={font.main_image_url}
              galleryImages={Array.isArray(font.gallery_image_urls) ? font.gallery_image_urls as string[] : []}
            />
            <TypeTester 
              fontFamilyRegular={dynamicFontFamilyRegular}
              fontFamilyItalic={font.display_font_italic_url ? dynamicFontFamilyItalic : undefined}
            />
            
            <div className="mt-16">
              <SectionHeader title="About The Product" />
              <p className="font-light text-brand-black whitespace-pre-line">
                {font.description}
              </p>
            </div>

            <div className="mt-12">
                <SectionHeader title="Tags" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(font.tags) && font.tags.length > 0 ? (
                    (font.tags as string[]).map((tag) => (
                      <Link 
                        key={tag} 
                        href={`/fonts?tag=${encodeURIComponent(tag)}`}
                        className="inline-block px-4 py-2 bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-600 rounded-full text-sm transition-colors duration-200"
                      >
                        {tag}
                      </Link>
                    ))
                  ) : (
                    <span className="text-gray-400 font-light">-</span>
                  )}
                </div>
            </div>

            <div className="mt-12">
              <SectionHeader title="Glyph" />
              <GlyphViewer 
                glyphString={font.glyph_string}
                fontFamily={dynamicFontFamilyRegular}
              />
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-5xl font-medium text-brand-black">{font.name}</h1>
            <div className="mt-2 text-sm">
                <span className="text-gray-600">by </span>
                {font.partners ? (
                  <Link href={`/partners/${font.partners.slug}`} className="font-semibold text-brand-orange hover:underline">
                    {font.partners.name}
                  </Link>
                ) : (
                  <Link href="/fonts" className="font-semibold text-brand-orange hover:underline">
                    Operatype.co
                  </Link>
                )}
            </div>
            <div className="border-b border-brand-black my-6"></div>
            <LicenseSelector font={font} activeDiscount={activeDiscount || null} />
            <div className="text-center border border-brand-black rounded-lg p-6 mt-6">
              <h4 className="font-medium text-brand-black">Need a custom font or license?</h4>
              <div className="w-16 h-[3px] bg-brand-orange mx-auto my-4"></div>
              <p className="font-light text-brand-black mt-2">Contact us and we will be happy to help you with your custom license needs.</p>
              <Link href="/contact">
                <span className="inline-block mt-4 bg-transparent border border-brand-black text-brand-black font-medium py-3 px-8 rounded-full hover:bg-brand-black hover:text-white transition-colors">
                  Contact Us
                </span>
              </Link>
            </div>
            <div className="space-y-8 mt-16 border-t pt-16">
              <div>
                <SectionHeader title="Category" />
                <div className="flex items-center gap-3 font-light text-brand-black">
                  <FolderIcon className="w-6 h-6 text-brand-orange flex-shrink-0" />
                  <span>{font.categories?.name || 'Uncategorized'}</span>
                </div>
              </div>
              <div>
                <SectionHeader title="File Type" />
                <div className="flex items-center gap-3 font-light text-brand-black">
                  <FileIcon className="w-6 h-6 text-brand-orange flex-shrink-0" />
                  <span>{font.name} {font.file_types}</span>
                </div>
              </div>
              <div>
                <SectionHeader title="File Size" />
                <div className="flex items-center gap-3 font-light text-brand-black">
                  <ArchiveIcon className="w-6 h-6 text-brand-orange flex-shrink-0" />
                  <span>{font.file_size}</span>
                </div>
              </div>
               <div>
                <SectionHeader title="Feature Product" />
                <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                  {(Array.isArray(font.product_information) ? font.product_information as string[] : []).map((info: string) => <li key={info}>{info}</li>)}
                </ul>
              </div>
              <div>
                <SectionHeader title="Styles" />
                <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                  {(Array.isArray(font.styles) ? font.styles as string[] : []).map((style: string) => <li key={style}>{style}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24 border-t pt-16">
          <SectionHeader title="You May Also Like" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {relatedFonts.map((relatedFont) => (
              <ProductCard key={relatedFont.id} font={relatedFont} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}