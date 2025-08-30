// src/app/(main)/page.tsx

// PERBAIKAN 1: Menambahkan revalidate = 0
// Baris ini memastikan halaman utama selalu mengambil data terbaru dari database
// setiap kali diakses. Ini akan menyelesaikan masalah diskon atau perubahan
// lain yang tidak langsung tampil.
export const revalidate = 0;

import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import SectionTitle from '@/components/SectionTitle';
import HeroCarousel from '@/components/HeroCarousel';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { FontWithDetailsForCard } from '@/components/ProductCard'; // Menggunakan tipe yang sama persis dengan ProductCard

// Fungsi untuk mengambil font yang ditandai sebagai "featured" di admin panel.
async function getFeaturedFonts(): Promise<FontWithDetailsForCard[]> {
  // PERBAIKAN 2: Query ini sudah benar dan akan mengambil semua data diskon terkait.
  const { data, error } = await supabase
    .from('fonts')
    .select('*, font_discounts(discounts(*))')
    .eq('homepage_section', 'featured')
    .order('homepage_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured fonts:', error);
    return [];
  }
  return data as FontWithDetailsForCard[];
}

// Fungsi untuk mengambil font yang ditandai sebagai "curated" di admin panel.
async function getCuratedFonts(): Promise<FontWithDetailsForCard[]> {
  const { data, error } = await supabase
    .from('fonts')
    .select('*, font_discounts(discounts(*))')
    .eq('homepage_section', 'curated')
    .order('homepage_order', { ascending: true });

  if (error) {
    console.error('Error fetching curated fonts:', error);
    return [];
  }
  return data as FontWithDetailsForCard[];
}

// --- DATA STATIS (Tidak ada perubahan) ---
const instagramImagesVersion = "1.1"; 
const styleImagesVersion = "1.1";

const styleImages = [
    `/images/previews/font-style-preview-1.jpg?v=${styleImagesVersion}`,
    `/images/previews/font-style-preview-2.png?v=${styleImagesVersion}`,
    `/images/previews/font-style-preview-3.png?v=${styleImagesVersion}`,
];
const instagramImages = [
  `/images/previews/instagram-preview-3.jpg?v=${instagramImagesVersion}`,
  `/images/previews/instagram-preview-2.jpg?v=${instagramImagesVersion}`,
  `/images/previews/instagram-preview-1.jpg?v=${instagramImagesVersion}`,
  `/images/previews/instagram-preview-4.jpg?v=${instagramImagesVersion}`,
  `/images/previews/instagram-preview-5.jpg?v=${instagramImagesVersion}`,
];

export default async function HomePage() {
  // Memanggil fungsi untuk mengambil data font terbaru.
  const featuredFonts = await getFeaturedFonts();
  const curatedFonts = await getCuratedFonts();

  return (
    <>
      {/* 1. Hero Section */}
      <section className="bg-brand-white text-center pt-20 pb-12">
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium text-brand-orange tracking-widest">THE ART OF SCRIPT FONTS</p>
          <h1 className="text-5xl font-medium text-brand-black mt-4">Elevate Your Designs</h1>
          <p className="text-lg font-light text-brand-gray-1 max-w-2xl mx-auto mt-6">
            A curated library of high-quality, versatile script fonts complete with full character sets and commercial licenses, ready for any project.
          </p>
          <div className="flex justify-center items-center space-x-4 mt-8">
            <Link href="/fonts" className="flex justify-center items-center w-52 bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors duration-300">
              Browse All Fonts
            </Link>
            <Link href="/about" className="flex justify-center items-center w-52 bg-transparent border border-brand-black text-brand-black font-medium py-3 px-8 rounded-full hover:bg-brand-black hover:text-white transition-colors duration-300">
              Our Story
            </Link>
          </div>
        </div>
      </section>
      
      <HeroCarousel />

      {/* 2. Our Featured Collection Section */}
      <section className="py-24 bg-brand-white">
        <div className="container mx-auto px-4">
          <SectionTitle title="Our Featured Collection" subtitle="A curated selection of our most popular and newest script fonts, handpicked for you." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Melewatkan data font lengkap ke ProductCard */}
            {featuredFonts.map(font => <ProductCard key={font.id} font={font} />)}
          </div>
          <div className="text-center mt-16">
            <Link href="/fonts" className="bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors">
              Browse All Fonts
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Curated Selections Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <SectionTitle title="Curated Selections" subtitle="Our handpicked fonts and community's bestsellers." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Melewatkan data font lengkap ke ProductCard */}
            {curatedFonts.map(font => <ProductCard key={font.id} font={font} />)}
          </div>
        </div>
      </section>
      
      {/* 4. Find Your Perfect Style Section */}
      <section className="py-24 bg-brand-white">
        <div className="container mx-auto px-4">
          <SectionTitle title="Find Your Perfect Style" subtitle="From elegant font to modern sans-serifs, browse our collection by the mood you want to create." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="overflow-hidden rounded-lg aspect-[1.33] relative">
                <Image src={styleImages[0]} alt="Elegant & Wedding style" fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <p className="mt-4 text-lg font-medium text-brand-black">Elegant & Wedding</p>
            </div>
            <div className="text-center group">
              <div className="overflow-hidden rounded-lg aspect-[1.33] relative">
                <Image src={styleImages[1]} alt="Casual & Handwritten style" fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <p className="mt-4 text-lg font-medium text-brand-black">Casual & Handwritten</p>
            </div>
            <div className="text-center group">
              <div className="overflow-hidden rounded-lg aspect-[1.33] relative">
                <Image src={styleImages[2]} alt="Modern & Bold style" fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <p className="mt-4 text-lg font-medium text-brand-black">Modern & Bold</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Licensing with Confidence Section */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-brand-black">
              <h2 className="text-4xl font-medium">Licensing with Confidence</h2>
              <p className="font-light mt-4 text-brand-black">The Right Rights for Your Vision.</p>
              <ul className="space-y-6 mt-8">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 pt-1 flex-shrink-0">
                    <Image src="/icons/checklist.svg" alt="Checklist Icon" width={24} height={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">For Individuals & Brands</h4>
                    <p className="font-light text-brand-black">Perfect for your portfolio, client work, social media, and commercial products. Our standard licenses cover the most common creative needs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 pt-1 flex-shrink-0">
                    <Image src="/icons/checklist.svg" alt="Checklist Icon" width={24} height={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">For Enterprise & Special Projects</h4>
                    <p className="font-light text-brand-black">For use in apps, games, broadcast television, or for company-wide installations, we provide tailored enterprise-level solutions.</p>
                  </div>
                </li>
              </ul>
              <div className="flex space-x-4 mt-8">
                <Link href="/license" className="bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors">Explore Standard Licenses</Link>
                <Link href="/contact" className="bg-transparent border border-brand-black text-brand-black font-medium py-3 px-8 rounded-full hover:bg-brand-black hover:text-white transition-colors">Request a Custom License</Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <Image src="/images/pages/license-composite.jpg" alt="Licensing Options" width={600} height={450} className="rounded-lg w-full h-auto"/>
            </div>
          </div>
        </div>
      </section>
      
      {/* 6. Join Our Creative Community Section */}
      <section className="py-24 bg-brand-white">
        <div className="container mx-auto px-4 text-center">
          <SectionTitle title="Join Our Creative Community" subtitle="Follow us @operatype.co on Instagram for daily design inspiration, new font previews, and behind-the-scenes." />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {instagramImages.map((img, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden group">
                <Image src={img} alt={`Instagram Post ${index + 1}`} fill sizes="20vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
            ))}
          </div>
           <div className="text-center mt-12">
            <a href="https://www.instagram.com/operatype.co" target="_blank" rel="noopener noreferrer" className="bg-brand-orange text-white font-medium py-3 px-8 rounded-full hover:bg-brand-orange-hover transition-colors">
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
