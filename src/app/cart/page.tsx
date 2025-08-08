// src/app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();
  const { user, profile, logout } = useAuth(); // Ambil 'profile'

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-medium text-brand-black">Check-Out</h1>
        <div className="w-20 h-0.5 bg-brand-orange mx-auto mt-4"></div>
      </div>
      
      <div className="bg-orange-50 border border-orange-200 text-center rounded-lg p-6 my-8">
        <h3 className="font-medium text-orange-600">Don't miss out on these deals!</h3>
        <p className="text-sm text-orange-500 mt-2">Prices will change when the clock runs out, shop now before it's too late.</p>
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
                    <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-brand-gray-1">{item.license} License {item.users && `(${item.users} Users)`}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-sm text-orange-600 hover:underline">
                      Remove
                    </button>
                  </div>
                  <div className="font-medium">
                    ${item.price.toFixed(2)}
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
            {/* PERBAIKAN: Menampilkan nama dari profile */}
            {user ? (
              <>
                <p><span className="font-light">Full Name :</span> {profile?.full_name || 'N/A'}</p>
                <p><span className="font-light">Email Address :</span> {user.email}</p>
                <button 
                  onClick={logout}
                  className="text-sm text-brand-orange hover:underline mt-2"
                >
                  Not you? Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-brand-orange hover:underline">Please log in to continue.</Link>
            )}
          </div>
          
          <div className="border border-brand-black rounded-lg p-4 flex justify-between items-center text-xl font-medium">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            <button className="w-full bg-brand-orange text-white text-lg font-medium py-4 rounded-full hover:bg-brand-orange-hover">
              Pay with PayPal
            </button>
            <p className="text-xs text-brand-gray-1 mt-4 text-center">
              Your receipt and download links will be sent to this your dashboard profile after purchase.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
