// src/app/(admin)/admin/dashboard/page.tsx
'use client'; // Recharts memerlukan Client Component

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- Komponen-komponen Kecil untuk Dashboard ---
const StatCard = ({ title, value, change }: { title: string, value: string | number, change?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
    {change && <p className="text-xs text-green-500 mt-1">{change}</p>}
  </div>
);

// --- Contoh Data Statis (Nanti akan kita buat dinamis) ---
const salesData = [
  { name: 'Mon', sales: 15 },
  { name: 'Tue', sales: 25 },
  { name: 'Wed', sales: 45 },
  { name: 'Thu', sales: 30 },
  { name: 'Fri', sales: 60 },
  { name: 'Sat', sales: 75 },
  { name: 'Sun', sales: 50 },
];

const recentOrders = [
    { id: 'ORD-001', customer: 'Andi Maulana', date: '2025-08-10', total: '$15.00', status: 'Completed' },
    { id: 'ORD-002', customer: 'Budi Santoso', date: '2025-08-10', total: '$45.00', status: 'Completed' },
    { id: 'ORD-003', customer: 'Cinta Lestari', date: '2025-08-09', total: '$150.00', status: 'Completed' },
];

const topFonts = [
    { name: 'Grande Amstera', sales: 152 },
    { name: 'Royales Horizon', sales: 131 },
    { name: 'Butterfly Friends', sales: 110 },
    { name: 'Flower Blossom', sales: 98 },
    { name: 'Artfully Stylish', sales: 85 },
];
// --- Akhir Data Statis ---


export default function DashboardPage() {
  // Untuk saat ini, kita gunakan data statis. Nanti kita akan buat fungsi async untuk mengambil data asli.
  // const stats = await getStats(); 

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="w-24 h-1 bg-brand-orange my-4"></div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard title="Total Revenue (This Month)" value="$1,250.75" change="+12.5% from last month" />
        <StatCard title="Total Orders (This Month)" value="83" change="+5.0% from last month" />
        <StatCard title="New Customers (This Month)" value="27" />
        <StatCard title="Total Fonts" value="15" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Grafik Penjualan (Kolom lebih besar) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#C8705C" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Font Terlaris (Kolom lebih kecil) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800">Top Selling Fonts</h3>
           <ul className="mt-4 space-y-2">
            {topFonts.map(font => (
              <li key={font.name} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50">
                <span className="text-gray-700">{font.name}</span>
                <span className="font-semibold text-gray-800">{font.sales} sales</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
