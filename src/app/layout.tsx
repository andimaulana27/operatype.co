// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext'; // <-- 1. IMPORT AUTH PROVIDER

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '500'],
});

export const metadata: Metadata = {
  title: 'Operatype.co - High Quality Fonts',
  description: 'Crafting high quality fonts with passion and precision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* 2. BUNGKUS SEMUANYA DENGAN AUTH PROVIDER */}
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
