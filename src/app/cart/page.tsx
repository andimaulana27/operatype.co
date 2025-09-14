// src/app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import { Tag } from 'lucide-react';
import PayPalWrapper from '@/components/PayPalButtons';

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const { user, profile, loading } = useAuth();

  const originalTotal = cartItems.reduce((total, item) => total + (item.originalPrice || item.price), 0);
  const totalSavings = originalTotal - cartTotal;
  
  const LoggedInAs = () => {
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
        );
    }
    if (user) {
        return (
            <>
                <p><span className="font-light">Full Name :</span> {profile?.full_name || 'N/A'}</p>
                <p><span className="font-light">Email Address :</span> {user.email}</p>
            </>
        );
    }
    return <Link href="/login?next=/cart" className="text-brand-orange hover:underline">Please log in to continue.</Link>;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-medium text-brand-black">Check-Out</h1>
        <div className="w-20 h-0.5 bg-brand-orange mx-auto mt-4"></div>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 text-center rounded-lg p-6 my-8">
        <h3 className="font-medium text-orange-600">Don&apos;t miss out on these deals!</h3>
        <p className="text-sm text-orange-500 mt-2">Prices will change when the clock runs out, shop now before it&apos;s too late.</p>
        <CountdownTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div>
          <h2 className="text-2xl font-medium text-brand-black mb-6">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b border-brand-gray-2 pb-4">
                  <div className="w-20 h-20 bg-brand-gray-2 rounded-md overflow-hidden relative">
                    <Image src={item.imageUrl || '/placeholder.png'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-brand-gray-1">{item.license} License {item.users && `(${item.users} Users)`}</p>
                    
                    {item.discountPercentage && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-green-600 font-semibold">
                           <Tag size={12}/>
                           <span>{item.discountName} ({item.discountPercentage}% Off)</span>
                        </div>
                    )}
                    
                    <button onClick={() => removeFromCart(item.id)} className="text-sm text-orange-600 hover:underline mt-2">
                      Remove
                    </button>
                  </div>
                  <div className="font-medium text-right">
                    {item.discountPercentage ? (
                        <div>
                            <span className="text-gray-400 line-through text-sm">${item.originalPrice.toFixed(2)}</span>
                            <span className="text-brand-black ml-2">${item.price.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span>${item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-gray-1">Your cart is empty.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-gray-2/50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Logged in As</h3>
            <LoggedInAs />
          </div>
          
          <div className="border border-brand-black rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-center text-md">
              <span className="text-gray-600">Subtotal</span>
              <span>${originalTotal.toFixed(2)}</span>
            </div>
             {totalSavings > 0 && (
                 <div className="flex justify-between items-center text-md text-green-600">
                    <span className="font-medium">Discount Savings</span>
                    <span className="font-medium">-${totalSavings.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between items-center text-xl font-medium border-t border-brand-gray-2 pt-3 mt-3">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            
            {/* ==================== PERBAIKAN UTAMA DI SINI ==================== */}
            {loading ? (
              // 1. Tampilkan tombol loading saat data user sedang diperiksa
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-medium py-4 rounded-full cursor-not-allowed animate-pulse"
              >
                Loading User...
              </button>
            ) : user ? (
              // 2. Jika user sudah login, tampilkan tombol PayPal
              <PayPalWrapper />
            ) : (
              // 3. Jika user belum login, tampilkan tombol yang mengarah ke halaman login
              <Link href="/login?next=/cart" className="w-full block">
                <button
                  className="w-full bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover transition-colors"
                >
                  Login to Continue Checkout
                </button>
              </Link>
            )}
            {/* =================================================================== */}
            
            <p className="text-xs text-brand-gray-1 mt-4 text-center">
              Your receipt and download links will be sent to your dashboard profile after purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}