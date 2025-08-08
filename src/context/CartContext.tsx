// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ToastNotification from '@/components/ToastNotification';

export type CartItem = {
  id: string;
  fontId: string;
  name: string;
  license: 'Desktop' | 'Business' | 'Corporate';
  price: number;
  users?: number;
  imageUrl: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  cartTotal: number;
  cartItemCount: number;
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// PERBAIKAN: Sintaks props yang salah telah diperbaiki
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    setCartTotal(total);
  }, [cartItems]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => i.id === item.id ? item : i);
      }
      return [...prevItems, item];
    });
    showToast(`${item.name} has been added to cart!`);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  const childrenWithToast = <>
    {children}
    <ToastNotification message={toastMessage} isVisible={isToastVisible} />
  </>

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        cartTotal,
        cartItemCount: cartItems.length,
        showToast
      }}
    >
      {childrenWithToast}
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
