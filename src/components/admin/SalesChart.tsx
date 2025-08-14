// src/components/admin/SalesChart.tsx
'use client';

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

// BARU: Mendefinisikan tipe untuk data yang diterima
type ChartData = {
  name: string;
  sales: number;
};

type SalesChartProps = {
  data: ChartData[];
};

export default function SalesChart({ data }: SalesChartProps) {
    // Tampilkan pesan jika tidak ada data
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
                No sales data available for the selected period.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            {/* DIPERBARUI: Menggunakan 'data' dari props */}
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    wrapperClassName="rounded-md border-gray-300 shadow-sm"
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#C8705C" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}