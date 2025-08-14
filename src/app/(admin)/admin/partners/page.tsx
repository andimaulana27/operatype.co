// src/app/(admin)/admin/partners/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/lib/database.types';
import { PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

// Tipe data dari database.types.ts
type Partner = Database['public']['Tables']['partners']['Row'];

const ITEMS_PER_PAGE = 10;

export default function ManagePartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fungsi untuk mengambil data dari Supabase
  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      let query = supabase.from('partners').select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('name', { ascending: true })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) {
        toast.error('Failed to fetch partners: ' + error.message);
      } else {
        setPartners(data || []);
      }
      setIsLoading(false);
    };

    const debounceFetch = setTimeout(() => {
      fetchPartners();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [currentPage, searchTerm]);
  
  // Fungsi hapus (sementara menggunakan confirm standar)
  const handleDelete = async (partnerId: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      const { error } = await supabase.from('partners').delete().eq('id', partnerId);
      if (error) {
        toast.error('Failed to delete partner: ' + error.message);
      } else {
        toast.success('Partner deleted successfully.');
        // Muat ulang data
        setPartners(prev => prev.filter(p => p.id !== partnerId));
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

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

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search partners by name..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg" 
          />
        </div>
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
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8">Loading partners...</td></tr>
            ) : partners.length > 0 ? partners.map((partner) => (
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
                  <Link href={`/admin/partners/edit/${partner.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(partner.id)} className="text-red-600 hover:text-red-900">
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
      
      {/* Pagination will go here */}
    </div>
  );
}