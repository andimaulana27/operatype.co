// src/context/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// Tipe data untuk item di keranjang
export interface CartItem {
  id: string;
  fontId: string;
  name: string;
  license: string;
  price: number;
  users: number;
  imageUrl: string | null;
  originalPrice: number;
  discountName: string | null;
  discountPercentage: number | null;
  basePricePerUser: number; 
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void; // 1. Tambahkan fungsi clearCart
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
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

  const prevCartItems = usePrevious(cartItems);

  useEffect(() => {
    if (prevCartItems === undefined) {
      return;
    }

    if (cartItems.length > prevCartItems.length) {
      const newItem = cartItems[cartItems.length - 1];
      toast.success(`${newItem.name} (${newItem.license}) added to cart!`);
    } else if (cartItems.length === prevCartItems.length && cartItems.length > 0) {
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].users !== prevCartItems[i].users) {
          const updatedItem = cartItems[i];
          toast.success(`${updatedItem.name} (${updatedItem.license}) updated to ${updatedItem.users} users.`);
          break;
        }
      }
    }
    
    try {
        localStorage.setItem('operatype-cart', JSON.stringify(cartItems));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems, prevCartItems]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setCartItems(prevItems => {
      const itemId = `${newItem.fontId}-${newItem.license}`;
      const existingItem = prevItems.find(i => i.id === itemId);

      if (existingItem) {
        return prevItems.map(item => {
          if (item.id === itemId) {
            const newUsers = item.users + newItem.users;
            const newOriginalPrice = item.basePricePerUser * newUsers;
            let newFinalPrice = newOriginalPrice;
            if (item.discountPercentage) {
              newFinalPrice = newOriginalPrice - (newOriginalPrice * item.discountPercentage / 100);
            }
            return { ...item, users: newUsers, originalPrice: newOriginalPrice, price: newFinalPrice };
          }
          return item;
        });
      } else {
        return [...prevItems, { ...newItem, id: itemId }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    if (itemToRemove) {
      toast.success(`${itemToRemove.name} removed from cart.`);
    }
  };

  // 2. Definisikan logika untuk clearCart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('operatype-cart');
  };
  
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        clearCart, // 3. Sediakan clearCart ke dalam context
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