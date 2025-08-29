// src/components/LicenseSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { Database } from '@/lib/database.types';
import { Tag, Check, CheckCircle2, Minus, Plus } from 'lucide-react';

type FontData = Database['public']['Tables']['fonts']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row'];

type LicenseSelectorProps = {
  font: FontData;
  activeDiscount: Discount | null;
};

type LicenseType = 'Desktop' | 'Standard Commercial' | 'Extended Commercial' | 'Corporate';

const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// ==================== PERBAIKAN 1: DATA LISENSI YANG LEBIH DETAIL ====================
const licenseDetails = {
    'Desktop': {
        description: "Untuk penggunaan personal & proyek non-komersial.",
        features: [
            "Proyek pribadi (tugas sekolah, portofolio)",
            "Penggunaan di perangkat pribadi",
            "Satu pengguna (user)",
        ]
    },
    'Standard Commercial': {
        description: "Untuk freelancer, desainer, dan bisnis skala kecil.",
        features: [
            "Proyek komersial & personal tanpa batas",
            "Penggunaan untuk logo & branding klien",
            "Produk cetak untuk dijual (baju, stiker, dll)",
            "1 User / 2 Perangkat",
        ]
    },
    'Extended Commercial': {
        description: "Untuk agensi, startup, dan kreator konten digital.",
        features: [
            "Semua fitur lisensi Standard",
            "Web Embedding (hingga 1 juta views/bulan)",
            "Penggunaan di Aplikasi & Game (hingga 100rb download)",
            "Max 5 Users / 5 Perangkat",
        ]
    },
    'Corporate': {
        description: "Untuk perusahaan skala menengah hingga besar.",
        features: [
            "Semua fitur lisensi Extended",
            "Web Embedding & Aplikasi tanpa batas",
            "Penggunaan untuk siaran TV & Iklan Skala besar",
            "Max 20 Users",
        ]
    }
};
// =================================================================================

const LicenseSelector = ({ font, activeDiscount }: LicenseSelectorProps) => {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('Desktop');
  const [userCount, setUserCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(font.price_desktop);
  const { addToCart } = useCart();

  const getBasePrice = (type: LicenseType) => {
    switch (type) {
      case 'Desktop':
        return font.price_desktop ?? 0;
      case 'Standard Commercial':
        return font.price_standard_commercial ?? 0;
      case 'Extended Commercial':
        return font.price_extended_commercial ?? 0;
      case 'Corporate':
        return font.price_corporate ?? 0;
      default:
        return 0;
    }
  };

  useEffect(() => {
    let currentUserCount = 1;
    if (selectedLicense === 'Standard Commercial') currentUserCount = 1;
    else if (selectedLicense === 'Extended Commercial') currentUserCount = 5;
    else if (selectedLicense === 'Corporate') currentUserCount = 20;
    else currentUserCount = userCount;

    const basePrice = getBasePrice(selectedLicense);
    let finalPrice = basePrice; 

    if (activeDiscount && activeDiscount.percentage) {
        finalPrice = finalPrice - (finalPrice * activeDiscount.percentage / 100);
    }

    setTotalPrice(finalPrice);
    if (selectedLicense !== 'Desktop') setUserCount(currentUserCount);

  }, [selectedLicense, userCount, font, activeDiscount]);

  const handleAddToCart = () => {
    const basePriceForLicenseType = getBasePrice(selectedLicense);

    const itemToAdd: Omit<CartItem, 'id'> = {
      fontId: font.id,
      name: font.name,
      license: selectedLicense,
      price: totalPrice,
      originalPrice: basePriceForLicenseType * userCount,
      users: userCount,
      imageUrl: font.main_image_url,
      discountName: activeDiscount?.name || null,
      discountPercentage: activeDiscount?.percentage || null,
      basePricePerUser: basePriceForLicenseType,
    };
    
    addToCart(itemToAdd);
  };

  const getPriceForType = (type: LicenseType) => {
      const basePrice = getBasePrice(type);
      
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
    const details = licenseDetails[type];
    const isActive = selectedLicense === type;

    return (
        <div 
            onClick={() => setSelectedLicense(type)}
            className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-300 ${isActive ? 'bg-orange-50/50 border-brand-orange shadow-sm' : 'hover:bg-gray-50'}`}
        >
            <div
                className="flex items-start justify-between"
            >
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className={`w-6 h-6 border-2 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200
                        ${isActive ? 'border-brand-orange bg-brand-orange' : 'border-gray-300 bg-white'}`}>
                        {isActive && <Check size={16} className="text-white" />}
                    </div>
                    <div>
                        <span className="font-semibold text-lg text-brand-black">{type}</span>
                        <p className="text-sm text-brand-gray-1">{details.description}</p>
                    </div>
                </div>
                <div className="font-medium text-right flex-shrink-0 ml-4">
                    {priceInfo.discounted !== null ? (
                        <div className="flex flex-col items-end">
                            <span className="text-gray-400 line-through text-sm">${priceInfo.original.toFixed(2)}</span>
                            <span className="text-brand-orange text-lg font-bold">${priceInfo.discounted.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span className="text-brand-black text-lg font-bold">${priceInfo.original.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* ==================== PERBAIKAN 2: TAMPILAN DETAIL BARU ==================== */}
            {isActive && (
                <div className="pl-10 pt-4 mt-4 border-t border-gray-200">
                    <ul className="space-y-2">
                        {details.features.map((feature, i) => (
                             <li key={i} className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {type === 'Desktop' && (
                         <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <span className="font-semibold text-brand-black">Number of Users:</span>
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); setUserCount(Math.max(1, userCount - 1)); }} 
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                > <Minus size={16} /> </button>
                                <span className="font-bold text-brand-orange text-lg w-8 text-center">{userCount}</span>
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); setUserCount(userCount + 1); }} 
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                > <Plus size={16} /> </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* ================================================================================= */}
        </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Choose Your License</h2>
      
      {activeDiscount && (
          <div className="my-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-start gap-3">
            <Tag className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
            <div>
                <p className="text-sm font-medium">
                    <span className="font-bold">{activeDiscount.name}</span> is active! Enjoy <span className="font-bold">{activeDiscount.percentage}% off</span> all licenses.
                </p>
                <p className="text-xs text-green-700 mt-1">
                    Valid from {formatDate(activeDiscount.start_date)} to {formatDate(activeDiscount.end_date)}.
                </p>
            </div>
          </div>
      )}

      <div className="space-y-3 mt-4">
        <LicenseOption type="Desktop" />
        <LicenseOption type="Standard Commercial" />
        <LicenseOption type="Extended Commercial" />
        <LicenseOption type="Corporate" />
      </div>
      
      <div className="flex justify-between items-center mt-6 py-4 border-t border-gray-200">
        <span className="text-2xl font-semibold text-gray-800">Total</span>
        <span className="text-2xl font-bold text-brand-orange">${totalPrice.toFixed(2)}</span>
      </div>

      <button 
        onClick={handleAddToCart}
        className="w-full bg-brand-orange text-white text-lg font-medium py-3 rounded-full mt-4 hover:bg-brand-orange-hover transition-colors shadow-md"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default LicenseSelector;