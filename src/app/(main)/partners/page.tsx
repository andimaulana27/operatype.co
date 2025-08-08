// src/app/(main)/partners/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import SectionTitle from '@/components/SectionTitle';
import { supabase } from '@/lib/supabaseClient';

// Tipe data untuk Partner
type Partner = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
};

// Fungsi untuk mengambil data semua partner
async function getPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*');

  if (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
  return data;
}

const PartnerCard = ({ name, description, logoUrl, slug }: { name: string; description: string; logoUrl: string; slug: string; }) => (
  <div className="text-center flex flex-col items-center">
    <div className="relative w-full h-24 mb-6">
      <Image src={logoUrl} alt={`${name} logo`} layout="fill" objectFit="contain" />
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
                description={partner.description}
                logoUrl={partner.logo_url}
                slug={partner.slug}
              />
            ))
          ) : (
            <p className="text-center col-span-3">No partners found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
