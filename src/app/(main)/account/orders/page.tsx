// src/app/(main)/account/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AccountPagination from '@/components/AccountPagination';
import { Database } from '@/lib/database.types'; // Impor tipe Database

// PERBAIKAN 1: Definisikan tipe baru sesuai skema 'purchases' dan relasinya
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  fonts: { name: string | null } | null;
};
type PurchaseHistory = Database['public']['Tables']['purchases']['Row'] & {
  order_items: OrderItem[];
};


const ITEMS_PER_PAGE = 10;

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [allPurchases, setAllPurchases] = useState<PurchaseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);

      // PERBAIKAN 2: Query ke tabel 'purchases' dan ambil data relasi dari 'order_items' dan 'fonts'
      const { data, error } = await supabase
        .from('purchases')
        .select(`*, order_items(*, fonts(name))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error('Failed to fetch order history.');
        console.error("Order history error:", error);
      } else {
        setAllPurchases(data as PurchaseHistory[] || []);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  })};

  const totalPages = Math.ceil(allPurchases.length / ITEMS_PER_PAGE);
  const paginatedPurchases = allPurchases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section>
      <h2 className="text-3xl font-medium text-brand-black mb-6">Order History</h2>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Products</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-16 text-brand-gray-1">Loading history...</td></tr>
              ) : paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(purchase.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{purchase.invoice_id || 'N/A'}</td>
                    {/* PERBAIKAN 3: Tampilkan semua nama font dalam satu sel */}
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">
                      {purchase.order_items.map(item => item.fonts?.name || 'N/A').join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${purchase.total_amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      {/* Pastikan link invoice menggunakan invoice_id dari tabel purchases */}
                      <Link href={`/api/invoices/${purchase.invoice_id}`} target="_blank" className="text-brand-orange hover:underline">View</Link>
                      <Link href={`/api/invoices/${purchase.invoice_id}?download=true`} target="_blank" className="text-brand-orange hover:underline">Download</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-16 text-brand-gray-1">You have no purchase history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <AccountPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </section>
  );
}