// src/components/FontImageGallery.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';

type FontImageGalleryProps = {
  mainImage: string;
  galleryImages: string[];
};

const FontImageGallery = ({ mainImage, galleryImages }: FontImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(mainImage);
  const allImages = [mainImage, ...galleryImages];

  return (
    <div>
      <div className="relative w-full aspect-video bg-brand-gray-2 rounded-lg overflow-hidden">
        <Image src={activeImage} alt="Main font preview" layout="fill" objectFit="cover" priority />
      </div>

      {/* PERBAIKAN: Sub Previews dengan scroll horizontal */}
      <div className="mt-4 w-full overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {allImages.slice(0, 25).map((img, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-24 h-24 bg-brand-gray-2 rounded-md overflow-hidden cursor-pointer border-2 group"
              style={{ borderColor: activeImage === img ? '#C8705C' : 'transparent' }}
              onClick={() => setActiveImage(img)}
            >
              <Image src={img} alt={`Thumbnail ${index + 1}`} layout="fill" objectFit="cover" />
              {/* PERBAIKAN: Overlay untuk gambar tidak aktif */}
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
