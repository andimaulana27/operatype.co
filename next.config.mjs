/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... (konfigurasi Anda yang lain tidak berubah)
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

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 
              "default-src 'self' *.paypal.com *.supabase.co;" +
              // Kita tetap membutuhkan 'unsafe-eval' & 'unsafe-inline' untuk PayPal,
              // namun kita bisa lebih spesifik di arahan lain.
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.paypal.com;" + 
              "img-src 'self' data: https:;" +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
              "font-src 'self' https://fonts.gstatic.com;" +
              "frame-src 'self' *.paypal.com;" +
              "object-src 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // --- PERBAIKAN DI SINI ---
            key: 'Referrer-Policy',
            // Mengubah ke nilai yang lebih ketat dan direkomendasikan
            value: 'strict-origin-when-cross-origin', 
            // -------------------------
          },
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