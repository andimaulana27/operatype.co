'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Font = Database['public']['Tables']['fonts']['Row'];

type SortableItemProps = {
  id: string; // id tetap dibutuhkan untuk key
  font: Font;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
};

// Nama komponen tetap sama agar tidak perlu mengubah import,
// tapi semua logika 'useSortable' telah dihapus.
export const SortableItem = ({ 
  id, 
  font, 
  showCheckbox = false, 
  isSelected = false, 
  onSelect,
  onRemove
}: SortableItemProps) => {

  return (
    // Atribut ref, style, listeners, dan attributes dihapus
    <div className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm border">
      {/* Checkbox tetap ada untuk memilih */}
      {showCheckbox && onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(id)}
          className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
        />
      )}

      {/* Tombol dengan ikon GripVertical dihapus */}
      <Image 
        src={font.main_image_url || '/placeholder.png'} 
        alt={font.name} 
        width={40} 
        height={40} 
        className="rounded-md object-cover w-10 h-10"
      />
      <span className="font-medium text-sm text-gray-800 select-none flex-grow">{font.name}</span>

      {/* Tombol hapus tetap ada */}
      {onRemove && (
        <button 
          onClick={() => onRemove(id)} 
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Remove from section"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};