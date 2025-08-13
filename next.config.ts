// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdatempkonebloyfiukj.supabase.co', 
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
  eslint: {
    // PERINGATAN: Opsi ini akan membuat proses build berhasil,
    // bahkan jika proyek Anda memiliki error dari ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
