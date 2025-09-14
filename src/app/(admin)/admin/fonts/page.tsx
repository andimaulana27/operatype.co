// src/app/(admin)/admin/fonts/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/lib/database.types';
import { PlusCircle, Search, Trash2, ChevronDown, AlertTriangle, Tag, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';
// ==================== PERBAIKAN KINERJA ====================
// 1. Impor action baru yang akan kita gunakan
import { 
    getAdminFontsAction, // Action untuk mengambil data font
    deleteFontAction, 
    updateFontStatusAction, 
    deleteDiscountAction, 
    updateDiscountAction, 
    createDiscountAction,
    applyDiscountToFontsAction // Action baru untuk diskon
} from '@/app/actions/fontActions'; 
import AdminPagination from '@/components/admin/AdminPagination';
import { supabase } from '@/lib/supabaseClient'; // Tetap dibutuhkan untuk beberapa hal

// Tipe data tidak banyak berubah, hanya perlu pastikan sinkron
type FontRow = Database['public']['Tables']['fonts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row'];
type DiscountInsert = Database['public']['Tables']['discounts']['Insert'];
type DiscountUpdate = Database['public']['Tables']['discounts']['Update'];

type FontWithDetails = FontRow & {
  categories: Pick<Category, 'name'> | null;
  partners: Pick<Partner, 'name'> | null;
  order_items: [{ count: number }];
  font_discounts: { discounts: Discount | null }[];
};

const ITEMS_PER_PAGE = 10;

// Semua komponen Modal (Delete, DiscountForm, dll) tidak perlu diubah.
// ... (Kode komponen Modal tetap sama seperti sebelumnya)
const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemsToDelete, 
    itemType,
    isLoading 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: () => void, 
    itemsToDelete: { id: string, name: string | null }[], 
    itemType: string,
    isLoading: boolean 
}) => {
    if (!isOpen) return null;
    
    const itemInfo = itemsToDelete.length === 1 
        ? `"${itemsToDelete[0].name || 'item'}"` 
        : `${itemsToDelete.length} ${itemType}s`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete {itemType}(s)</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete {itemInfo}? This action is irreversible.
                            </p>
                        </div>
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

const DiscountFormModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    isLoading, 
    initialData 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: (data: DiscountInsert | DiscountUpdate, id?: string) => void, 
    isLoading: boolean,
    initialData?: Discount | null 
}) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setPercentage(initialData.percentage || '');
            setStartDate(initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '');
            setEndDate(initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '');
            setIsActive(initialData.is_active ?? true);
        } else if (isOpen && !initialData) {
            // Reset form untuk mode Create
            setName('');
            setPercentage('');
            setStartDate('');
            setEndDate('');
            setIsActive(true);
        }
    }, [isOpen, initialData]);

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
        
        const saveData = { name, percentage, start_date: startDate, end_date: endDate, is_active: isActive };
        onSave(saveData, initialData?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{isEditMode ? 'Edit Discount' : 'Create New Discount'}</h3>
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
                        <button type="submit" disabled={isLoading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50">{isLoading ? 'Saving...' : (isEditMode ? 'Update Discount' : 'Create Discount')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ApplyDiscountModal = ({ isOpen, onClose, onApply, discounts, isLoading, selectedFontCount }: { isOpen: boolean, onClose: () => void, onApply: (id: string | null) => void, discounts: Discount[], isLoading: boolean, selectedFontCount: number }) => {
    const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && discounts.length > 0) {
            setSelectedDiscountId(discounts[0].id);
        } else if (isOpen) {
            setSelectedDiscountId(null);
        }
    }, [isOpen, discounts]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Apply Discount</h3>
                <div className="mt-2"><p className="text-sm text-gray-500">Select a discount to apply to the {selectedFontCount} selected font(s).</p></div>
                <div className="mt-4">
                    <label htmlFor="discount-select" className="block text-sm font-medium text-gray-700">Available Discounts</label>
                    <select id="discount-select" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md" value={selectedDiscountId || ''} onChange={(e) => setSelectedDiscountId(e.target.value)} disabled={discounts.length === 0}>
                        {discounts.length > 0 ? (discounts.map(d => (<option key={d.id} value={d.id}>{d.name} ({d.percentage}%)</option>))) : (<option>No active discounts found</option>)}
                    </select>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button type="button" onClick={() => onApply(selectedDiscountId)} disabled={isLoading || !selectedDiscountId} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-orange text-base font-medium text-white hover:bg-brand-orange-hover sm:col-start-2 sm:text-sm disabled:opacity-50">{isLoading ? 'Applying...' : 'Apply Discount'}</button>
                    <button type="button" onClick={() => onApply(null)} disabled={isLoading} className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50">{isLoading ? 'Processing...' : 'Remove Discount'}</button>
                    <button type="button" onClick={onClose} disabled={isLoading} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm" style={{gridColumn: '1 / -1', marginTop: '0.75rem'}}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string | null }) => {
    const statusClasses = status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    return (<span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${statusClasses}`}>{status || 'Draft'}</span>);
};

const SwitchToggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => {
  const uniqueId = `${label.replace(/\s+/g, '-')}-${Math.random()}`;
  return (
    <label htmlFor={uniqueId} className="flex items-center cursor-pointer select-none">
      <div className="relative">
        <input id={uniqueId} type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
      </div>
      {label && <div className="ml-3 text-gray-700 text-sm font-medium">{label}</div>}
    </label>
  );
};

const ManageDiscountsModal = ({
  isOpen,
  onClose,
  discounts,
  onOpenConfirm,
  onOpenEdit,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  discounts: Discount[];
  onOpenConfirm: (discount: Discount) => void;
  onOpenEdit: (discount: Discount) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Manage All Discounts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {discounts.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map(d => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{d.percentage}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-4">
                      <button 
                        onClick={() => onOpenEdit(d)}
                        disabled={isLoading}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onOpenConfirm(d)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-8">No discounts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default function ManageFontsPage() {
    // 2. State management disederhanakan
    const [paginatedFonts, setPaginatedFonts] = useState<FontWithDetails[]>([]);
    const [totalFonts, setTotalFonts] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Hanya untuk loading awal
    const [isPending, startTransition] = useTransition();

    // State untuk filter tetap sama
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPartner, setSelectedPartner] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // State untuk modal dan seleksi tetap sama
    const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fontsToDelete, setFontsToDelete] = useState<FontWithDetails[]>([]);
    const [isApplyDiscountModalOpen, setIsApplyDiscountModalOpen] = useState(false);
    const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
    const [allDiscounts, setAllDiscounts] = useState<Discount[]>([]);
    const [isManageDiscountsModalOpen, setIsManageDiscountsModalOpen] = useState(false);
    const [isDiscountDeleteModalOpen, setIsDiscountDeleteModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
    const [isDiscountFormOpen, setIsDiscountFormOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

    // 3. useEffect utama untuk mengambil data menggunakan Server Action
    useEffect(() => {
        const fetchData = () => {
            startTransition(async () => {
                const result = await getAdminFontsAction({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    searchTerm,
                    category: selectedCategory,
                    partner: selectedPartner,
                });

                if (result.error) {
                    toast.error(result.error);
                    setPaginatedFonts([]);
                    setTotalFonts(0);
                } else {
                    setPaginatedFonts(result.data as FontWithDetails[]);
                    setTotalFonts(result.count || 0);
                }
                setIsLoading(false); // Matikan loading awal setelah fetch pertama
            });
        };
        fetchData();
    }, [currentPage, searchTerm, selectedCategory, selectedPartner]);

    // 4. useEffect untuk mengambil data filter (kategori & partner) sekali saja
    useEffect(() => {
        const fetchFilters = async () => {
            const [categoriesResult, partnersResult, allDiscountsResult] = await Promise.all([
                supabase.from('categories').select('*'),
                supabase.from('partners').select('*'),
                supabase.from('discounts').select('*').order('created_at', { ascending: false })
            ]);
            if (categoriesResult.data) setCategories(categoriesResult.data);
            if (partnersResult.data) setPartners(partnersResult.data);
            if (allDiscountsResult.data) {
                setAllDiscounts(allDiscountsResult.data);
                setActiveDiscounts(allDiscountsResult.data.filter(d => d.is_active));
            }
        };
        fetchFilters();
    }, []);

    const refreshData = () => {
        startTransition(async () => {
            const result = await getAdminFontsAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
                category: selectedCategory,
                partner: selectedPartner,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                setPaginatedFonts(result.data as FontWithDetails[]);
                setTotalFonts(result.count || 0);
            }
        });
    }

    const totalPages = Math.ceil(totalFonts / ITEMS_PER_PAGE);

    // Semua fungsi handle (delete, update, dll) sekarang memanggil `refreshData` setelah selesai
    // agar data di halaman menjadi yang terbaru.
    
    const confirmDelete = () => {
        startTransition(async () => {
            const deletionPromises = fontsToDelete.map(font => 
                deleteFontAction(font.id, {
                    main_image_url: font.main_image_url, gallery_image_urls: font.gallery_image_urls,
                    downloadable_file_url: font.downloadable_file_url, display_font_regular_url: font.display_font_regular_url,
                    display_font_italic_url: font.display_font_italic_url
                })
            );
            const results = await Promise.all(deletionPromises);
            results.forEach(result => {
                if (result.error) toast.error(result.error);
                else if (result.success) toast.success(result.success);
            });
            
            setIsDeleteModalOpen(false);
            setFontsToDelete([]);
            setSelectedFonts([]);
            refreshData(); // Refresh data
        });
    };
    
    const handleApplyDiscount = async (discountId: string | null) => {
        if (selectedFonts.length === 0) {
            toast.error("No fonts selected.");
            return;
        }
        startTransition(async () => {
            const result = await applyDiscountToFontsAction(selectedFonts, discountId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success!);
            }
            setIsApplyDiscountModalOpen(false);
            setSelectedFonts([]);
            refreshData(); // Refresh data
        });
    };

    const handleStatusUpdate = (fontId: string, updates: { is_bestseller: boolean }) => {
        startTransition(async () => {
            const result = await updateFontStatusAction(fontId, updates);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success!);
            }
            refreshData(); // Refresh data
        });
    };

    const handleSaveDiscount = async (data: DiscountInsert | DiscountUpdate, id?: string) => {
        startTransition(async () => {
            const result = id 
                ? await updateDiscountAction(id, data)
                : await createDiscountAction(data as DiscountInsert);

            if (result.error) { toast.error(result.error); } 
            else { toast.success(result.success!); }

            setIsDiscountFormOpen(false);
            // Refresh diskon setelah menyimpan
            const { data: newDiscounts } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
            if(newDiscounts) {
                setAllDiscounts(newDiscounts);
                setActiveDiscounts(newDiscounts.filter(d => d.is_active));
            }
        });
    };
    
    const handleDeleteDiscount = (id: string) => {
      startTransition(async () => {
        const result = await deleteDiscountAction(id);
        if (result.error) { toast.error(result.error); } 
        else {
          toast.success(result.success!);
          // Refresh diskon setelah menghapus
          const { data: newDiscounts } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
          if(newDiscounts) {
              setAllDiscounts(newDiscounts);
              setActiveDiscounts(newDiscounts.filter(d => d.is_active));
          }
        }
      });
    };

    const confirmDiscountDelete = () => {
      if (!discountToDelete) return;
      handleDeleteDiscount(discountToDelete.id);
      setIsDiscountDeleteModalOpen(false);
      setDiscountToDelete(null);
    };
    
    const openDeleteModal = (fonts: FontWithDetails[]) => {
        if (fonts.length === 0) return;
        setFontsToDelete(fonts);
        setIsDeleteModalOpen(true);
    };

    const openDiscountDeleteModal = (discount: Discount) => {
      setDiscountToDelete(discount);
      setIsDiscountDeleteModalOpen(true);
    };

    const handleOpenCreateDiscount = () => {
        setEditingDiscount(null);
        setIsDiscountFormOpen(true);
    };
    
    const handleOpenEditDiscount = (discount: Discount) => {
        setEditingDiscount(discount);
        setIsDiscountFormOpen(true);
    };
    
    // Fungsi seleksi tidak berubah
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
            {/* ... (Semua komponen Modal tetap sama) ... */}
            <DiscountFormModal isOpen={isDiscountFormOpen} onClose={() => setIsDiscountFormOpen(false)} onSave={handleSaveDiscount} isLoading={isPending} initialData={editingDiscount} />
            <ApplyDiscountModal isOpen={isApplyDiscountModalOpen} onClose={() => setIsApplyDiscountModalOpen(false)} onApply={handleApplyDiscount} discounts={activeDiscounts} isLoading={isPending} selectedFontCount={selectedFonts.length} />
            <ManageDiscountsModal isOpen={isManageDiscountsModalOpen} onClose={() => setIsManageDiscountsModalOpen(false)} discounts={allDiscounts} onOpenConfirm={openDiscountDeleteModal} onOpenEdit={handleOpenEditDiscount} isLoading={isPending} />
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} itemsToDelete={fontsToDelete} itemType="font" isLoading={isPending} />
            <DeleteConfirmationModal isOpen={isDiscountDeleteModalOpen} onClose={() => setIsDiscountDeleteModalOpen(false)} onConfirm={confirmDiscountDelete} itemsToDelete={discountToDelete ? [discountToDelete] : []} itemType="discount" isLoading={isPending} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manage Fonts</h1>
                    <div className="w-20 h-1 bg-brand-orange my-4"></div>
                    <p className="text-gray-500 mt-1">Add, edit, and manage all your font products.</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={handleOpenCreateDiscount} className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Create Discount</button>
                   <button onClick={() => setIsManageDiscountsModalOpen(true)} className="bg-gray-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"><Settings size={18} /> Manage Discounts</button>
                  <Link href="/admin/fonts/new"><span className="bg-brand-orange text-white font-medium py-2 px-4 rounded-lg hover:bg-brand-orange-hover transition-colors flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Add New Font</span></Link>
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
                            <button onClick={() => setIsApplyDiscountModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200"><Tag className="w-4 h-4" /> Apply Discount</button>
                            <button onClick={() => { const fontsToActOn = paginatedFonts.filter(f => selectedFonts.includes(f.id)); openDeleteModal(fontsToActOn); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"><Trash2 className="w-4 h-4" /> Delete Selected</button>
                        </div>
                    </div>
                )}
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 w-4"><input type="checkbox" onChange={handleSelectAll} checked={isAllOnPageSelected} /></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Font Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bestseller</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading || isPending ? (
                            <tr><td colSpan={8} className="text-center py-8">Loading fonts...</td></tr>
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
                                                <Link href={`/admin/fonts/edit/${font.id}`} className="font-medium text-gray-900 hover:text-brand-orange">{font.name}</Link>
                                                {discountInfo && (
                                                    <div className="text-xs text-green-600 font-bold mt-1">
                                                        <div className="flex items-center gap-1"><Tag className="w-3 h-3"/>{discountInfo.name} ({discountInfo.percentage}%)</div>
                                                        <div className="font-normal text-gray-500">{formatDate(discountInfo.start_date)} - {formatDate(discountInfo.end_date)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><SwitchToggle label="" checked={!!font.is_bestseller} onChange={() => handleStatusUpdate(font.id, { is_bestseller: !font.is_bestseller })}/></td>
                                    <td className="px-6 py-4"><StatusBadge status={font.status} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{font.order_items[0]?.count || 0}</td>
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
                            <tr><td colSpan={8} className="text-center py-8 text-gray-500">No fonts found matching your criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </div>
    );
}