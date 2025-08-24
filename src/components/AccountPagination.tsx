// src/components/AccountPagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const AccountPagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors bg-transparent text-brand-black hover:bg-brand-gray-2 disabled:opacity-50"
      >
        <ChevronLeft size={20} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
            ${currentPage === number
              ? 'bg-brand-orange text-white pointer-events-none'
              : 'bg-transparent text-brand-black hover:bg-brand-gray-2'
            }
          `}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors bg-transparent text-brand-black hover:bg-brand-gray-2 disabled:opacity-50"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default AccountPagination;