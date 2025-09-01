// src/app/(admin)/admin/homepage/page.tsx
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { SortableItem } from '@/components/admin/SortableItem';
// ==================== PERBAIKAN KINERJA ====================
import { updateHomepageLayoutAction, getAvailableHomepageFontsAction } from '@/app/actions/fontActions';
import { SearchIcon } from '@/components/icons';
import AdminPagination from '@/components/admin/AdminPagination'; // Impor pagination

type Font = Database['public']['Tables']['fonts']['Row'];

type ColumnData = {
  id: string;
  title: string;
  fonts: Font[];
};

const MAX_FONTS_PER_SECTION = 8;
const ITEMS_PER_PAGE = 20; // Jumlah item per halaman untuk daftar "Available"

export default function ManageHomepagePage() {
  // State untuk kolom Featured & Curated tetap sama
  const [featuredFonts, setFeaturedFonts] = useState<Font[]>([]);
  const [curatedFonts, setCuratedFonts] = useState<Font[]>([]);

  // State baru untuk daftar "Available Fonts" yang dipaginasi
  const [availableFonts, setAvailableFonts] = useState<Font[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyBestsellers, setShowOnlyBestsellers] = useState(false);
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);

  // 1. Fetch data awal untuk kolom Featured dan Curated (datanya sedikit)
  useEffect(() => {
    const fetchHomepageFonts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fonts')
        .select('*')
        .in('homepage_section', ['featured', 'curated'])
        .eq('status', 'Published')
        .order('homepage_order', { ascending: true });

      if (error) {
        toast.error('Failed to fetch homepage fonts.');
      } else {
        setFeaturedFonts(data.filter(f => f.homepage_section === 'featured'));
        setCuratedFonts(data.filter(f => f.homepage_section === 'curated'));
      }
      // setIsLoading(false) akan dipanggil setelah available fonts juga ter-load
    };
    fetchHomepageFonts();
  }, []);

  // 2. Fetch data untuk "Available Fonts" secara terpisah dan dengan paginasi
  useEffect(() => {
    const fetchAvailable = () => {
        startTransition(async () => {
            const result = await getAvailableHomepageFontsAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
                showBestsellers: showOnlyBestsellers,
            });
            if(result.error) {
                toast.error(result.error);
            } else {
                setAvailableFonts(result.data || []);
                setTotalAvailable(result.count || 0);
            }
            if(isLoading) setIsLoading(false); // Matikan loading global setelah semua data awal siap
        });
    };
    fetchAvailable();
  }, [currentPage, searchTerm, showOnlyBestsellers]);

  const handleSelectFont = (fontId: string) => {
    setSelectedFonts(prev => 
      prev.includes(fontId) ? prev.filter(id => id !== fontId) : [...prev, fontId]
    );
  };
  
  // 3. Logika pemindahan font disesuaikan
  const handleMoveSelected = (targetSection: 'featured' | 'curated') => {
    if (selectedFonts.length === 0) return;

    const targetList = targetSection === 'featured' ? featuredFonts : curatedFonts;
    const setTargetList = targetSection === 'featured' ? setFeaturedFonts : setCuratedFonts;

    if (targetList.length + selectedFonts.length > MAX_FONTS_PER_SECTION) {
      toast.error(`Section limit is ${MAX_FONTS_PER_SECTION}. Cannot add ${selectedFonts.length} fonts.`);
      return;
    }
    
    const fontsToMove = availableFonts.filter(f => selectedFonts.includes(f.id));
    setTargetList(prev => [...prev, ...fontsToMove]);
    setAvailableFonts(prev => prev.filter(f => !selectedFonts.includes(f.id)));
    
    setSelectedFonts([]);
  };
  
  const handleRemoveFont = (fontId: string, sourceSection: 'featured' | 'curated') => {
    const sourceList = sourceSection === 'featured' ? featuredFonts : curatedFonts;
    const setSourceList = sourceSection === 'featured' ? setFeaturedFonts : setCuratedFonts;

    const fontToRemove = sourceList.find(f => f.id === fontId);
    if (fontToRemove) {
      setSourceList(prev => prev.filter(f => f.id !== fontId));
      setAvailableFonts(prev => [...prev, fontToRemove].sort((a,b) => a.name.localeCompare(b.name)));
    }
  };

  const handleSaveLayout = () => {
    startTransition(async () => {
      const featuredIds = featuredFonts.map(f => f.id);
      const curatedIds = curatedFonts.map(f => f.id);
      
      const result = await updateHomepageLayoutAction(featuredIds, curatedIds);
      if (result.error) { toast.error(result.error); } 
      else { toast.success(result.success!); }
    });
  };

  const totalPages = Math.ceil(totalAvailable / ITEMS_PER_PAGE);

  if (isLoading) return <div className="text-center p-12">Loading Homepage Layout...</div>;

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
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
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
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center">
          <input
            id="bestseller-filter"
            type="checkbox"
            checked={showOnlyBestsellers}
            onChange={e => { setShowOnlyBestsellers(e.target.checked); setCurrentPage(1); }}
            className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
          />
          <label htmlFor="bestseller-filter" className="ml-2 block text-sm font-medium text-gray-700">
            Show Bestsellers Only
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div key="available" className="bg-gray-50 p-4 rounded-lg flex flex-col">
          <h2 className="font-bold text-lg mb-4 text-gray-700">Available Fonts ({totalAvailable})</h2>
          <div className="space-y-3 min-h-[300px] border-2 border-dashed border-gray-300 rounded-md p-2 flex-grow overflow-y-auto">
            {isPending && currentPage === 1 ? <p>Loading...</p> : availableFonts.map(font => (
              <SortableItem
                key={font.id} id={font.id} font={font} showCheckbox={true}
                isSelected={selectedFonts.includes(font.id)} onSelect={handleSelectFont}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>

        {[{id: 'featured', title: 'Our Featured Collection', fonts: featuredFonts}, {id: 'curated', title: 'Curated Selections', fonts: curatedFonts}].map(col => (
          <div key={col.id} className="bg-gray-50 p-4 rounded-lg flex flex-col">
            <h2 className="font-bold text-lg mb-4 text-gray-700">{col.title} ({col.fonts.length} / {MAX_FONTS_PER_SECTION})</h2>
            <div className="space-y-3 min-h-[300px] border-2 border-dashed border-gray-300 rounded-md p-2 flex-grow overflow-y-auto">
              {col.fonts
                .sort((a,b) => a.name.localeCompare(b.name))
                .map(font => (
                <SortableItem
                  key={font.id} id={font.id} font={font}
                  onRemove={(id) => handleRemoveFont(id, col.id as 'featured' | 'curated')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}