// src/app/(admin)/admin/orders/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Mengambil tipe asli dari Supabase untuk konsistensi
type Order = Database['public']['Tables']['orders']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];

// DIPERBARUI: Tipe data gabungan yang lebih akurat sesuai dengan query
type OrderWithDetails = Order & {
  profiles: Pick<Profile, 'full_name'> | null; // Hanya mengambil 'full_name'
  fonts: Pick<Font, 'name' | 'main_image_url'> | null;
};

const ITEMS_PER_PAGE = 15;

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      
      // DIPERBARUI: Query sekarang HANYA mengambil 'full_name' dari tabel profiles,
      // karena 'email' tidak ada di tabel tersebut. Ini memperbaiki error utama.
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *, 
          profiles (full_name),
          fonts (name, main_image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch orders: ' + error.message);
      } else {
        setOrders(data || []);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  // DIPERBARUI: Logika pencarian yang lebih aman dan disesuaikan dengan data yang ada
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    return orders.filter(order => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const customerName = order.profiles?.full_name?.toLowerCase() || '';
      const fontName = order.fonts?.name?.toLowerCase() || '';

      // Pencarian tidak lagi menyertakan email karena tidak diambil dalam query
      return customerName.includes(lowerCaseSearch) || 
             fontName.includes(lowerCaseSearch);
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

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
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">View and manage all customer orders.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by customer or font name..." 
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading orders...</td></tr>
            ) : paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {/* DIPERBARUI: Tidak lagi menampilkan email */}
                  <div className="font-medium text-gray-900">{order.profiles?.full_name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Image 
                            src={order.fonts?.main_image_url || '/placeholder.png'} 
                            alt={order.fonts?.name || 'Font'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover bg-gray-100"
                        />
                        <span className="font-medium text-gray-800">{order.fonts?.name || 'Font not found'}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.license_type}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                  {/* Menggunakan 'amount' sesuai nama kolom di database Anda */}
                  ${(order.amount)?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">
                Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">
                Next
            </button>
        </div>
      )}
    </div>
  );
}