// src/components/ProductCard.tsx
'use client';

import Image, { ImageLoaderProps } from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Discount = Database['public']['Tables']['discounts']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];

export type FontWithDetailsForCard = Font & {
  font_discounts: { discounts: Discount | null }[];
};

type ProductCardProps = {
  font: FontWithDetailsForCard;
  priority?: boolean;
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

const getActiveDiscount = (fontDiscounts: FontWithDetailsForCard['font_discounts'] | null): Discount | null => {
    if (!fontDiscounts || fontDiscounts.length === 0) {
        return null;
    }
    
    // PERBAIKAN: Hanya mengecek apakah diskon aktif (is_active), 
    // menghapus pengecekan start_date dan end_date agar realtime.
    const activeDiscountRelation = fontDiscounts.find(fd => {
        const discount = fd.discounts;
        return discount && discount.is_active;
    });

    return activeDiscountRelation ? activeDiscountRelation.discounts : null;
};

const ProductCard = ({ font, priority = false }: ProductCardProps) => {
  const truncateDescription = (text: string | null) => {
    if (!text) return 'No description available.';
    const firstSentence = text.split('.')[0];
    return `${firstSentence}.`;
  };

  const activeDiscount = getActiveDiscount(font.font_discounts);
  const originalPrice = font.price_desktop || 0;
  
  let displayPrice = originalPrice;
  if (activeDiscount && activeDiscount.percentage) {
    displayPrice = originalPrice - (originalPrice * activeDiscount.percentage / 100);
  }

  return (
    <div className="group">
      <div className="relative w-full aspect-[1.4] bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Link href={`/fonts/${font.slug || ''}`}>
          <Image
            loader={supabaseImageLoader}
            src={font.main_image_url || '/placeholder.png'}
            alt={`Preview of ${font.name || 'font'} font`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            unoptimized // Mematikan optimasi Vercel, mendelegasikan beban ke Supabase
          />
        </Link>
        {font.is_bestseller && (
          <span className="absolute top-3 right-3 bg-brand-orange text-white text-xs font-medium px-2 py-1 rounded-full z-10">
            Bestseller
          </span>
        )}
        {activeDiscount && activeDiscount.percentage && (
           <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <Tag size={12}/> {activeDiscount.percentage}% OFF
          </span>
        )}
      </div>

      <h3 className="text-xl font-medium text-brand-black">{font.name || 'Untitled Font'}</h3>
      <p className="text-brand-gray-1 font-light mt-1 h-12 overflow-hidden text-ellipsis">
        {truncateDescription(font.description)}
      </p>
      
      <div className="flex justify-between items-center mt-3">
        <Link href={`/fonts/${font.slug || ''}`}>
          <span className="bg-brand-orange text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-brand-orange-hover transition-colors">
            View Detail
          </span>
        </Link>
        <div className="text-lg font-medium text-brand-black text-right">
          {activeDiscount ? (
            <div>
              <span className="text-gray-400 line-through text-base mr-2">${originalPrice.toFixed(2)}</span>
              <span className="text-brand-orange">${displayPrice.toFixed(2)}</span>
            </div>
          ) : (
            <span>${originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;