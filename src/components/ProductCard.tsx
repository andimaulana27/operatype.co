// src/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';

// DIPERBARUI: Menambahkan tipe data untuk diskon
type DiscountInfo = {
  discounts: {
    name: string | null;
    percentage: number | null;
  } | null;
};

type ProductCardProps = {
  font: {
    id: string;
    slug: string;
    name: string;
    main_image_url: string;
    description: string;
    price_desktop: number;
    is_bestseller?: boolean;
    // Tambahkan relasi font_discounts ke tipe
    font_discounts: DiscountInfo[];
  };
};

const ProductCard = ({ font }: ProductCardProps) => {
  // BARU: Logika untuk memotong deskripsi menjadi satu kalimat
  const truncateDescription = (text: string) => {
    if (!text) return '';
    // Ambil teks sampai titik pertama, lalu tambahkan titiknya kembali
    const firstSentence = text.split('.')[0];
    return `${firstSentence}.`;
  };

  // BARU: Logika untuk menghitung harga diskon
  const activeDiscount = font.font_discounts?.[0]?.discounts;
  const originalPrice = font.price_desktop;
  let displayPrice = originalPrice;

  if (activeDiscount && activeDiscount.percentage) {
    displayPrice = originalPrice - (originalPrice * activeDiscount.percentage / 100);
  }

  return (
    <div className="group">
      <div className="relative w-full aspect-[1.4] bg-brand-gray-2 rounded-lg overflow-hidden mb-4">
        <Link href={`/fonts/${font.slug}`}>
          <Image
            src={font.main_image_url}
            alt={`Preview of ${font.name} font`}
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
        {/* BARU: Menampilkan badge diskon */}
        {activeDiscount && (
           <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <Tag size={12}/> {activeDiscount.percentage}% OFF
          </span>
        )}
      </div>
      <h3 className="text-xl font-medium text-brand-black">{font.name}</h3>
      <p className="text-brand-gray-1 font-light mt-1 h-12 overflow-hidden">
        {truncateDescription(font.description)}
      </p>
      <div className="flex justify-between items-center mt-3">
        <Link href={`/fonts/${font.slug}`}>
          <span className="bg-brand-orange text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-brand-orange-hover transition-colors">
            View Detail
          </span>
        </Link>
        {/* DIPERBARUI: Tampilan harga dengan logika diskon */}
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