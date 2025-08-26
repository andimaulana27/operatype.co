// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '500'],
});

// ==================== PERBAIKAN SEO DI SINI ====================
export const metadata: Metadata = {
  // Judul default untuk situs Anda
  title: {
    default: 'Operatype.co - High Quality Script & Display Fonts',
    template: '%s | Operatype.co', // Template untuk halaman lain (contoh: "About Us | Operatype.co")
  },
  // Deskripsi yang akan muncul di bawah judul pada hasil pencarian Google
  description: 'Discover a curated library of high-quality, versatile script and display fonts. Complete with full character sets and commercial licenses, ready for any project.',
  // Kata kunci untuk membantu Google memahami konten situs Anda
  keywords: ['script fonts', 'display fonts', 'typography', 'font foundry', 'commercial fonts', 'operatype'],
  // Informasi pembuat situs
  authors: [{ name: 'Operatype.co' }],
  // Ikon yang akan muncul di tab browser
  icons: {
    icon: '/favicon.ico?v=1.0',
  },
}
// ===============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
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