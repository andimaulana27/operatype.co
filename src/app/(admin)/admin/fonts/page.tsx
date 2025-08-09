// src/app/(admin)/admin/fonts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

// Tipe data diperluas untuk data baru
type Font = {
  id: string;
  name: string;
  main_image_url: string;
  price_desktop: number;
  created_at: string;
  status: 'Published' | 'Draft';
  partners: { name: string }[] | null;
  orders: { count: number }[]; // Untuk menghitung penjualan
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export default function ManageFontsPage() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);

  useEffect(() => {
    const fetchFonts = async () => {
      const { data, error } = await supabase
        .from('fonts')
        .select(`
          id, name, main_image_url, price_desktop, created_at, status,
          partners ( name ),
          orders ( count )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching fonts:", error);
      } else {
        setFonts(data as any);
      }
      setIsLoading(false);
    };
    fetchFonts();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFonts(fonts.map(f => f.id));
    } else {
      setSelectedFonts([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedFonts(prev => [...prev, id]);
    } else {
      setSelectedFonts(prev => prev.filter(fontId => fontId !== id));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Fonts</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">Here you can add, edit, or delete your font products.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
            Create Discount
          </button>
          <Link href="/admin/fonts/new">
            <span className="bg-brand-orange text-white font-medium py-2 px-4 rounded-lg hover:bg-brand-orange-hover transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add New Font
            </span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-4">
        {/* Placeholder untuk filter */}
        <input type="text" placeholder="Search fonts..." className="border rounded-lg p-2 w-full md:w-1/3" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 w-4"><input type="checkbox" onChange={handleSelectAll} /></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Font Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading fonts...</td></tr>
            ) : fonts.map((font) => (
              <tr key={font.id} className="hover:bg-gray-50">
                <td className="p-4"><input type="checkbox" checked={selectedFonts.includes(font.id)} onChange={(e) => handleSelectOne(e, font.id)} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Image className="h-10 w-10 rounded-md object-cover" src={font.main_image_url} alt={font.name} width={40} height={40} />
                    <div className="font-medium text-gray-900">{font.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${font.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {font.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{font.orders[0]?.count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${font.price_desktop.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(font.created_at)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/fonts/edit/${font.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
