// src/app/fonts/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FontImageGallery from '@/components/FontImageGallery';
import TypeTester from '@/components/TypeTester';
import GlyphViewer from '@/components/GlyphViewer';
import ProductCard from '@/components/ProductCard';
import LicenseSelector from '@/components/LicenseSelector';
import SectionHeader from '@/components/SectionHeader';
import { FileIcon, ArchiveIcon } from '@/components/icons';

type FontDetail = {
  id: string;
  name: string;
  description: string;
  price_desktop: number;
  price_business: number;
  price_corporate: number;
  main_image_url: string;
  gallery_image_urls: string[];
  display_font_regular_url: string;
  display_font_italic_url?: string | null;
  glyph_string: string;
  tag: string[] | null;
  is_bestseller: boolean;
  partners: { name: string } | null;
  file_types: string;
  file_size: string;
  product_information: string[];
  styles: string[];
};

async function getFontBySlug(slug: string): Promise<FontDetail | null> {
  const { data, error } = await supabase
    .from('fonts')
    .select(`*, partners ( name )`)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching font by slug:', error);
    return null;
  }
  
  return data as FontDetail;
}

async function getRelatedFonts(currentId: string) {
    const { data, error } = await supabase
    .from('fonts')
    .select('*')
    .neq('id', currentId)
    .limit(4);

  if (error) {
    console.error('Error fetching related fonts:', error);
    return [];
  }
  return data;
}

export default async function FontDetailPage({ params }: { params: { slug: string } }) {
  const font = await getFontBySlug(params.slug);
  
  if (!font) {
    notFound();
  }

  const relatedFonts = await getRelatedFonts(font.id);
  const dynamicFontFamily = `dynamic-${font.name.replace(/\s+/g, '-')}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="w-full lg:col-span-2">
          <FontImageGallery 
            mainImage={font.main_image_url}
            galleryImages={font.gallery_image_urls || []}
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
          <LicenseSelector font={font} />
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
                {(font.product_information || []).map((info: string) => <li key={info}>{info}</li>)}
              </ul>
            </div>
            <div>
              <SectionHeader title="Styles" />
              <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                {(font.styles || []).map((style: string) => <li key={style}>{style}</li>)}
              </ul>
            </div>
            {/* PERBAIKAN: Mengganti struktur 'Tags' agar sama seperti 'Styles' */}
            <div>
              <SectionHeader title="Tags" />
              <ul className="list-disc list-inside ml-2 space-y-1 font-light text-brand-black">
                {(font.tag || []).map((tag: string) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        {/* PERBAIKAN: Menghapus 'text-center' agar judul rata kiri */}
        <div>
          <SectionHeader title="You May Also Like" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {relatedFonts.map(relatedFont => (
            <ProductCard key={relatedFont.id} font={relatedFont} />
          ))}
        </div>
      </section>
    </div>
  );
}
