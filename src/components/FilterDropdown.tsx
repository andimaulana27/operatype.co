// src/components/FilterDropdown.tsx
'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';

type FilterDropdownProps = {
  label?: string;
  defaultValue: string;
  options: string[];
};

const FilterDropdown = ({ label, defaultValue, options }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  return (
    <div className="relative w-full md:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 pl-6 pr-4 py-3 border border-brand-black rounded-full bg-transparent text-brand-black hover:border-brand-orange group transition-colors"
      >
        {label && <span className="font-light text-brand-gray-1">{label}</span>}
        <span className="font-medium text-brand-black">{selectedValue}</span>
        {/* PERBAIKAN: Menggunakan kelas Tailwind untuk animasi rotasi */}
        <ChevronDownIcon
          className={`h-5 w-5 text-brand-orange transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-56 bg-white border border-brand-gray-2 rounded-lg shadow-lg z-10">
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option}
                onClick={() => {
                  setSelectedValue(option);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-brand-gray-2 cursor-pointer text-brand-black"
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
