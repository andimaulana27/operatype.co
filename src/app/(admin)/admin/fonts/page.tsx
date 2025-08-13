'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/lib/database.types';
import { PlusCircle, Search, Trash2, ChevronDown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Tipe data dari file database.types.ts
type FontRow = Database['public']['Tables']['fonts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];
type DiscountInsert = Database['public']['Tables']['discounts']['Insert'];

type FontWithDetails = FontRow & {
  categories: Pick<Category, 'name'> | null;
  partners: Pick<Partner, 'name'> | null;
  orders: [{ count: number }];
};

const ITEMS_PER_PAGE = 10;

// Komponen Modal Konfirmasi Hapus
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, fontsToDelete, isLoading }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, fontsToDelete: FontWithDetails[], isLoading: boolean }) => {
    if (!isOpen) return null;

    const fontCount = fontsToDelete.length;
    const fontName = fontsToDelete.length === 1 ? `"${fontsToDelete[0].name}"` : `${fontCount} fonts`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Delete Font(s)
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete {fontName}? This will permanently remove the font and all its associated files from storage. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// BARU: Komponen Modal untuk Membuat Diskon Baru
const CreateDiscountModal = ({ isOpen, onClose, onSave, isLoading }: { isOpen: boolean, onClose: () => void, onSave: (discountData: DiscountInsert) => void, isLoading: boolean }) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = () => {
        if (!name || !percentage || !startDate || !endDate) {
            toast.error('Please fill all fields.');
            return;
        }
        const percValue = parseInt(percentage);
        if (percValue <= 0 || percValue > 100) {
            toast.error('Percentage must be between 1 and 100.');
            return;
        }
        if (new Date(startDate) >= new Date(endDate)) {
            toast.error('End date must be after the start date.');
            return;
        }
        
        onSave({
            name,
            percentage: percValue,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            is_active: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-4">Create New Discount</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g., Summer Sale 2025' className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Percentage (%)</label>
                        <input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder='e.g., 20' className="mt-1 block w-full p-2 border rounded-md" min="1" max="100"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Discount'}
                    </button>
                    <button type="button" onClick={onClose} disabled={isLoading} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const statusClasses = status === 'Published'
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${statusClasses}`}>
      {status || 'Draft'}
    </span>
  );
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

  // BARU: State untuk modal diskon
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fonts')
        .select(`*, categories(name), partners(name), orders(count)`)
        .order('created_at', { ascending: false });
        
      if (error) {
        toast.error(`Failed to fetch fonts: ${error.message}`);
      } else {
        setFonts(data as any);
      }
      setIsLoading(false);
    };
    
    const fetchDropdownData = async () => {
        const [categoriesResult, partnersResult] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('partners').select('*')
        ]);
        if (categoriesResult.data) setCategories(categoriesResult.data);
        if (partnersResult.data) setPartners(partnersResult.data);
    };

    fetchData();
    fetchDropdownData();
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
  
  const confirmDelete = async () => {
    setIsLoading(true);
    const idsToDelete = fontsToDelete.map(f => f.id);
    
    const deletePromise = async () => {
        const pathsToDelete = {
            font_images: [] as string[],
            'display-fonts': [] as string[],
            'downloadable-files': [] as string[],
        };

        const getPathFromUrl = (url: string, bucket: string) => {
            try {
                const path = new URL(url).pathname.split(`/${bucket}/`)[1];
                return path ? decodeURIComponent(path) : '';
            } catch (e) {
                console.error(`Invalid URL for getPathFromUrl: ${url}`);
                return '';
            }
        };

        fontsToDelete.forEach(font => {
            if (font.main_image_url) pathsToDelete.font_images.push(getPathFromUrl(font.main_image_url, 'font_images'));
            if (font.display_font_regular_url) pathsToDelete['display-fonts'].push(getPathFromUrl(font.display_font_regular_url, 'display-fonts'));
            if (font.display_font_italic_url) pathsToDelete['display-fonts'].push(getPathFromUrl(font.display_font_italic_url, 'display-fonts'));
            if (font.downloadable_file_url) pathsToDelete['downloadable-files'].push(font.downloadable_file_url);

            if (Array.isArray(font.gallery_image_urls)) {
                const galleryPaths = font.gallery_image_urls
                    .map((url: any) => {
                        if (typeof url === 'string') {
                            return getPathFromUrl(url, 'font_images');
                        }
                        return null;
                    })
                    .filter((path): path is string => !!path); 
                
                pathsToDelete.font_images.push(...galleryPaths);
            }
        });

        const storagePromises = Object.entries(pathsToDelete)
            .filter(([bucket, paths]) => paths.length > 0)
            .map(([bucket, paths]) => supabase.storage.from(bucket).remove(paths));

        const storageResults = await Promise.all(storagePromises);
        const storageError = storageResults.find(result => result.error);
        if (storageError) throw new Error(`Failed to delete files from storage: ${storageError.error?.message}`);

        const { error: dbError } = await supabase.from('fonts').delete().in('id', idsToDelete);
        if (dbError) throw dbError;
    };
    
    await toast.promise(
        deletePromise(),
        {
            loading: 'Deleting font(s) and associated files...',
            success: 'Successfully deleted!',
            error: (err) => `Failed to delete font(s): ${err.message || 'Unknown error'}`,
        }
    );

    setFonts(currentFonts => currentFonts.filter(font => !idsToDelete.includes(font.id)));
    setSelectedFonts([]);
    setIsDeleteModalOpen(false);
    setFontsToDelete([]);
    setIsLoading(false);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFonts(paginatedFonts.map(f => f.id));
    } else {
      setSelectedFonts([]);
    }
  };

  const handleSelectOne = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFonts(prev => [...prev, id]);
    } else {
      setSelectedFonts(prev => prev.filter(fontId => fontId !== id));
    }
  };
  
  const isAllOnPageSelected = paginatedFonts.length > 0 && paginatedFonts.every(f => selectedFonts.includes(f.id));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // BARU: Fungsi untuk menyimpan diskon baru
  const handleCreateDiscount = async (discountData: DiscountInsert) => {
    setIsLoading(true);
    const { error } = await supabase.from('discounts').insert([discountData]);

    if (error) {
        toast.error(`Failed to create discount: ${error.message}`);
    } else {
        toast.success('Discount created successfully!');
        setIsDiscountModalOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <div>
        <DeleteConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            fontsToDelete={fontsToDelete}
            isLoading={isLoading}
        />
        
        <CreateDiscountModal
            isOpen={isDiscountModalOpen}
            onClose={() => setIsDiscountModalOpen(false)}
            onSave={handleCreateDiscount}
            isLoading={isLoading}
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
            <button 
                onClick={() => {
                    const fontsToActOn = fonts.filter(f => selectedFonts.includes(f.id));
                    openDeleteModal(fontsToActOn);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
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
            ) : paginatedFonts.length > 0 ? paginatedFonts.map((font) => (
              <tr key={font.id} className="hover:bg-gray-50">
                <td className="p-4"><input type="checkbox" checked={selectedFonts.includes(font.id)} onChange={(e) => handleSelectOne(font.id, e.target.checked)} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Image className="h-16 w-16 rounded-md object-cover" src={font.main_image_url || '/placeholder.png'} alt={font.name || 'Font image'} width={64} height={64} />
                    <div className="font-medium text-gray-900">{font.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4"><StatusBadge status={font.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{font.orders[0]?.count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${font.price_desktop?.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(font.created_at)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/fonts/edit/${font.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <button onClick={() => openDeleteModal([font])} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            )) : (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No fonts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm border rounded-md disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}