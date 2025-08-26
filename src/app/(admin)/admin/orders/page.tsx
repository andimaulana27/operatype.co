// src/app/(admin)/admin/orders/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Database } from '@/lib/database.types';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPagination from '@/components/admin/AdminPagination';
import { getAdminOrdersAction } from '@/app/actions/orderActions'; // PERBAIKAN: Import Server Action

// Tipe data disesuaikan dengan apa yang dikembalikan oleh action
type Purchase = Database['public']['Tables']['purchases']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type PurchaseWithDetails = Purchase & {
  profiles: Pick<Profile, 'full_name' | 'email'> | null;
  order_items: { count: number }[];
};

const ITEMS_PER_PAGE = 15;

export default function ManageOrdersPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [isLoading, startTransition] = useTransition(); // PERBAIKAN: Menggunakan useTransition
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // PERBAIKAN: Menggunakan useEffect untuk memanggil Server Action
  useEffect(() => {
    const fetchPurchases = async () => {
      startTransition(async () => {
        const result = await getAdminOrdersAction(currentPage, ITEMS_PER_PAGE, searchTerm);

        if (result.error) {
          toast.error('Failed to fetch orders: ' + result.error);
          setPurchases([]);
          setTotalOrders(0);
        } else if (result.data) {
          setPurchases(result.data as PurchaseWithDetails[]);
          setTotalOrders(result.count || 0);
        }
      });
    };

    fetchPurchases();
  }, [currentPage, searchTerm]); // Efek ini akan berjalan saat halaman atau term pencarian berubah

  // PERBAIKAN: Logika filter dan paginasi di sisi klien dihapus karena sudah ditangani server
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

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
          <p className="text-gray-500 mt-1">View and manage all customer purchases.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by customer name, email, or invoice ID..." 
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading orders...</td></tr>
            ) : purchases.length > 0 ? purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{purchase.profiles?.full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{purchase.profiles?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{purchase.invoice_id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{purchase.order_items[0]?.count || 0}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                  ${(purchase.total_amount)?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(purchase.created_at)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No orders found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && totalPages > 1 && (
        <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}