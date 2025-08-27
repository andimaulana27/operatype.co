// src/app/(main)/account/orders/OrderHistoryDisplay.tsx
'use client';

import { useRouter } from 'next/navigation';
import AccountPagination from '@/components/AccountPagination';
import type { Order } from './page';
import Link from 'next/link'; // <-- Impor Link

type OrderHistoryDisplayProps = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
};

export default function OrderHistoryDisplay({ orders, totalPages, currentPage }: OrderHistoryDisplayProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/account/orders?page=${page}`);
  };

  return (
    <section>
      <h2 className="text-3xl font-medium text-brand-black mb-6">Order History</h2>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-brand-gray-1">
            <thead className="text-xs text-brand-black uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Invoice ID</th>
                <th scope="col" className="px-6 py-3">Products</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-brand-black">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">{order.invoice_id || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {order.order_items
                        ?.map(item => item.fonts?.name)
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4">${order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4">
                      {/* ==================== PERBAIKAN DI SINI ==================== */}
                      {/* Mengubah <a> menjadi <Link> yang mengarah ke halaman dinamis */}
                      <Link 
                        href={`/account/orders/${order.invoice_id}`} 
                        className="font-medium text-brand-orange hover:underline"
                      >
                        View
                      </Link>
                      {/* ========================================================== */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    You have no order history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <AccountPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
}