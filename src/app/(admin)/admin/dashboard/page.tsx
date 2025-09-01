// src/app/(admin)/admin/dashboard/page.tsx

import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import SalesChart from '@/components/admin/SalesChart';

// Tipe data dan fungsi-fungsi pengambilan data tidak perlu diubah
type Profile = Database['public']['Tables']['profiles']['Row'];
type Purchase = Database['public']['Tables']['purchases']['Row'];

type PurchaseWithDetails = Purchase & {
  profiles: Pick<Profile, 'full_name'> | null;
};

async function getDashboardStats(supabase: SupabaseClient<Database>) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthPurchases } = await supabase
        .from('purchases')
        .select('total_amount')
        .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: totalCustomersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .neq('role', 'admin');

    const { count: fontCount } = await supabase
        .from('fonts')
        .select('id', { count: 'exact' });
        
    const totalRevenue = monthPurchases?.reduce((sum: number, purchase) => sum + (purchase.total_amount || 0), 0) || 0;
    const totalOrders = monthPurchases?.length || 0;

    return { totalRevenue, totalOrders, totalCustomers: totalCustomersCount || 0, totalFonts: fontCount || 0 };
}

async function getRecentPurchases(supabase: SupabaseClient<Database>): Promise<PurchaseWithDetails[]> {
    const { data, error } = await supabase
        .from('purchases')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) { console.error("Error fetching recent purchases:", error); return []; }
    return data as PurchaseWithDetails[];
}

async function getTopSellingFonts(supabase: SupabaseClient<Database>) {
    const { data, error } = await supabase
        .from('order_items')
        .select('fonts(name)')
        .limit(100);

    if (error || !data) return [];
    
    const salesCount = data.reduce((acc: Record<string, number>, item: { fonts: { name: string | null } | null }) => {
        const fontName = item.fonts?.name;
        if (fontName) {
            acc[fontName] = (acc[fontName] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(salesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, sales]) => ({ name, sales }));
}

async function getSalesDataForChart(supabase: SupabaseClient<Database>) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
        .from('purchases')
        .select('created_at, total_amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    if (error) { console.error("Error fetching sales data:", error); return []; }
    
    const salesByDay = data
        .filter((purchase): purchase is { created_at: string; total_amount: number | null } => purchase.created_at !== null)
        .reduce((acc: Record<string, number>, purchase) => {
            const date = new Date(purchase.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            const amount = purchase.total_amount || 0;
            acc[date] = (acc[date] || 0) + amount;
            return acc;
        }, {});

    return Object.entries(salesByDay).map(([name, sales]) => ({
        name,
        sales: sales,
    }));
}

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
  </div>
);

export default async function DashboardPage() {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // ==================== PERBAIKAN KINERJA ====================
  // Jalankan semua promise pengambilan data secara paralel, bukan berurutan.
  const [stats, recentPurchases, topFonts, salesData] = await Promise.all([
    getDashboardStats(supabaseAdmin),
    getRecentPurchases(supabaseAdmin),
    getTopSellingFonts(supabaseAdmin),
    getSalesDataForChart(supabaseAdmin)
  ]);
  // =========================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  return (
    <div>
      {/* Bagian JSX (tampilan) tidak perlu diubah */}
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="w-24 h-1 bg-brand-orange my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <StatCard title="Total Revenue (Last 30 Days)" value={`$${stats.totalRevenue.toFixed(2)}`} />
        <StatCard title="Total Orders (Last 30 Days)" value={stats.totalOrders} />
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
              {recentPurchases.map(purchase => (
                <tr key={purchase.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.profiles?.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(purchase.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${purchase.total_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
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