// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast'; // BARU: 1. Import Toaster

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
        {/* BARU: 2. Tambahkan komponen Toaster di sini */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            success: {
              style: {
                background: '#28a745',
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#dc3545',
                color: 'white',
              },
            },
          }}
        />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}