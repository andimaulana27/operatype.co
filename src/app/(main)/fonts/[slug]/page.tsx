// src/app/(main)/fonts/[slug]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import FontImageGallery from '@/components/FontImageGallery';
import TypeTester from '@/components/TypeTester';
import GlyphViewer from '@/components/GlyphViewer';
import ProductCard from '@/components/ProductCard';
import LicenseSelector from '@/components/LicenseSelector';
import SectionHeader from '@/components/SectionHeader';
import { FileIcon, ArchiveIcon } from '@/components/icons';
import { Database } from "@/lib/database.types";
import DynamicFontLoader from "@/components/DynamicFontLoader";

// Tipe data untuk konsistensi di seluruh file
type Discount = Database['public']['Tables']['discounts']['Row'];
type FontRow = Database['public']['Tables']['fonts']['Row'];
type FontDetail = FontRow & {
  partners: { name: string } | null;
  categories: { name: string } | null;
  font_discounts: { discounts: Discount | null }[];
};

// Fungsi untuk mengambil data font berdasarkan slug
async function getFontBySlug(slug: string): Promise<FontDetail> {
  const { data, error } = await supabase
    .from('fonts')
    .select(`*, partners(name), categories(name), font_discounts(discounts(*))`)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }
  return data as FontDetail;
}

// Fungsi untuk mengambil font terkait
async function getRelatedFonts(currentId: string): Promise<FontDetail[]> {
    const { data, error } = await supabase
    .from('fonts')
    .select('*, partners(name), categories(name), font_discounts(discounts(*))')
    .neq('id', currentId)
    .limit(4);

  if (error) {
    console.error('Error fetching related fonts:', error);
    return [];
  }
  return data as FontDetail[];
}

// DIPERBARUI: Tipe props didefinisikan langsung di sini untuk memastikan kecocokan
export default async function FontDetailPage({ params }: { params: { slug: string } }) {
  const font = await getFontBySlug(params.slug);
  const relatedFonts = await getRelatedFonts(font.id);
  const dynamicFontFamily = `dynamic-${font.name.replace(/\s+/g, '-')}`;

  const now = new Date();
  const activeDiscount = font.font_discounts
      .map(fd => fd.discounts)
      .find(d => 
          d && d.is_active && 
          d.start_date && d.end_date &&
          new Date(d.start_date) <= now && 
          new Date(d.end_date) >= now
      );

  return (
    <>
      <DynamicFontLoader 
        fontFamily={dynamicFontFamily} 
        fontUrl={font.display_font_regular_url} 
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="w-full lg:col-span-2">
            <FontImageGallery 
              mainImage={font.main_image_url}
              galleryImages={font.gallery_image_urls as string[] || []}
            />
            <TypeTester 
              fontFamily={font.name}
              fontUrlRegular={font.display_font_regular_url}
              fontUrlItalic={font.display_font_italic_url || undefined}
            />
          </div>

          <div className="w-full">
            <h1 className="text-5xl font-medium text-brand-black">{font.name}</h1>
            {font.partners && (
              <span className="inline-block bg-brand-orange text-white text-sm font-medium px-3 py-1 rounded-full mt-2">
                by {font.partners.name}
              </span>
            )}
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
          <div className="lg:col-span-2">
            <SectionHeader title="About The Product" />
            <p className="font-light text-brand-black whitespace-pre-line">
              {font.description}
            </p>
            <div className="mt-12">
              <SectionHeader title="Glyph" />
              <GlyphViewer 
                glyphString={font.glyph_string}
                fontFamily={dynamicFontFamily}
              />
            </div>
          </div>
          <div>
            <div className="space-y-8">
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
                <SectionHeader title="Product Information" />
                <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                  {(font.product_information as string[] || []).map((info: string) => <li key={info}>{info}</li>)}
                </ul>
              </div>
              <div>
                <SectionHeader title="Styles" />
                <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                  {(font.styles as string[] || []).map((style: string) => <li key={style}>{style}</li>)}
                </ul>
              </div>
              <div>
                <SectionHeader title="Tags" />
                <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                  {(font.tags as string[] || []).map((tag: string) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <div>
            <SectionHeader title="You May Also Like" />
          </div>
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