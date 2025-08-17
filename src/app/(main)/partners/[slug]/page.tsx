import PartnerDetailPageClient from './client';
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { FontWithDetailsForCard } from '@/components/ProductCard';

type Partner = Database['public']['Tables']['partners']['Row'];

const ITEMS_PER_PAGE = 24;

// Fungsi untuk mengambil data awal di server
async function getInitialPartnerData(slug: string) {
  // 1. Ambil data partner
  const { data: partnerData, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('slug', slug)
    .single();

  if (partnerError || !partnerData) {
    return notFound(); // Tampilkan halaman 404 jika partner tidak ditemukan
  }

  // 2. Ambil halaman pertama font dari partner tersebut
  const { data: fontsData, error: fontsError, count } = await supabase
    .from('fonts')
    .select('*, font_discounts(discounts(*))', { count: 'exact' }) // Query sudah diperbaiki di sini
    .eq('partner_id', partnerData.id)
    .eq('status', 'Published')
    .order('created_at', { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);
  
  if (fontsError) {
    console.error("Error fetching initial fonts:", fontsError);
    // Kita tetap bisa render halaman meski font gagal dimuat
    return { partner: partnerData, initialFonts: [], initialCount: 0 };
  }

  return { 
    partner: partnerData, 
    initialFonts: fontsData as FontWithDetailsForCard[], 
    initialCount: count || 0 
  };
}

// Komponen sekarang async
export default async function PartnerDetailPage({ params }: { params: { slug: string } }) {
  const { partner, initialFonts, initialCount } = await getInitialPartnerData(params.slug);
  
  // Kirim data awal sebagai props ke Client Component
  return <PartnerDetailPageClient 
            partner={partner} 
            initialFonts={initialFonts} 
            initialCount={initialCount} 
         />;
}