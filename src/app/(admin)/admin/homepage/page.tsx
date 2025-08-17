'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
// --- SEMUA IMPORT DND-KIT DIHAPUS ---
import { SortableItem } from '@/components/admin/SortableItem';
import { updateHomepageLayoutAction } from '@/app/actions/fontActions';
import { SearchIcon } from '@/components/icons';

type Font = Database['public']['Tables']['fonts']['Row'];

type ColumnData = {
  id: string;
  title: string;
  fonts: Font[];
};

const MAX_FONTS_PER_SECTION = 8;

export default function ManageHomepagePage() {
  const [columns, setColumns] = useState<Record<string, ColumnData>>({
    available: { id: 'available', title: 'Available Fonts', fonts: [] },
    featured: { id: 'featured', title: 'Our Featured Collection', fonts: [] },
    curated: { id: 'curated', title: 'Curated Selections', fonts: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyBestsellers, setShowOnlyBestsellers] = useState(false);
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);

  // --- SENSOR DND-KIT DIHAPUS ---

  useEffect(() => {
    const fetchFonts = async () => {
      setIsLoading(true);
      // Query tidak perlu lagi mengambil homepage_order
      const { data, error } = await supabase.from('fonts').select('*').eq('status', 'Published').order('name', { ascending: true });
      if (error) { toast.error('Failed to fetch fonts.'); } 
      else {
        setColumns({
          available: { id: 'available', title: 'Available Fonts', fonts: data.filter(f => f.homepage_section === 'none' || !f.homepage_section) },
          featured: { id: 'featured', title: 'Our Featured Collection', fonts: data.filter(f => f.homepage_section === 'featured') },
          curated: { id: 'curated', title: 'Curated Selections', fonts: data.filter(f => f.homepage_section === 'curated') },
        });
      }
      setIsLoading(false);
    };
    fetchFonts();
  }, []);

  // --- FUNGSI handleDragEnd DIHAPUS ---

  const handleSelectFont = (fontId: string) => {
    setSelectedFonts(prev => 
      prev.includes(fontId) ? prev.filter(id => id !== fontId) : [...prev, fontId]
    );
  };

  const handleMoveSelected = (targetSection: 'featured' | 'curated') => {
    if (selectedFonts.length === 0) return;

    setColumns(prev => {
      const targetColumn = prev[targetSection];
      if (targetColumn.fonts.length + selectedFonts.length > MAX_FONTS_PER_SECTION) {
        toast.error(`Can't add ${selectedFonts.length} fonts. Section limit is ${MAX_FONTS_PER_SECTION}.`);
        return prev;
      }
      const available = [...prev.available.fonts];
      const toMove: Font[] = [];
      const remainingAvailable = available.filter(font => {
          if (selectedFonts.includes(font.id)) {
              toMove.push(font);
              return false;
          }
          return true;
      });
      const newTarget = [...targetColumn.fonts, ...toMove];
      setSelectedFonts([]);
      return {
        ...prev,
        available: { ...prev.available, fonts: remainingAvailable },
        [targetSection]: { ...targetColumn, fonts: newTarget },
      };
    });
  };
  
  const handleRemoveFont = (fontId: string, sourceSection: 'featured' | 'curated') => {
    setColumns(prev => {
      const sourceItems = [...prev[sourceSection].fonts];
      const availableItems = [...prev.available.fonts];
      
      const index = sourceItems.findIndex(f => f.id === fontId);
      if (index > -1) {
        const [removedItem] = sourceItems.splice(index, 1);
        availableItems.push(removedItem);
        availableItems.sort((a, b) => a.name.localeCompare(b.name));
        return {
          ...prev,
          [sourceSection]: { ...prev[sourceSection], fonts: sourceItems },
          available: { ...prev.available, fonts: availableItems },
        };
      }
      return prev;
    });
  };

  const handleSaveLayout = () => {
    startTransition(async () => {
      const featuredIds = columns.featured.fonts.map(f => f.id);
      const curatedIds = columns.curated.fonts.map(f => f.id);
      
      const result = await updateHomepageLayoutAction(featuredIds, curatedIds);
      if (result.error) { toast.error(result.error); } 
      else { toast.success(result.success!); }
    });
  };

  const filteredAvailableFonts = useMemo(() => {
    let available = columns.available.fonts;
    if (showOnlyBestsellers) {
      available = available.filter(font => font.is_bestseller);
    }
    if (searchTerm) {
      available = available.filter(font => 
        font.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return available;
  }, [columns.available.fonts, searchTerm, showOnlyBestsellers]);


  if (isLoading) return <div className="text-center p-12">Loading Font Data...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Homepage</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">Use the checkbox to move the font to the homepage section.</p>
        </div>
        <button onClick={handleSaveLayout} disabled={isPending} className="bg-brand-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50">
          {isPending ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      {selectedFonts.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between transition-all duration-300">
          <span className="font-medium text-indigo-800">{selectedFonts.length} font(s) selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleMoveSelected('featured')} className="px-3 py-1.5 text-sm font-medium text-white bg-brand-orange rounded-md hover:bg-brand-orange-hover">Move to Featured</button>
            <button onClick={() => handleMoveSelected('curated')} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">Move to Curated</button>
            <button onClick={() => setSelectedFonts([])} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Clear Selection</button>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border flex items-center gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search available fonts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center">
          <input
            id="bestseller-filter"
            type="checkbox"
            checked={showOnlyBestsellers}
            onChange={e => setShowOnlyBestsellers(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
          />
          <label htmlFor="bestseller-filter" className="ml-2 block text-sm font-medium text-gray-700">
            Show Bestsellers Only
          </label>
        </div>
      </div>

      {/* --- WRAPPER DND-CONTEXT DIHAPUS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div key="available" className="bg-gray-50 p-4 rounded-lg flex flex-col">
          <h2 className="font-bold text-lg mb-4 text-gray-700">{columns.available.title} ({filteredAvailableFonts.length})</h2>
          <div className="space-y-3 min-h-[300px] border-2 border-dashed border-gray-300 rounded-md p-2 flex-grow overflow-y-auto">
            {filteredAvailableFonts.map(font => (
              <SortableItem
                key={font.id}
                id={font.id}
                font={font}
                showCheckbox={true}
                isSelected={selectedFonts.includes(font.id)}
                onSelect={handleSelectFont}
              />
            ))}
          </div>
        </div>

        {['featured', 'curated'].map(colId => (
          <div key={colId} className="bg-gray-50 p-4 rounded-lg flex flex-col">
            <h2 className="font-bold text-lg mb-4 text-gray-700">{columns[colId].title} ({columns[colId].fonts.length} / {MAX_FONTS_PER_SECTION})</h2>
            <div className="space-y-3 min-h-[300px] border-2 border-dashed border-gray-300 rounded-md p-2 flex-grow overflow-y-auto">
              {/* --- WRAPPER SORTABLE-CONTEXT DIHAPUS --- */}
              {/* Tambahkan .sort() untuk memastikan urutan konsisten berdasarkan abjad */}
              {columns[colId].fonts
                .sort((a,b) => a.name.localeCompare(b.name))
                .map(font => (
                <SortableItem
                  key={font.id}
                  id={font.id}
                  font={font}
                  onRemove={(id) => handleRemoveFont(id, colId as 'featured' | 'curated')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}