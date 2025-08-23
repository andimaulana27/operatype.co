// src/components/Pagination.tsx
'use client'; // Menjadikan ini Client Component agar bisa menggunakan hook

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

// PERBAIKAN: Menghapus `onPageChange` dari props
type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center space-x-2 mt-16">
      {/* Tombol Previous bisa ditambahkan di sini jika perlu */}
      {pageNumbers.map((number) => (
        <Link
          key={number}
          href={createPageURL(number)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
            ${currentPage === number
              ? 'bg-brand-orange text-white pointer-events-none'
              : 'bg-transparent text-brand-black hover:bg-brand-gray-2'
            }
          `}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </Link>
      ))}
      {/* Tombol Next bisa ditambahkan di sini jika perlu */}
    </nav>
  );
}
