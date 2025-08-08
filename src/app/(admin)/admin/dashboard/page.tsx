// src/app/(admin)/admin/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Fungsi untuk mengambil data statistik
async function getStats() {
  const supabase = createServerComponentClient({ cookies });

  // Menghitung total font
  const { count: fontCount } = await supabase
    .from('fonts')
    .select('*', { count: 'exact', head: true });

  // Menghitung total partner
  const { count: partnerCount } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true });
    
  // Contoh data statis untuk earnings dan top selling, karena tabel orders belum tentu ada isinya
  const monthlyEarnings = 1250.75;
  const topFonts = [
    { name: 'Grande Amstera', sales: 152 },
    { name: 'Royales Horizon', sales: 131 },
  ];

  return { fontCount, partnerCount, monthlyEarnings, topFonts };
}


const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
  </div>
);


export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="w-24 h-1 bg-brand-orange my-4"></div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Monthly Earnings" value={`$${stats.monthlyEarnings.toFixed(2)}`} />
        <StatCard title="Total Fonts" value={stats.fontCount || 0} />
        <StatCard title="Total Partners" value={stats.partnerCount || 0} />
      </div>

      {/* Nanti di sini kita akan tambahkan grafik dan tabel top selling */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800">Sales Analytics (Last 7 Days)</h3>
          {/* Placeholder untuk grafik */}
          <div className="h-64 flex items-center justify-center text-gray-400">Chart will be here</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800">Top 5 Best Selling Fonts</h3>
           <ul className="mt-4 space-y-2">
            {stats.topFonts.map(font => (
              <li key={font.name} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50">
                <span className="text-gray-700">{font.name}</span>
                <span className="font-semibold text-gray-800">{font.sales} sales</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
