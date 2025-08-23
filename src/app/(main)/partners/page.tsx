// src/app/(main)/partners/page.tsx

// PERBAIKAN: Menambahkan revalidate = 0
// Baris ini akan memaksa Next.js untuk selalu mengambil data partner terbaru
// dari database setiap kali halaman ini dibuka. Ini akan menyelesaikan masalah
// di mana partner yang sudah dihapus masih muncul.
export const revalidate = 0;

import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/SectionTitle';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types'; // Impor tipe Database

// Menggunakan tipe Partner dari file definisi tipe
type Partner = Database['public']['Tables']['partners']['Row'];

// Fungsi untuk mengambil data semua partner
async function getPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name', { ascending: true }); // Menambahkan pengurutan agar konsisten

  if (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
  return data || [];
}

const PartnerCard = ({ name, description, logoUrl, slug }: { name: string; description: string; logoUrl: string | null; slug: string; }) => (
  <div className="text-center flex flex-col items-center">
    <div className="relative w-full h-24 mb-6">
      {/* Menambahkan placeholder jika logo_url null */}
      <Image src={logoUrl || '/placeholder-logo.png'} alt={`${name} logo`} layout="fill" objectFit="contain" />
    </div>
    <h3 className="text-2xl font-medium text-brand-black">{name}</h3>
    <p className="font-light text-brand-gray-1 mt-2 max-w-xs mx-auto">{description}</p>
    <Link href={`/partners/${slug}`}>
      <span className="inline-block mt-4 text-brand-orange font-medium hover:underline">
        View Fonts &rarr;
      </span>
    </Link>
  </div>
);

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 py-16">
        <SectionTitle 
          title="Our Partners"
          subtitle="Meet the talented designers and foundries we are proud to collaborate with."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          {partners.length > 0 ? (
            partners.map(partner => (
              <PartnerCard 
                key={partner.id}
                name={partner.name}
                description={partner.subheadline}
                logoUrl={partner.logo_url}
                slug={partner.slug}
              />
            ))
          ) : (
            <p className="text-center col-span-3 text-brand-gray-1">No partners have been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
