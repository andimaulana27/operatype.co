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
};

export default nextConfig;
