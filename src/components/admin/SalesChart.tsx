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

// Tipe data untuk chart
type ChartData = {
  name: string;
  sales: number;
};

type SalesChartProps = {
  data: ChartData[];
};

export default function SalesChart({ data }: SalesChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
                No sales data available for the selected period.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    wrapperClassName="rounded-md border-gray-300 shadow-sm"
                    // PERBAIKAN: Parameter 'value' diberi tipe 'any' atau union type yang luas
                    // untuk mencocokkan definisi tipe Recharts yang fleksibel.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => {
                        // Pastikan value adalah number sebelum memanggil toFixed
                        if (typeof value === 'number') {
                            return [`$${value.toFixed(2)}`, 'Sales'];
                        }
                        // Fallback jika value bukan number (misal undefined atau string)
                        return [`$${value}`, 'Sales'];
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#C8705C" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}