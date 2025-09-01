// src/app/(admin)/admin/partners/PartnerListClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { deletePartnerAction } from '@/app/actions/partnerActions';
import AdminPagination from '@/components/admin/AdminPagination';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

type Partner = Database['public']['Tables']['partners']['Row'];

interface PartnerListProps {
    initialPartners: Partner[];
    totalPages: number;
    currentPage: number;
}

export default function PartnerListClient({ initialPartners, totalPages, currentPage }: PartnerListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.replace(`/admin/partners?${params.toString()}`);
    }, 300);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        router.push(`/admin/partners?${params.toString()}`);
    };
    
    const openDeleteModal = (partner: Partner) => {
        setPartnerToDelete(partner);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPartnerToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = () => {
        if (!partnerToDelete) return;
        
        startTransition(async () => {
            const result = await deletePartnerAction(partnerToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Partner "${partnerToDelete.name}" deleted successfully!`);
                router.refresh();
            }
            closeDeleteModal();
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                isLoading={isPending}
                itemName={partnerToDelete?.name || ''}
                itemType="Partner"
            />

            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search partners by name..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subheadline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isPending && currentPage === 1 ? (
                            <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
                        ) : initialPartners.length > 0 ? initialPartners.map((partner) => (
                            <tr key={partner.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            className="h-12 w-12 rounded-full object-cover bg-gray-100"
                                            src={partner.logo_url || '/placeholder-logo.png'}
                                            alt={partner.name}
                                            width={48}
                                            height={48}
                                        />
                                        <div className="font-medium text-gray-900">{partner.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{partner.subheadline}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(partner.created_at)}</td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    {/* ==================== PERBAIKAN LINK ==================== */}
                                    <Link href={`/admin/partners/${partner.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        Edit
                                    </Link>
                                    {/* ======================================================= */}
                                    <button onClick={() => openDeleteModal(partner)} className="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-500">No partners found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <AdminPagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            )}
        </>
    );
}