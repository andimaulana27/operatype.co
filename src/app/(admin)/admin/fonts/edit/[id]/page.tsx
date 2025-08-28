'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { Database } from '@/lib/database.types';
import opentype from 'opentype.js';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@/components/icons';
import { Trash2 } from 'lucide-react';
import { updateFontAction } from '@/app/actions/fontActions';

type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];

// Perbarui tipe data FontFormData untuk menyertakan harga baru
type FontFormData = {
  name: string;
  slug: string;
  description: string;
  is_bestseller: boolean;
  tags: string[];
  price_desktop: number;
  price_standard_commercial: number; // <-- BARU
  price_extended_commercial: number; // <-- BARU
  price_corporate: number;
  glyph_string: string;
  file_types: string;
  file_size: string;
  product_information: string[];
  styles: string[];
  status: 'Published' | 'Draft';
  category_id: string | null;
  partner_id: string | null;
};

const TagInput = ({ label, tags, setTags }: { label: string, tags: string[], setTags: (tags: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  return (
    <div>
       <label className="font-medium">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 mt-1 border rounded-md p-2">
        {tags.map(tag => (
          <span key={tag} className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full flex items-center">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
          </span>
        ))}
      </div>
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Add ${label.toLowerCase()} (press Enter)`} className="w-full p-2 border rounded-md"/>
    </div>
  );
};

export default function EditFontPage() {
  const router = useRouter();
  const params = useParams();
  const fontId = params.id as string;

  const [formData, setFormData] = useState<Partial<FontFormData>>({});
  const [files, setFiles] = useState<{ 
    mainImage?: File; 
    galleryImages: File[];
    displayFontRegular?: File; 
    displayFontItalic?: File;
    downloadableFile?: File 
  }>({ galleryImages: [] });
  
  const [existingImageUrls, setExistingImageUrls] = useState({
    main: '',
    gallery: [] as string[]
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, startTransition] = useTransition();

  useEffect(() => {
    if (!fontId) return;

    const fetchFontData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('fonts').select(`*`).eq('id', fontId).single();

      if (error || !data) {
        toast.error('Failed to fetch font data: ' + error?.message);
        router.push('/admin/fonts');
        return;
      }
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description,
        is_bestseller: data.is_bestseller ?? false,
        tags: (data.tags as string[]) || [],
        price_desktop: data.price_desktop,
        price_standard_commercial: data.price_standard_commercial || 0, // <-- BARU
        price_extended_commercial: data.price_extended_commercial || 0, // <-- BARU
        price_corporate: data.price_corporate,
        glyph_string: data.glyph_string,
        file_types: data.file_types,
        file_size: data.file_size,
        product_information: (data.product_information as string[]) || [],
        styles: (data.styles as string[]) || [],
        status: data.status as 'Published' | 'Draft',
        category_id: data.category_id,
        partner_id: data.partner_id,
      });
      setExistingImageUrls({ main: data.main_image_url || '', gallery: (data.gallery_image_urls as string[]) || [] });
      setIsLoading(false);
    };

    const fetchDropdownData = async () => {
        const { data: categoriesData } = await supabase.from('categories').select('*');
        const { data: partnersData } = await supabase.from('partners').select('*');
        if (categoriesData) setCategories(categoriesData);
        if (partnersData) setPartners(partnersData);
    };
    fetchFontData();
    fetchDropdownData();
  }, [fontId, router]);

  const onDropMainImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) setFiles(prev => ({ ...prev, mainImage: acceptedFiles[0] }));
  }, []);

  const { getRootProps: mainImageRootProps, getInputProps: mainImageInputProps, isDragActive: mainImageIsDragActive } = useDropzone({
    onDrop: onDropMainImage, accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }, maxFiles: 1,
  });

  const onDropGallery = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) setFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...acceptedFiles].slice(0, 15) }));
  }, []);

  const { getRootProps: galleryRootProps, getInputProps: galleryInputProps, isDragActive: galleryIsDragActive } = useDropzone({
    onDrop: onDropGallery, accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
  });

  const removeNewGalleryImage = (index: number) => {
    setFiles(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  }

  const removeExistingGalleryImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => ({ ...prev, gallery: prev.gallery.filter(url => url !== urlToRemove) }));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'name') {
      const newSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
        const file = inputFiles[0];
        setFiles(prev => ({ ...prev, [name]: file }));
        if (name === 'downloadableFile') {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            setFormData(prev => ({ ...prev, file_size: `${sizeInMB} MB` }));
        }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const updateData: any = { ...formData };

        const uploadAndGetUrl = async (file: File, bucket: string, isPublic: boolean = true) => {
            const { data, error } = await supabase.storage.from(bucket).upload(`${Date.now()}_${file.name}`, file);
            if (error) throw new Error(`Error uploading ${file.name}: ${error.message}`);
            if (isPublic) {
                return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
            }
            return data.path;
        };

        await toast.promise(
            (async () => {
                if (files.mainImage) { updateData.main_image_url = await uploadAndGetUrl(files.mainImage, 'font_images'); }
                if (files.galleryImages.length > 0) {
                    const newUrls = await Promise.all(files.galleryImages.map(file => uploadAndGetUrl(file, 'font_images')));
                    updateData.gallery_image_urls = [...existingImageUrls.gallery, ...newUrls];
                } else {
                    updateData.gallery_image_urls = existingImageUrls.gallery;
                }
                if (files.downloadableFile) { updateData.downloadable_file_url = await uploadAndGetUrl(files.downloadableFile, 'downloadable-files', false); }
                if (files.displayFontRegular) { updateData.display_font_regular_url = await uploadAndGetUrl(files.displayFontRegular, 'display-fonts'); }
                if (files.displayFontItalic) { updateData.display_font_italic_url = await uploadAndGetUrl(files.displayFontItalic, 'display-fonts'); }
            })(),
            {
                loading: 'Uploading new files (if any)...',
                success: 'File upload process complete!',
                error: (err: any) => `Upload failed: ${err.message}`,
            }
        );

        const result = await updateFontAction(fontId, updateData);

        if (result.error) {
            throw new Error(result.error);
        }
        
        toast.success('Font updated successfully! Redirecting...');
        router.push('/admin/fonts');
        router.refresh();

      } catch (error: any) {
          toast.error(`An error occurred: ${error.message}`);
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-lg font-medium">Loading font details...</div>
  }
  
  return (
    <form onSubmit={handleSubmit} className="pb-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Font: {formData.name}</h1>
                <p className="text-gray-500 mt-1">Update the details for this font product.</p>
            </div>
            <button type="submit" disabled={isUpdating} className="bg-brand-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50">
                {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label className="font-medium">Font Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <label className="font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={5} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                {/* ==================== PERBAIKAN HARGA LISENSI ==================== */}
                <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Licensing Prices</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Desktop Price</label><input type="number" step="0.01" name="price_desktop" value={formData.price_desktop || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Standard Commercial Price</label><input type="number" step="0.01" name="price_standard_commercial" value={formData.price_standard_commercial || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Extended Commercial Price</label><input type="number" step="0.01" name="price_extended_commercial" value={formData.price_extended_commercial || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Corporate Price</label><input type="number" step="0.01" name="price_corporate" value={formData.price_corporate || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                    </div>
                </div>
                {/* ==================================================================== */}
                <div><TagInput label="Product Information" tags={formData.product_information as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, product_information: newTags }))} /></div>
                <div><TagInput label="Styles" tags={formData.styles as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, styles: newTags }))} /></div>
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                 <div>
                    <label className="font-medium">Status</label>
                    <select name="status" value={formData.status || 'Draft'} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
                <div>
                    <label className="font-medium">Category</label>
                    <select name="category_id" value={formData.category_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">Select a category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                </div>
                <div>
                    <label className="font-medium">Partner (Optional)</label>
                    <select name="partner_id" value={formData.partner_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">None (Operatype)</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>
                <div>
                    <TagInput label="Tags" tags={formData.tags as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))} />
                </div>
            </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Files & Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="font-medium block mb-2">Main Preview Image</label>
                    <div {...mainImageRootProps()} className={`relative group w-full h-80 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${mainImageIsDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input {...mainImageInputProps()} />
                        {files.mainImage ? ( <Image src={URL.createObjectURL(files.mainImage)} alt="New Preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" /> ) 
                        : existingImageUrls.main ? ( <Image src={existingImageUrls.main} alt="Current Preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" /> ) 
                        : ( <div className="text-gray-500 flex flex-col items-center justify-center"><PhotoIcon className="w-16 h-16 text-gray-400 mb-2" /><p className="font-semibold text-brand-orange">Click to upload or drag and drop</p></div> )}
                         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white">Change Image</p></div>
                    </div>
                </div>
                <div>
                    <label className="font-medium block mb-2">Gallery Images (Max 15)</label>
                    <div {...galleryRootProps()} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 ${galleryIsDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input {...galleryInputProps()} />
                        <p className="text-gray-500">Click or drag to add new images</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Current images (click to remove) and new images (green border):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {existingImageUrls.gallery.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group aspect-square cursor-pointer" onClick={() => removeExistingGalleryImage(url)}>
                                <Image src={url} alt={`existing-gallery-${index}`} fill style={{ objectFit: 'cover' }} className="rounded-md" />
                                <div className="absolute inset-0 bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-75 transition-opacity"><Trash2 className="w-6 h-6 text-white" /></div>
                            </div>
                        ))}
                         {files.galleryImages.map((file, index) => (
                            <div key={`new-${index}`} className="relative group aspect-square">
                                <Image src={URL.createObjectURL(file)} alt={`new-gallery-${index}`} fill style={{ objectFit: 'cover' }} className="rounded-md border-2 border-green-500" />
                                <div onClick={() => removeNewGalleryImage(index)} className="absolute top-0 right-0 m-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">&times;</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="font-medium">Font Display File (Regular)</label><input type="file" name="displayFontRegular" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".otf,.ttf" /></div>
                    <div><label className="font-medium">Font Display File (Italic)</label><input type="file" name="displayFontItalic" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".otf,.ttf" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="font-medium">Downloadable Font File (ZIP)</label><input type="file" name="downloadableFile" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".zip" /></div>
                    <div><label className="font-medium">File Size</label><input type="text" name="file_size" value={formData.file_size || ''} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly /></div>
                </div>
            </div>
        </div>
    </form>
  );
}