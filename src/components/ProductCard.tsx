// src/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';

// DIPERBARUI: Tipe props dibuat lebih fleksibel untuk menerima data asli dari database
type DiscountInfo = {
  discounts: {
    name: string | null;
    percentage: number | null;
  } | null;
};

type ProductCardProps = {
  font: {
    id: string;
    slug: string | null;
    name: string | null;
    main_image_url: string | null; // Diizinkan untuk null
    description: string | null;
    price_desktop: number | null;
    is_bestseller?: boolean | null;
    font_discounts: DiscountInfo[];
  };
};

const ProductCard = ({ font }: ProductCardProps) => {
  const truncateDescription = (text: string | null) => {
    if (!text) return 'No description available.';
    const firstSentence = text.split('.')[0];
    return `${firstSentence}.`;
  };

  const activeDiscount = font.font_discounts?.[0]?.discounts;
  const originalPrice = font.price_desktop || 0;
  let displayPrice = originalPrice;

  if (activeDiscount && activeDiscount.percentage) {
    displayPrice = originalPrice - (originalPrice * activeDiscount.percentage / 100);
  }

  return (
    <div className="group">
      <div className="relative w-full aspect-[1.4] bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Link href={`/fonts/${font.slug || ''}`}>
          {/* DIPERBARUI: Menambahkan gambar placeholder jika main_image_url null */}
          <Image
            src={font.main_image_url || '/placeholder.png'} 
            alt={`Preview of ${font.name || 'font'} font`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {font.is_bestseller && (
          <span className="absolute top-3 right-3 bg-brand-orange text-white text-xs font-medium px-2 py-1 rounded-full z-10">
            Bestseller
          </span>
        )}
        {activeDiscount && (
           <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <Tag size={12}/> {activeDiscount.percentage}% OFF
          </span>
        )}
      </div>
      <h3 className="text-xl font-medium text-brand-black">{font.name || 'Untitled Font'}</h3>
      <p className="text-brand-gray-1 font-light mt-1 h-12 overflow-hidden">
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
              <span className="text-green-600">${displayPrice.toFixed(2)}</span>
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