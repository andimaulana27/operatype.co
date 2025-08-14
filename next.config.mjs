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
  experimental: {
    serverActions: true, // Diaktifkan secara eksplisit
  },
  eslint: {
    // PERINGATAN: Opsi ini akan membuat proses build berhasil,
    // bahkan jika proyek Anda memiliki error dari ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;