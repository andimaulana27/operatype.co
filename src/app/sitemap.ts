// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

// Fungsi untuk membuat sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.operatype.co';

  // Inisialisasi Supabase client (hanya untuk membaca data publik)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Ambil semua data font yang sudah di-publish
  const { data: fonts } = await supabase
    .from('fonts')
    .select('slug, created_at')
    .eq('status', 'Published');

  // 2. Ambil semua data partner
  const { data: partners } = await supabase
    .from('partners')
    .select('slug, created_at');

  // Buat URL dinamis untuk setiap font
  const fontUrls = fonts?.map(font => ({
    url: `${baseUrl}/fonts/${font.slug}`,
    lastModified: new Date(font.created_at).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) ?? [];

  // Buat URL dinamis untuk setiap partner
  const partnerUrls = partners?.map(partner => ({
    url: `${baseUrl}/partners/${partner.slug}`,
    lastModified: new Date(partner.created_at).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) ?? [];

  // 3. Definisikan URL statis (halaman utama, tentang, lisensi, dll)
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/license`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
        url: `${baseUrl}/contact`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.5,
    },
    {
        url: `${baseUrl}/fonts`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        url: `${baseUrl}/partners`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
    },
  ];

  // Gabungkan semua URL
  return [...staticUrls, ...fontUrls, ...partnerUrls];
}