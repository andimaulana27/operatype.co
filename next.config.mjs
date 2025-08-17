/** @type {import('next').NextConfig} */
const nextConfig = {
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
};
  
export default nextConfig;