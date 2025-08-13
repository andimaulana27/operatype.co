// src/components/LicenseSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Database } from '@/lib/database.types';
import { Tag } from 'lucide-react';

// Menggunakan tipe data dari Supabase untuk konsistensi
type FontData = Database['public']['Tables']['fonts']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row'];

// DIPERBARUI: Menambahkan 'activeDiscount' ke props
type LicenseSelectorProps = {
  font: FontData;
  activeDiscount: Discount | null;
};

type LicenseType = 'Desktop' | 'Business' | 'Corporate';

const LicenseSelector = ({ font, activeDiscount }: LicenseSelectorProps) => {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('Desktop');
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(font.price_desktop);
  const { addToCart } = useCart();

  // DIPERBARUI: Logika kalkulasi harga sekarang memperhitungkan diskon
  useEffect(() => {
    let basePrice = 0;
    if (selectedLicense === 'Desktop') basePrice = font.price_desktop;
    else if (selectedLicense === 'Business') basePrice = font.price_business;
    else if (selectedLicense === 'Corporate') basePrice = font.price_corporate;

    let finalPrice = basePrice * userCount;

    if (activeDiscount && activeDiscount.percentage) {
        finalPrice = finalPrice - (finalPrice * activeDiscount.percentage / 100);
    }

    setTotalPrice(finalPrice);
  }, [selectedLicense, userCount, font, activeDiscount]);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${font.id}-${selectedLicense}-${userCount}`,
      fontId: font.id,
      name: font.name,
      license: selectedLicense,
      price: totalPrice,
      users: userCount,
      imageUrl: font.main_image_url,
      // Menambahkan info diskon jika ada, untuk ditampilkan di keranjang nanti
      discountName: activeDiscount?.name || null,
      discountPercentage: activeDiscount?.percentage || null,
    };
    addToCart(itemToAdd);
  };

  const getPriceForType = (type: LicenseType) => {
      let basePrice = 0;
      if (type === 'Desktop') basePrice = font.price_desktop;
      else if (type === 'Business') basePrice = font.price_business;
      else if (type === 'Corporate') basePrice = font.price_corporate;
      
      if (activeDiscount && activeDiscount.percentage) {
          return {
              original: basePrice,
              discounted: basePrice - (basePrice * activeDiscount.percentage / 100)
          };
      }
      return { original: basePrice, discounted: null };
  };

  const LicenseOption = ({ type }: { type: LicenseType }) => {
    const priceInfo = getPriceForType(type);
    return (
        <div className="border-b border-brand-gray-2 last:border-b-0">
            <div
                onClick={() => setSelectedLicense(type)}
                className="flex items-center justify-between p-4 cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-2 border-brand-gray-1 rounded flex items-center justify-center">
                        {selectedLicense === type && <div className="w-3 h-3 bg-brand-orange rounded-sm"></div>}
                    </div>
                    <span className="font-medium">{type} License</span>
                </div>
                {/* DIPERBARUI: Tampilan harga dengan logika diskon */}
                <div className="font-medium text-right">
                    {priceInfo.discounted !== null ? (
                        <div>
                            <span className="text-gray-400 line-through text-sm">${priceInfo.original.toFixed(2)}</span>
                            <span className="text-green-600 ml-2">${priceInfo.discounted.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span>${priceInfo.original.toFixed(2)}</span>
                    )}
                </div>
            </div>
            {selectedLicense === type && (
                <div className="flex justify-between items-center p-4 bg-brand-gray-2/50 border-t border-brand-gray-2">
                    <span className="text-sm font-medium">Number of Users:</span>
                    <div className="flex items-center gap-2 border border-brand-gray-1 rounded-full">
                        <button onClick={() => setUserCount(Math.max(1, userCount - 1))} className="px-3 py-1 text-lg">-</button>
                        <span className="font-medium text-brand-orange text-lg">{userCount}</span>
                        <button onClick={() => setUserCount(userCount + 1)} className="px-3 py-1 text-lg">+</button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-medium">Choose Your License</h2>
      {/* BARU: Menampilkan notifikasi jika ada diskon aktif */}
      {activeDiscount && (
          <div className="my-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
            <Tag className="w-5 h-5"/>
            <p className="text-sm font-medium">
                <span className="font-bold">{activeDiscount.name}</span> is active! Enjoy {activeDiscount.percentage}% off.
            </p>
          </div>
      )}
      <div className="border border-brand-gray-2 rounded-lg mt-4">
        <LicenseOption type="Desktop" />
        <LicenseOption type="Business" />
        <LicenseOption type="Corporate" />
      </div>
      
      <div className="flex justify-between items-center mt-6 text-2xl font-medium">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-full bg-brand-orange text-white text-lg font-medium py-4 rounded-full mt-6 hover:bg-brand-orange-hover"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default LicenseSelector;