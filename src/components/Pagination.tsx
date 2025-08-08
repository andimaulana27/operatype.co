// src/components/Pagination.tsx
'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pageNumbers = [];
  // Logika untuk menampilkan nomor halaman (sederhana untuk saat ini)
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-16">
      {/* Tombol Previous (bisa ditambahkan nanti) */}
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors
            ${currentPage === number
              ? 'bg-brand-orange text-white'
              : 'bg-transparent text-brand-black hover:bg-brand-gray-2'
            }
          `}
        >
          {number}
        </button>
      ))}
      {/* Tombol Next (bisa ditambahkan nanti) */}
    </nav>
  );
};

export default Pagination;