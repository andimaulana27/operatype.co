// src/components/LicenseSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { Database } from '@/lib/database.types';
import { Tag, Check, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

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

const licenseDetails = {
    'Desktop': {
        description: "For personal & non-commercial use.",
        allowed: ["School projects, personal portfolio designs, hobby posters, resumes", "Printed materials for personal use"],
        notAllowed: ["Use in commercial products (for sale, business content)", "Creation of logos, websites, apps, or client projects", "Use by more than 1 person", "Modification and redistribution of the font file"]
    },
    'Standard Commercial': {
        description: "Suitable for freelancers, small businesses, and independent designers.",
        allowed: ["Client design work (branding, packaging, logos)", "Business social media content, YouTube thumbnails", "Print design (t-shirts, stickers, banners, books)", "Static websites (JPG/PNG images, not .woff embedding)", "Maximum 1 active user / 2 devices"],
        notAllowed: ["Web embedding (.woff / .woff2 / .eot / .svg)", "Mobile apps or games", "Use by teams/agencies without additional licenses"]
    },
    'Extended Commercial': {
        description: "For small agencies, startups, or large-scale digital content creators.",
        allowed: ["Includes everything in Standard, plus:", "Web embedding (.woff / .woff2), up to 1M pageviews/month", "Mobile apps (up to 100,000 downloads)", "Paid digital products (e-books, templates, asset bundles)", "Broadcast & ads: TV, YouTube Ads, TikTok, Instagram Reels", "Up to 5 active users / 5 devices"],
        notAllowed: ["Use in AI training projects", "Use in open-source platforms", "Reselling or redistributing as a standalone product"]
    },
    'Corporate': {
        description: "For medium to large companies (national/international brands).",
        allowed: ["Includes everything in Extended, plus:", "Large-scale corporate branding (logos, packaging, interior, signage)", "Main websites, microsites, and internal systems", "Internal and external apps with unlimited downloads", "Use in TV ads, billboards, and Digital Out of Home (DOOH) campaigns", "Up to 20 active users"],
        notAllowed: ["Company name must be provided at the time of purchase."]
    }
}

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
    const basePrice = getBasePrice(selectedLicense);
    let finalPrice = basePrice * userCount;

    if (activeDiscount && activeDiscount.percentage) {
        finalPrice = finalPrice - (finalPrice * activeDiscount.percentage / 100);
    }

    setTotalPrice(finalPrice);
  }, [selectedLicense, userCount, font, activeDiscount]);

  const handleAddToCart = () => {
    const basePriceForLicenseType = getBasePrice(selectedLicense);
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
    // ==================== BARIS INI DIHAPUS ====================
    // toast.success(`${font.name} (${selectedLicense}) added to cart!`);
    // =========================================================
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
        <div className={`
            border-b border-gray-200 last:border-b-0 
            transition-all duration-300 ease-in-out
            ${isActive ? 'bg-gray-50' : 'hover:bg-gray-100'}
        `}>
            <div
                onClick={() => setSelectedLicense(type)}
                className="flex items-start justify-between p-4 cursor-pointer"
            >
                <div className="flex items-start gap-3">
                    <div className={`
                        w-5 h-5 border-2 rounded-full flex-shrink-0 mt-1 
                        flex items-center justify-center transition-all duration-200
                        ${isActive ? 'border-brand-orange bg-brand-orange' : 'border-gray-300 bg-white'}
                    `}>
                        {isActive && <Check size={14} className="text-white" />}
                    </div>
                    <div>
                        <span className="font-medium text-gray-800">{type}</span>
                        <p className="text-sm text-gray-500 mt-0.5">{details.description}</p>
                    </div>
                </div>
                <div className="font-medium text-right flex-shrink-0 ml-4">
                    {priceInfo.discounted !== null ? (
                        <div className="flex flex-col items-end">
                            <span className="text-gray-400 line-through text-sm">${priceInfo.original.toFixed(2)}</span>
                            <span className="text-brand-orange font-semibold">${priceInfo.discounted.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span className="text-gray-800 font-semibold">${priceInfo.original.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {isActive && (
                <div className="p-4 pt-0">
                    <div className="flex justify-between items-center py-4 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Number of Users:</span>
                        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-1 py-0.5">
                            <button 
                                type="button" 
                                onClick={() => setUserCount(Math.max(1, userCount - 1))} 
                                className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                -
                            </button>
                            <span className="font-medium text-brand-orange text-base px-2">{userCount}</span>
                            <button 
                                type="button" 
                                onClick={() => setUserCount(userCount + 1)} 
                                className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                <Check size={16} className="text-green-600"/> Allowed:
                            </h4>
                            <ul className="space-y-2">
                                {details.allowed.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
                                        <span className="text-gray-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-semibold mb-2 flex items-center gap-2 ${type === 'Corporate' ? 'text-blue-700' : 'text-red-700'}`}>
                                {type === 'Corporate' ? <Info size={16} className="text-blue-600"/> : <X size={16} className="text-red-600"/>} 
                                {type === 'Corporate' ? 'Important Note:' : 'Not Allowed:'}
                            </h4>
                            <ul className="space-y-2">
                                {details.notAllowed.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        {type === 'Corporate' 
                                            ? <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0"/> 
                                            : <X size={16} className="text-red-600 mt-0.5 flex-shrink-0"/>
                                        }
                                        <span className="text-gray-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Choose Your License</h2>
      
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

      <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
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
        className="w-full bg-brand-orange text-white text-lg font-medium py-3 rounded-full mt-6 hover:bg-brand-orange-hover transition-colors shadow-md"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default LicenseSelector;