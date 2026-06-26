// src/components/FontImageGallery.tsx
'use client';

import { useState } from 'react';
import Image, { ImageLoaderProps } from 'next/image';

type FontImageGalleryProps = {
  mainImage: string;
  galleryImages: string[];
};

// Loader khusus untuk mentransformasi gambar menggunakan server Supabase
const supabaseImageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  if (!src.includes('supabase.co')) return src; // Kembalikan src asli jika bukan dari Supabase
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || src.split('/storage')[0];
  let imagePath = src;
  const storagePath = '/storage/v1/object/public/';
  
  if (src.includes(storagePath)) {
    imagePath = src.split(storagePath)[1];
  } else {
    return src; // Fallback jika format URL tidak sesuai ekspektasi
  }

  const params = new URLSearchParams();
  params.set('width', width.toString());
  params.set('quality', (quality || 75).toString());
  params.set('resize', 'cover');

  return `${supabaseUrl}/storage/v1/render/image/public/${imagePath}?${params.toString()}`;
};

const FontImageGallery = ({ mainImage, galleryImages }: FontImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(mainImage);
  const allImages = [mainImage, ...galleryImages];

  return (
    <div>
      <div className="relative w-full aspect-video bg-brand-gray-2 rounded-lg overflow-hidden">
        <Image 
          loader={supabaseImageLoader}
          src={activeImage} 
          alt="Main font preview" 
          fill 
          className="object-cover" // Menggantikan layout="fill" & objectFit="cover" yang usang
          priority 
          unoptimized // Mematikan optimasi Vercel
        />
      </div>
      
      {/* Previews dengan scroll horizontal */}
      <div className="mt-4 w-full overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {allImages.slice(0, 25).map((img, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-24 h-24 bg-brand-gray-2 rounded-md overflow-hidden cursor-pointer border-2 group"
              style={{ borderColor: activeImage === img ? '#C8705C' : 'transparent' }}
              onClick={() => setActiveImage(img)}
            >
              <Image 
                loader={supabaseImageLoader}
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                fill 
                className="object-cover" // Menggantikan layout="fill" & objectFit="cover" yang usang
                unoptimized // Mematikan optimasi Vercel
              />
              
              {/* Overlay untuk gambar tidak aktif */}
              {activeImage !== img && (
                <div className="absolute inset-0 bg-white/50 group-hover:bg-white/20 transition-colors"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontImageGallery;