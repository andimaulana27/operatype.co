// src/components/SearchInput.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { SearchIcon } from './icons';

export default function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset ke halaman 1 setiap kali ada pencarian baru
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300); // Tunggu 300ms setelah user berhenti mengetik

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('search')?.toString()}
        className="w-full bg-transparent text-brand-black pl-6 pr-12 py-3 border border-brand-black rounded-full placeholder:text-brand-gray-1 focus:outline-none focus:border-brand-orange transition-colors"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <SearchIcon className="h-6 w-6 text-brand-orange" />
      </div>
    </div>
  );
}
