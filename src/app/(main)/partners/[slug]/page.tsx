// src/app/(main)/partners/[slug]/page.tsx
import PartnerDetailPageClient from './client';

// Ini adalah Server Component. Tugasnya hanya mengambil 'slug' dari URL
// dan meneruskannya sebagai properti ke Client Component.
export default function PartnerDetailPage({ params }: { params: { slug: string } }) {
  return <PartnerDetailPageClient slug={params.slug} />;
}
