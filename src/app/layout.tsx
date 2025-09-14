// src/app/layout.tsx
import type { Metadata } from 'next'
// 1. Ganti cara impor font Poppins
import { Poppins } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import ToastNotifier from '@/components/ToastNotifier';

// 2. Konfigurasikan font di sini dengan semua bobot (weight) yang digunakan
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'], // Pastikan semua bobot terdaftar
  display: 'swap', // Tampilkan font cadangan selagi font utama dimuat
});

export const metadata: Metadata = {
  title: {
    default: 'Operatype - High Quality Script & Display Fonts',
    template: '%s | Operatype',
  },
  description: 'Discover a curated library of high-quality, versatile script and display fonts. Complete with full character sets and commercial licenses, ready for any project.',
  keywords: ['script fonts', 'display fonts', 'typography', 'font foundry', 'commercial fonts', 'operatype'],
  authors: [{ name: 'Operatype' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'RZZYhZYznBzZ549pRN5uIk9tFl9I5ZSLFREHY9HD310',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Operatype',
    'url': 'https://www.operatype.co',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://www.operatype.co/fonts?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "SiteNavigationElement", "position": 1, "name": "All Fonts", "url": "https://www.operatype.co/fonts" },
        { "@type": "SiteNavigationElement", "position": 2, "name": "About Us", "url": "https://www.operatype.co/about" },
        { "@type": "SiteNavigationElement", "position": 3, "name": "License", "url": "https://www.operatype.co/license" },
        { "@type": "SiteNavigationElement", "position": 4, "name": "Partners", "url": "https://www.operatype.co/partners" },
        { "@type": "SiteNavigationElement", "position": 5, "name": "Contact", "url": "https://www.operatype.co/contact" }
      ]
    }
  };

  return (
    <html lang="en">
      {/* 3. Terapkan className dari variabel font ke tag <body> */}
      <body className={poppins.className}>
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            success: {
              style: { background: '#28a745', color: 'white' },
            },
            error: {
              style: { background: '#dc3545', color: 'white' },
            },
          }}
        />
        <AuthProvider>
          <CartProvider>
            <ToastNotifier />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}