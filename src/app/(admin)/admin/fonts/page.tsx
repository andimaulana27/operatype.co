'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/lib/database.types';
import { PlusCircle, Search, Trash2, ChevronDown, AlertTriangle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteFontAction } from '@/app/actions/fontActions';

// --- Tipe Data ---
type FontRow = Database['public']['Tables']['fonts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row'];
type DiscountInsert = Database['public']['Tables']['discounts']['Insert'];
type FontWithDetails = FontRow & {
  categories: Pick<Category, 'name'> | null;
  partners: Pick<Partner, 'name'> | null;
  orders: [{ count: number }];
  font_discounts: { discounts: Pick<Discount, 'name' | 'percentage'> | null }[];
};

const ITEMS_PER_PAGE = 10;

// --- Komponen Modal ---

// Komponen Modal Konfirmasi Hapus (Tidak ada perubahan)
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, fontsToDelete, isLoading }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, fontsToDelete: FontWithDetails[], isLoading: boolean }) => {
    if (!isOpen) return null;
    const fontCount = fontsToDelete.length;
    const fontName = fontsToDelete.length === 1 ? `"${fontsToDelete[0].name}"` : `${fontCount} fonts`;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Font(s)</h3>
                        <div className="mt-2"><p className="text-sm text-gray-500">Are you sure you want to delete {fontName}? This action is irreversible.</p></div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={onConfirm} disabled={isLoading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">{isLoading ? 'Deleting...' : 'Delete'}</button>
                    <button type="button" onClick={onClose} disabled={isLoading} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
};

// ================= PERBAIKAN DIMULAI DI SINI (1) =================
// Komponen Modal Buat Diskon
const CreateDiscountModal = ({ isOpen, onClose, onSave, isLoading }: { isOpen: boolean, onClose: () => void, onSave: (data: DiscountInsert) => void, isLoading: boolean }) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || percentage === '' || !startDate || !endDate) {
            toast.error('Please fill all required fields.');
            return;
        }
        if (percentage < 1 || percentage > 100) {
            toast.error('Percentage must be between 1 and 100.');
            return;
        }
        onSave({
            name,
            percentage,
            start_date: startDate,
            end_date: endDate,
            is_active: isActive,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Discount</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Discount Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Percentage (%)</label>
                        <input type="number" id="percentage" value={percentage} onChange={e => setPercentage(Number(e.target.value))} min="1" max="100" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" id="start_date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" id="end_date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                    </div>
                     <div className="flex items-center">
                        <input id="is_active" name="is_active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Activate this discount</label>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50">{isLoading ? 'Saving...' : 'Create Discount'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Komponen Modal Terapkan Diskon (Tidak ada perubahan)
const ApplyDiscountModal = ({ isOpen, onClose, onApply, discounts, isLoading, selectedFontCount }: { isOpen: boolean, onClose: () => void, onApply: (id: string | null) => void, discounts: Discount[], isLoading: boolean, selectedFontCount: number }) => {
    const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedDiscountId(discounts.length > 0 ? discounts[0].id : null);
        }
    }, [isOpen, discounts]);

    if (!isOpen) return null;

    const handleApplyClick = () => {
        if (selectedDiscountId) {
            onApply(selectedDiscountId);
        } else {
            toast.error("Please select a discount to apply.");
        }
    };
    
    const handleRemoveDiscount = () => {
      onApply(null);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Apply Discount</h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Select a discount to apply to the {selectedFontCount} selected font(s). 
                        This will overwrite any existing discount on these fonts.
                    </p>
                </div>
                <div className="mt-4">
                    <label htmlFor="discount-select" className="block text-sm font-medium text-gray-700">Available Discounts</label>
                    <select
                        id="discount-select"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-md"
                        value={selectedDiscountId || ''}
                        onChange={(e) => setSelectedDiscountId(e.target.value)}
                        disabled={discounts.length === 0}
                    >
                        {discounts.length > 0 ? (
                           discounts.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>
                           ))
                        ) : (
                            <option>No active discounts found</option>
                        )}
                    </select>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button 
                        type="button" 
                        onClick={handleApplyClick} 
                        disabled={isLoading || !selectedDiscountId} 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-orange text-base font-medium text-white hover:bg-brand-orange-hover sm:col-start-2 sm:text-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Applying...' : 'Apply Discount'}
                    </button>
                     <button 
                        type="button" 
                        onClick={handleRemoveDiscount} 
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Remove Discount'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm"
                        style={{gridColumn: '1 / -1', marginTop: '0.75rem'}}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponen Badge Status (Tidak ada perubahan)
const StatusBadge = ({ status }: { status: string | null }) => { 
    const statusClasses = status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    return (<span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${statusClasses}`}>{status || 'Draft'}</span>);
};

export default function ManageFontsPage() {
  const [fonts, setFonts] = useState<FontWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fontsToDelete, setFontsToDelete] = useState<FontWithDetails[]>([]);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isApplyDiscountModalOpen, setIsApplyDiscountModalOpen] = useState(false);
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setIsLoading(true);
    const [fontsResult, categoriesResult, partnersResult, discountsResult] = await Promise.all([
      supabase.from('fonts').select(`*, categories(name), partners(name), orders(count), font_discounts(discounts(name, percentage))`).order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('partners').select('*'),
      supabase.from('discounts').select('*').eq('is_active', true)
    ]);
    
    if (fontsResult.error) toast.error(`Failed to fetch fonts: ${fontsResult.error.message}`);
    else setFonts(fontsResult.data as any);

    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (partnersResult.data) setPartners(partnersResult.data);
    if (discountsResult.data) setActiveDiscounts(discountsResult.data);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFonts = useMemo(() => {
    return fonts.filter(font => {
      const matchesSearch = font.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? font.category_id === selectedCategory : true;
      const matchesPartner = selectedPartner ? font.partner_id === selectedPartner : true;
      return matchesSearch && matchesCategory && matchesPartner;
    });
  }, [fonts, searchTerm, selectedCategory, selectedPartner]);

  const totalPages = Math.ceil(filteredFonts.length / ITEMS_PER_PAGE);
  const paginatedFonts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFonts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFonts, currentPage]);

  const openDeleteModal = (fonts: FontWithDetails[]) => {
    if (fonts.length === 0) return;
    setFontsToDelete(fonts);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    startTransition(async () => {
      const deletionPromises = fontsToDelete.map(font => 
        deleteFontAction(font.id, {
          main_image_url: font.main_image_url,
          gallery_image_urls: font.gallery_image_urls,
          downloadable_file_url: font.downloadable_file_url,
          display_font_regular_url: font.display_font_regular_url,
          display_font_italic_url: font.display_font_italic_url
        })
      );
      
      const results = await Promise.all(deletionPromises);
      
      results.forEach(result => {
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
        }
      });

      await fetchData();
      setIsDeleteModalOpen(false);
      setFontsToDelete([]);
      setSelectedFonts([]);
    });
  };

  // ================= PERBAIKAN PADA FUNGSI INI (2) =================
  const handleCreateDiscount = async (discountData: DiscountInsert) => {
    startTransition(async () => {
        const { error } = await supabase.from('discounts').insert([discountData]);

        if (error) {
            toast.error(`Failed to create discount: ${error.message}`);
        } else {
            toast.success(`Discount "${discountData.name}" created successfully!`);
            setIsDiscountModalOpen(false);
            await fetchData(); // Refresh data to get the new discount
        }
    });
  };
  
  const handleApplyDiscount = async (discountId: string | null) => {
    if (selectedFonts.length === 0) {
      toast.error("No fonts selected.");
      return;
    }
  
    startTransition(async () => {
      // Selalu hapus diskon yang ada terlebih dahulu
      const { error: deleteError } = await supabase
        .from('font_discounts')
        .delete()
        .in('font_id', selectedFonts);
  
      if (deleteError) {
        toast.error(`Error clearing existing discounts: ${deleteError.message}`);
        setIsApplyDiscountModalOpen(false);
        return;
      }
  
      // Jika discountId diberikan (bukan null), maka terapkan diskon baru
      if (discountId) {
        const recordsToInsert = selectedFonts.map(fontId => ({
          font_id: fontId,
          discount_id: discountId,
        }));
  
        const { error: insertError } = await supabase
          .from('font_discounts')
          .insert(recordsToInsert);
  
        if (insertError) {
          toast.error(`Failed to apply discount: ${insertError.message}`);
        } else {
          toast.success(`Discount successfully applied to ${selectedFonts.length} font(s).`);
        }
      } else {
        // Jika discountId adalah null, berarti tujuannya hanya untuk menghapus
        toast.success(`Discounts removed from ${selectedFonts.length} font(s).`);
      }
      
      // Muat ulang data, tutup modal, dan kosongkan pilihan
      await fetchData();
      setIsApplyDiscountModalOpen(false);
      setSelectedFonts([]);
    });
  };
  // ================= AKHIR DARI PERBAIKAN =================

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedFonts(paginatedFonts.map(f => f.id));
    else setSelectedFonts([]);
  };

  const handleSelectOne = (id: string, isChecked: boolean) => {
    if (isChecked) setSelectedFonts(prev => [...prev, id]);
    else setSelectedFonts(prev => prev.filter(fontId => fontId !== id));
  };
  
  const isAllOnPageSelected = paginatedFonts.length > 0 && paginatedFonts.every(f => selectedFonts.includes(f.id));
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
        <DeleteConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            fontsToDelete={fontsToDelete}
            isLoading={isPending}
        />
        
        <CreateDiscountModal
            isOpen={isDiscountModalOpen}
            onClose={() => setIsDiscountModalOpen(false)}
            onSave={handleCreateDiscount}
            isLoading={isPending}
        />
        
        <ApplyDiscountModal
            isOpen={isApplyDiscountModalOpen}
            onClose={() => setIsApplyDiscountModalOpen(false)}
            onApply={handleApplyDiscount}
            discounts={activeDiscounts}
            isLoading={isPending}
            selectedFontCount={selectedFonts.length}
        />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Fonts</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">Add, edit, and manage all your font products.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsDiscountModalOpen(true)} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Create Discount
          </button>
          <Link href="/admin/fonts/new">
            <span className="bg-brand-orange text-white font-medium py-2 px-4 rounded-lg hover:bg-brand-orange-hover transition-colors flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Add New Font
            </span>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search fonts by name..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <div className="relative">
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="border rounded-lg p-2 appearance-none pr-8">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-brand-orange absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={selectedPartner} onChange={e => { setSelectedPartner(e.target.value); setCurrentPage(1); }} className="border rounded-lg p-2 appearance-none pr-8">
            <option value="">All Partners</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-brand-orange absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        {selectedFonts.length > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">{selectedFonts.length} item(s) selected</span>
            <div className="flex gap-2">
              <button onClick={() => setIsApplyDiscountModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200">
                  <Tag className="w-4 h-4" /> Apply Discount
              </button>
              <button onClick={() => { const fontsToActOn = fonts.filter(f => selectedFonts.includes(f.id)); openDeleteModal(fontsToActOn); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">
                  <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            </div>
          </div>
        )}
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 w-4"><input type="checkbox" onChange={handleSelectAll} checked={isAllOnPageSelected} /></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Font Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading fonts...</td></tr>
            ) : paginatedFonts.length > 0 ? paginatedFonts.map((font) => {
                const discountInfo = font.font_discounts[0]?.discounts;
                const originalPrice = font.price_desktop || 0;
                const discountedPrice = discountInfo && discountInfo.percentage ? originalPrice - (originalPrice * discountInfo.percentage / 100) : null;
                return (
                  <tr key={font.id} className="hover:bg-gray-50">
                    <td className="p-4"><input type="checkbox" checked={selectedFonts.includes(font.id)} onChange={(e) => handleSelectOne(font.id, e.target.checked)} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Image className="h-16 w-16 rounded-md object-cover" src={font.main_image_url || '/placeholder.png'} alt={font.name || 'Font image'} width={64} height={64} />
                        <div>
                            <div className="font-medium text-gray-900">{font.name}</div>
                            {discountInfo && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Tag className="w-3 h-3"/>{discountInfo.name}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={font.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{font.orders[0]?.count || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {discountedPrice !== null ? (
                            <div>
                                <span className="line-through text-gray-400">${originalPrice.toFixed(2)}</span>
                                <span className="font-bold text-green-600 ml-2">${discountedPrice.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span>${originalPrice.toFixed(2)}</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(font.created_at)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link href={`/admin/fonts/edit/${font.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                      <button onClick={() => openDeleteModal([font])} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                )
            }) : (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No fonts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">Previous</button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}