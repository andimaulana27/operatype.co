// src/components/FilterDropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@/components/icons';

type FilterDropdownProps = {
  options: string[];
  paramName: 'category' | 'sort';
};

export default function FilterDropdown({ options, paramName }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentValue = searchParams.get(paramName) || (paramName === 'category' ? 'All' : 'Popular'); // Default ke Popular

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (option === 'All' && paramName === 'category') {
        params.delete(paramName);
    } else {
        params.set(paramName, option);
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2 pl-6 pr-4 py-3 border border-brand-black rounded-full bg-transparent text-brand-black hover:border-brand-orange group transition-colors"
      >
        <span className="font-medium text-brand-black">{currentValue}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-brand-orange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        // ==================== PERBAIKAN DI SINI: TAMBAHKAN z-50 ====================
        <div className="absolute top-full mt-2 w-full md:w-56 bg-white border border-brand-gray-2 rounded-lg shadow-lg z-50">
        {/* ========================================================================= */}
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer text-brand-black ${currentValue === option ? 'bg-orange-100' : 'hover:bg-brand-gray-2'}`}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}