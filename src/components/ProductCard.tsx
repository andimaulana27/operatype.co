// src/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Database } from '@/lib/database.types';

// Define the types needed for the component
type Discount = Database['public']['Tables']['discounts']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];
export type FontWithDetailsForCard = Font & {
  font_discounts: { discounts: Discount | null }[];
};

type ProductCardProps = {
  font: FontWithDetailsForCard;
};

// Helper function to find the currently active discount
const getActiveDiscount = (fontDiscounts: FontWithDetailsForCard['font_discounts'] | null): Discount | null => {
    if (!fontDiscounts || fontDiscounts.length === 0) {
        return null;
    }
    const now = new Date();
    // Find the first valid and active discount
    const activeDiscountRelation = fontDiscounts.find(fd => {
        const discount = fd.discounts;
        if (discount && discount.is_active) {
            const startDate = discount.start_date ? new Date(discount.start_date) : null;
            const endDate = discount.end_date ? new Date(discount.end_date) : null;
            
            const isStarted = !startDate || now >= startDate;
            const isNotExpired = !endDate || now <= endDate;
            
            return isStarted && isNotExpired;
        }
        return false;
    });
    return activeDiscountRelation ? activeDiscountRelation.discounts : null;
};

const ProductCard = ({ font }: ProductCardProps) => {
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