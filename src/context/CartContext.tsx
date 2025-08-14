// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast'; // DIPERBARUI: Menggunakan react-hot-toast

// DIPERBARUI: Menambahkan properti diskon ke tipe CartItem
export interface CartItem {
  id: string;
  fontId: string;
  name: string;
  license: string;
  price: number;
  users: number;
  imageUrl: string | null;
  originalPrice: number; // Harga asli sebelum diskon
  discountName: string | null; // Nama promo diskon
  discountPercentage: number | null; // Persentase diskon
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // BARU: Memuat keranjang dari localStorage saat aplikasi pertama kali dibuka
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('operatype-cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        return [];
      }
    }
    return [];
  });

  // BARU: Menyimpan keranjang ke localStorage setiap kali ada perubahan
  useEffect(() => {
    try {
        localStorage.setItem('operatype-cart', JSON.stringify(cartItems));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Cek apakah item dengan ID yang sama persis (termasuk lisensi dan jumlah user) sudah ada
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        toast.error(`${item.name} (${item.license}) is already in your cart.`);
        return prevItems; // Jangan tambahkan jika sudah ada
      }
      return [...prevItems, item];
    });
    // Notifikasi toast sudah ditangani oleh LicenseSelector, jadi tidak perlu di sini
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success('Item removed from cart.');
  };
  
  // Kalkulasi total harga berdasarkan harga akhir (yang mungkin sudah didiskon)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        cartTotal,
        itemCount: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};