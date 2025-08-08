// src/components/LicenseSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

type FontData = {
  id: string;
  name: string;
  main_image_url: string;
  price_desktop: number;
  price_business: number;
  price_corporate: number;
};

type LicenseSelectorProps = {
  font: FontData;
};

type LicenseType = 'Desktop' | 'Business' | 'Corporate';

const LicenseSelector = ({ font }: LicenseSelectorProps) => {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('Desktop');
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(font.price_desktop);
  const { addToCart, showToast } = useCart();

  useEffect(() => {
    let price = 0;
    if (selectedLicense === 'Desktop') price = font.price_desktop * userCount;
    else if (selectedLicense === 'Business') price = font.price_business * userCount;
    else if (selectedLicense === 'Corporate') price = font.price_corporate * userCount;
    setTotalPrice(price);
  }, [selectedLicense, userCount, font]);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${font.id}-${selectedLicense}-${userCount}`,
      fontId: font.id,
      name: font.name,
      license: selectedLicense,
      price: totalPrice,
      users: userCount,
      imageUrl: font.main_image_url,
    };
    addToCart(itemToAdd);
  };

  const LicenseOption = ({ type, price }: { type: LicenseType, price: number }) => (
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
        <span className="font-medium">${price.toFixed(2)}</span>
      </div>
      {/* PERBAIKAN: Number of Users muncul di bawah lisensi yang dipilih */}
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

  return (
    <div>
      <h2 className="text-2xl font-medium">Choose Your License</h2>
      <div className="border border-brand-gray-2 rounded-lg mt-4">
        <LicenseOption type="Desktop" price={font.price_desktop} />
        <LicenseOption type="Business" price={font.price_business} />
        <LicenseOption type="Corporate" price={font.price_corporate} />
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
