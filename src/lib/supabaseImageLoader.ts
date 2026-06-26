// src/lib/supabaseImageLoader.ts

// Definisikan interface yang ketat sesuai bawaan Next.js Image Loader
export interface SupabaseImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export const supabaseImageLoader = ({ src, width, quality }: SupabaseImageLoaderProps): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables.');
  }

  // Jika src sudah berupa URL lengkap dari Supabase (misal dari database), 
  // kita perlu mengekstrak path-nya saja.
  let imagePath = src;
  const storagePath = '/storage/v1/object/public/';
  
  if (src.includes(storagePath)) {
    imagePath = src.split(storagePath)[1];
  }

  // Parameter transformasi dari Supabase
  const params = new URLSearchParams();
  params.set('width', width.toString());
  params.set('quality', (quality || 75).toString());
  params.set('resize', 'contain'); // Menjaga aspek rasio

  return `${supabaseUrl}/storage/v1/render/image/public/${imagePath}?${params.toString()}`;
};