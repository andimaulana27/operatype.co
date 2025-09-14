// src/app/(admin)/admin/partners/page.tsx

// Jadikan Server Component untuk load data awal yang cepat
import Link from 'next/link';
import { Database } from '@/lib/database.types';
import { PlusCircle } from 'lucide-react';
import { getPartnersAction } from '@/app/actions/partnerActions';
import PartnerListClient from './PartnerListClient'; // Komponen baru untuk interaktivitas

type Partner = Database['public']['Tables']['partners']['Row'];
const ITEMS_PER_PAGE = 10;

export default async function ManagePartnersPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const currentPage = Number(searchParams.page) || 1;
    const searchTerm = String(searchParams.search || '');

    // Ambil data di server
    const { data, count } = await getPartnersAction({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchTerm,
    });

    const partners = data as Partner[] || [];
    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manage Partners</h1>
                    <div className="w-20 h-1 bg-brand-orange my-4"></div>
                    <p className="text-gray-500 mt-1">Add, edit, and manage all your font partners.</p>
                </div>
                <Link href="/admin/partners/new">
                    <span className="bg-brand-orange text-white font-medium py-2 px-4 rounded-lg hover:bg-brand-orange-hover transition-colors flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Add New Partner
                    </span>
                </Link>
            </div>
            {/* Kirim data ke komponen klien untuk interaktivitas (pencarian, hapus, dll) */}
            <PartnerListClient
                initialPartners={partners}
                totalPages={totalPages}
                currentPage={currentPage}
            />
        </div>
    );
}