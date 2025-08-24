// src/app/(main)/account/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AccountPagination from '@/components/AccountPagination'; // Impor Paginasi

type OrderHistory = {
  id: string; created_at: string; license_type: string | null; amount: number | null; invoice_id: string | null;
  fonts: { name: string | null } | null;
};

const ITEMS_PER_PAGE = 10; // Tentukan jumlah item per halaman

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase.from('orders').select(`*, fonts (name)`).eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) {
        toast.error('Failed to fetch order history.');
      } else {
        setAllOrders(data as OrderHistory[] || []);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [user]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = allOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-16 text-brand-gray-1">Loading history...</td></tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.invoice_id || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.fonts?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      <Link href={`/api/invoices/${item.invoice_id}`} target="_blank" className="text-brand-orange hover:underline">View</Link>
                      <Link href={`/api/invoices/${item.invoice_id}?download=true`} target="_blank" className="text-brand-orange hover:underline">Download</Link>
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
      <AccountPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
}