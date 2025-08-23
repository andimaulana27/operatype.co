// src/components/LicenseSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext'; // Import CartItem
import { Database } from '@/lib/database.types';
import { Tag } from 'lucide-react';
import toast from 'react-hot-toast';

type FontData = Database['public']['Tables']['fonts']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row'];

type LicenseSelectorProps = {
  font: FontData;
  activeDiscount: Discount | null;
};

type LicenseType = 'Desktop' | 'Business' | 'Corporate';

const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const LicenseSelector = ({ font, activeDiscount }: LicenseSelectorProps) => {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('Desktop');
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(font.price_desktop);
  const { addToCart } = useCart();

  useEffect(() => {
    let basePrice = 0;
    if (selectedLicense === 'Desktop') basePrice = font.price_desktop ?? 0;
    else if (selectedLicense === 'Business') basePrice = font.price_business ?? 0;
    else if (selectedLicense === 'Corporate') basePrice = font.price_corporate ?? 0;

    let finalPrice = basePrice * userCount;

    if (activeDiscount && activeDiscount.percentage) {
        finalPrice = finalPrice - (finalPrice * activeDiscount.percentage / 100);
    }

    setTotalPrice(finalPrice);
  }, [selectedLicense, userCount, font, activeDiscount]);

  const handleAddToCart = () => {
    const basePriceForLicenseType = (selectedLicense === 'Desktop' ? font.price_desktop : selectedLicense === 'Business' ? font.price_business : font.price_corporate) ?? 0;
    const originalPriceForSelection = basePriceForLicenseType * userCount;

    const itemToAdd: Omit<CartItem, 'id'> = {
      fontId: font.id,
      name: font.name,
      license: selectedLicense,
      price: totalPrice,
      originalPrice: originalPriceForSelection,
      users: userCount,
      imageUrl: font.main_image_url,
      discountName: activeDiscount?.name || null,
      discountPercentage: activeDiscount?.percentage || null,
      basePricePerUser: basePriceForLicenseType,
    };
    
    addToCart(itemToAdd);
    // PERBAIKAN: Baris toast.success dihapus dari sini.
    // Notifikasi sekarang ditangani sepenuhnya di dalam CartContext.
  };

  const getPriceForType = (type: LicenseType) => {
      let basePrice = 0;
      if (type === 'Desktop') basePrice = font.price_desktop ?? 0;
      else if (type === 'Business') basePrice = font.price_business ?? 0;
      else if (type === 'Corporate') basePrice = font.price_corporate ?? 0;
      
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
                <div className="font-medium text-right">
                    {priceInfo.discounted !== null ? (
                        <div>
                            <span className="text-gray-400 line-through text-sm">${priceInfo.original.toFixed(2)}</span>
                            <span className="text-brand-orange ml-2">${priceInfo.discounted.toFixed(2)}</span>
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
                        <button type="button" onClick={() => setUserCount(Math.max(1, userCount - 1))} className="px-3 py-1 text-lg">-</button>
                        <span className="font-medium text-brand-orange text-lg">{userCount}</span>
                        <button type="button" onClick={() => setUserCount(userCount + 1)} className="px-3 py-1 text-lg">+</button>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-medium">Choose Your License</h2>
      {activeDiscount && (
          <div className="my-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg">
            <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 flex-shrink-0"/>
                <p className="text-sm font-medium">
                    <span className="font-bold">{activeDiscount.name}</span> is active! Enjoy {activeDiscount.percentage}% off.
                </p>
            </div>
            <p className="text-xs text-green-700 mt-1 ml-7">
                Valid from {formatDate(activeDiscount.start_date)} to {formatDate(activeDiscount.end_date)}.
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
        className="w-full bg-brand-orange text-white text-lg font-medium py-4 rounded-full mt-6 hover:bg-brand-orange-hover transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default LicenseSelector;
