/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- KONFIGURASI LAMA ANDA TETAP ADA ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdatempkonebloyfiukj.supabase.co',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // --- PENAMBAHAN HEADER KEAMANAN DI SINI ---
  async headers() {
    return [
      {
        // Terapkan header ini ke semua rute di aplikasi Anda.
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: 
              "default-src 'self' *.paypal.com *.supabase.co;" + // Default: hanya izinkan dari domain sendiri, PayPal, dan Supabase
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.paypal.com;" + // Izinkan skrip dari domain sendiri & PayPal
              "img-src 'self' data: https:;" + // Izinkan gambar dari mana saja (https)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" + // Izinkan gaya dari domain sendiri & Google Fonts
              "font-src 'self' https://fonts.gstatic.com;" + // Izinkan font dari domain sendiri & Google Fonts
              "frame-src 'self' *.paypal.com;" + // Izinkan iframe dari domain sendiri & PayPal
              "object-src 'none';", // Jangan izinkan <object>
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
  
export default nextConfig;