import Image from 'next/image';
import Link from 'next/link';

// Tipe properti disesuaikan dengan kolom di tabel 'fonts' Supabase
type ProductCardProps = {
  font: {
    id: string;
    slug: string;
    name: string;
    main_image_url: string;
    description: string;
    price_desktop: number;
    is_bestseller?: boolean; // Menggunakan is_bestseller (boolean)
  };
};

const ProductCard = ({ font }: ProductCardProps) => {
  return (
    <div className="group">
      <div className="relative w-full aspect-[1.4] bg-brand-gray-2 rounded-lg overflow-hidden mb-4">
        <Image
          src={font.main_image_url}
          alt={`Preview of ${font.name} font`}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {/* PERBAIKAN: Logika diubah menjadi pengecekan boolean sederhana */}
        {font.is_bestseller && (
          <span className="absolute top-3 right-3 bg-brand-orange text-white text-xs font-medium px-2 py-1 rounded-full">
            Bestseller
          </span>
        )}
      </div>
      <h3 className="text-xl font-medium text-brand-black">{font.name}</h3>
      <p className="text-brand-gray-1 font-light mt-1">{font.description}</p>
      <div className="flex justify-between items-center mt-3">
        <Link href={`/fonts/${font.slug}`}>
          <span className="bg-brand-orange text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-brand-orange-hover transition-colors">
            View Detail
          </span>
        </Link>
        <span className="text-lg font-medium text-brand-black">${font.price_desktop.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ProductCard;
