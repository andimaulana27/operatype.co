// src/app/(admin)/admin/dashboard/page.tsx
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import SalesChart from '@/components/admin/SalesChart';

// Mengambil tipe data dari database.types.ts
type Profile = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];

// Tipe gabungan untuk pesanan terbaru
type OrderWithDetails = Order & {
  profiles: Pick<Profile, 'full_name'> | null;
  fonts: { name: string }[] | null;
};

// --- Fungsi Pengambilan Data Dinamis ---

async function getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthOrders, error: monthError } = await supabase
        .from('orders')
        .select('amount')
        .gte('created_at', thirtyDaysAgo.toISOString());

    // DIPERBARUI: Query ini sekarang menghitung total pelanggan (bukan admin)
    const { count: totalCustomersCount, error: profilesError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .neq('role', 'admin'); // <-- Kondisi untuk tidak menghitung admin

    const { count: fontCount, error: fontError } = await supabase
        .from('fonts')
        .select('id', { count: 'exact' });
        
    const totalRevenue = monthOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    return {
        totalRevenue: totalRevenue,
        totalOrders: monthOrders?.length || 0,
        totalCustomers: totalCustomersCount || 0, // <-- Nama properti diubah
        totalFonts: fontCount || 0,
    };
}

async function getRecentOrders(): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error("Error fetching recent orders:", error);
        return [];
    }
    return data as any[] as OrderWithDetails[];
}

async function getTopSellingFonts() {
    const { data, error } = await supabase
        .from('orders')
        .select('fonts(name)')
        .limit(100);

    if (error || !data) return [];
    
    const salesCount = data.reduce((acc, order) => {
        const fontName = order.fonts?.[0]?.name;
        if (fontName) {
            acc[fontName] = (acc[fontName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, sales]) => ({ name, sales }));
}

async function getSalesDataForChart() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
        .from('orders')
        .select('created_at, amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching sales data:", error);
        return [];
    }
    
    const salesByDay = data.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        const amount = order.amount || 0;
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += amount;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(salesByDay).map(([name, sales]) => ({
        name,
        sales: parseFloat(sales.toFixed(2)),
    }));
}


const StatCard = ({ title, value, change }: { title: string, value: string | number, change?: string }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
    {change && <p className="text-xs text-green-500 mt-1">{change}</p>}
  </div>
);


export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders();
  const topFonts = await getTopSellingFonts();
  const salesData = await getSalesDataForChart();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="w-24 h-1 bg-brand-orange my-4"></div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard title="Total Revenue (Last 30 Days)" value={`$${stats.totalRevenue.toFixed(2)}`} />
        <StatCard title="Total Orders (Last 30 Days)" value={stats.totalOrders} />
        {/* DIPERBARUI: Judul dan nilai kartu diubah */}
        <StatCard title="Total Customers" value={stats.totalCustomers} />
        <StatCard title="Total Fonts" value={stats.totalFonts} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Analytics (Last 7 Days)</h3>
          <SalesChart data={salesData} />
        </div>

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

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-medium text-brand-orange hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.profiles?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${order.amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
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