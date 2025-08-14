// src/components/FilterDropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@/components/icons';

// DIPERBARUI: Tipe props diubah untuk menerima 'value' dan 'onChange'
type FilterDropdownProps = {
  label?: string;
  options: string[];
  value: string; // Nilai yang saat ini aktif, dikontrol oleh parent
  onChange: (newValue: string) => void; // Fungsi untuk mengirim nilai baru ke parent
};

const FilterDropdown = ({ label, options, value, onChange }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // BARU: Logika untuk menutup dropdown saat klik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        type="button" // Menambahkan type="button" untuk praktik terbaik
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 pl-6 pr-4 py-3 border border-brand-black rounded-full bg-transparent text-brand-black hover:border-brand-orange group transition-colors"
      >
        {label && <span className="font-light text-brand-gray-1">{label}</span>}
        {/* DIPERBARUI: Menampilkan nilai dari prop 'value' */}
        <span className="font-medium text-brand-black">{value}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-brand-orange transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-56 bg-white border border-brand-gray-2 rounded-lg shadow-lg z-10">
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option}
                onClick={() => {
                  // DIPERBARUI: Memanggil fungsi 'onChange' dari props
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-brand-black ${value === option ? 'bg-orange-100' : 'hover:bg-brand-gray-2'}`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;