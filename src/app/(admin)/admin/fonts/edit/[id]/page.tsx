// src/app/(admin)/admin/fonts/edit/[id]/page.tsx
'use client';

import { useState, useEffect, useTransition, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { updateFontAction } from '@/app/actions/fontActions';
import FileUploadProgress from '@/components/admin/FileUploadProgress';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import opentype from 'opentype.js';

type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];

type FontFormData = {
  name: string;
  slug: string;
  description: string;
  is_bestseller: boolean;
  tags: string[];
  price_desktop: number;
  price_standard_commercial: number;
  price_extended_commercial: number;
  price_corporate: number;
  glyph_string: string;
  file_types: string;
  file_size: string;
  product_information: string[];
  styles: string[];
  status: 'Published' | 'Draft';
  category_id: string;
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
  const params = useParams();
  const fontId = params.id as string;

  const [formData, setFormData] = useState<Partial<FontFormData>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [fileUrls, setFileUrls] = useState<Record<string, string | null>>({});
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});

  const isAnyFileUploading = useMemo(() => {
    return Object.values(uploadingStatus).some(status => status === true) || isGalleryUploading;
  }, [uploadingStatus, isGalleryUploading]);

  const scanGlyphs = async (fileUrl: string) => {
    try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const font = opentype.parse(arrayBuffer);
        let glyphs = '';
        for (let i = 0; i < font.numGlyphs; i++) {
          const glyph = font.glyphs.get(i);
          if (glyph.unicode) {
            const char = String.fromCharCode(glyph.unicode);
            if (char.trim().length > 0 || char === ' ') glyphs += char;
          }
        }
        setFormData(prev => ({ ...prev, glyph_string: glyphs }));
        toast.success('Glyphs re-scanned successfully!');
    // <-- PERBAIKAN ESLINT: Mengganti (err) dengan (e: unknown) untuk type safety
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast.error(`Failed to scan glyphs: ${message}`);
    }
  };

  useEffect(() => {
    if (!fontId) return;

    const fetchInitialData = async () => {
      setIsLoading(true);
      const { data: fontData, error } = await supabase.from('fonts').select(`*`).eq('id', fontId).single();

      if (error || !fontData) {
        toast.error('Failed to fetch font data: ' + error?.message);
        return;
      }
      
      setFormData({
        name: fontData.name,
        slug: fontData.slug,
        description: fontData.description,
        is_bestseller: fontData.is_bestseller ?? false,
        tags: (fontData.tags as string[]) || [],
        price_desktop: fontData.price_desktop,
        price_standard_commercial: fontData.price_standard_commercial || 0,
        price_extended_commercial: fontData.price_extended_commercial || 0,
        price_corporate: fontData.price_corporate,
        glyph_string: fontData.glyph_string,
        file_types: fontData.file_types,
        file_size: fontData.file_size,
        product_information: (fontData.product_information as string[]) || [],
        styles: (fontData.styles as string[]) || [],
        status: fontData.status as 'Published' | 'Draft',
        category_id: fontData.category_id,
        partner_id: fontData.partner_id,
      });

      setFileUrls({
        main_image_url: fontData.main_image_url,
        downloadable_file_url: fontData.downloadable_file_url,
        display_font_regular_url: fontData.display_font_regular_url,
        display_font_italic_url: fontData.display_font_italic_url,
      });
      setGalleryImageUrls((fontData.gallery_image_urls as string[]) || []);

      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: partnersData } = await supabase.from('partners').select('*');
      if (categoriesData) setCategories(categoriesData);
      if (partnersData) setPartners(partnersData);

      setIsLoading(false);
    };
    
    fetchInitialData();
  }, [fontId]);

  const handleUploadComplete = useCallback((fieldName: string, url: string | null, isUploading: boolean) => {
    setFileUrls(prev => ({ ...prev, [fieldName]: url }));
    setUploadingStatus(prev => ({...prev, [fieldName]: isUploading }));
  }, []);
  
  const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
    setGalleryImageUrls(urls);
    setIsGalleryUploading(isUploading);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'name' && value) {
      const newSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };
  
  const handleSubmit = (formData: FormData) => {
    if (isAnyFileUploading) {
        toast.error("Please wait for all uploads to finish.");
        return;
    }
    
    Object.entries(fileUrls).forEach(([key, value]) => {
        formData.append(key, value || '');
    });
    galleryImageUrls.forEach(url => formData.append('gallery_image_urls', url));
    
    startTransition(() => {
        updateFontAction(fontId, formData);
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-lg font-medium">Loading font details...</div>
  }
  
  return (
    <form ref={formRef} action={handleSubmit} className="pb-24">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Font: {formData.name}</h1>
                <p className="text-gray-500 mt-1">Update the details for this font product.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label className="font-medium">Font Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <label className="font-medium">Slug</label>
                    <input type="text" name="slug" value={formData.slug || ''} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly />
                </div>
                <div>
                    <label className="font-medium">Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={5} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Licensing Prices</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Desktop Price</label><input type="number" step="0.01" name="price_desktop" value={formData.price_desktop || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Standard Commercial</label><input type="number" step="0.01" name="price_standard_commercial" value={formData.price_standard_commercial || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Extended Commercial</label><input type="number" step="0.01" name="price_extended_commercial" value={formData.price_extended_commercial || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Corporate Price</label><input type="number" step="0.01" name="price_corporate" value={formData.price_corporate || 0} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
                    </div>
                </div>
                <TagInput label="Product Information" tags={formData.product_information as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, product_information: newTags }))} />
                <TagInput label="Styles" tags={formData.styles as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, styles: newTags }))} />
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                 <div>
                    <label className="font-medium">Status</label>
                    <select name="status" value={formData.status || 'Draft'} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="is_bestseller" className="font-medium">Bestseller</label>
                    <input type="checkbox" id="is_bestseller" name="is_bestseller" checked={formData.is_bestseller || false} onChange={handleInputChange} className="toggle toggle-warning" />
                </div>
                <div>
                    <label className="font-medium">Category</label>
                    <select name="category_id" value={formData.category_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">Select a category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                </div>
                <div>
                    <label className="font-medium">Partner (Optional)</label>
                    <select name="partner_id" value={formData.partner_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1"><option value="">None (Operatype)</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>
                <TagInput label="Tags" tags={formData.tags as string[] || []} setTags={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))} />
            </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Files & Images</h3>
            <p className="text-sm text-gray-500 mb-4 -mt-2">File yang sudah ada akan diganti jika Anda mengunggah file baru. Tombol `Save` akan nonaktif selama proses unggah berlangsung.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FileUploadProgress 
                    label="Main Preview Image" 
                    bucket="font_images" 
                    fileTypes={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }} 
                    onUploadComplete={handleUploadComplete.bind(null, 'main_image_url')}
                    isPublic={true}
                    existingFileUrl={fileUrls.main_image_url}
                />
                <GalleryImageUploader 
                    initialUrls={galleryImageUrls}
                    onUploadChange={handleGalleryUploadChange} 
                />
            </div>
            <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <FileUploadProgress 
                        label="Downloadable Font File (ZIP)" 
                        bucket="downloadable-files" 
                        fileTypes={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }} 
                        onUploadComplete={handleUploadComplete.bind(null, 'downloadable_file_url')}
                        isPublic={false}
                        existingFileUrl={fileUrls.downloadable_file_url}
                    />
                     <FileUploadProgress 
                        label="Font Display File (Regular)" 
                        bucket="display-fonts" 
                        fileTypes={{ 'font/otf': ['.otf'], 'font/ttf': ['.ttf'] }} 
                        onUploadComplete={(url, isUploading) => {
                            handleUploadComplete('display_font_regular_url', url, isUploading);
                            if (url) {
                                scanGlyphs(url);
                            }
                        }}
                        isPublic={true}
                        existingFileUrl={fileUrls.display_font_regular_url}
                    />
                     <FileUploadProgress 
                        label="Font Display File (Italic)" 
                        bucket="display-fonts" 
                        fileTypes={{ 'font/otf': ['.otf'], 'font/ttf': ['.ttf'] }} 
                        onUploadComplete={handleUploadComplete.bind(null, 'display_font_italic_url')}
                        isPublic={true}
                        existingFileUrl={fileUrls.display_font_italic_url}
                    />
                </div>
            </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Glyph Display</h3>
            <p className="text-sm text-gray-500 mb-2">Glyphs will be scanned automatically when you upload a new `Regular` display font.</p>
            <textarea
                name="glyph_string"
                value={formData.glyph_string || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, glyph_string: e.target.value }))}
                rows={4}
                className="w-full p-2 border rounded-md"
            />
        </div>

        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-top z-40">
            <div className="max-w-screen-xl mx-auto flex justify-end">
                <button 
                    type="submit" 
                    disabled={isPending || isAnyFileUploading} 
                    className="bg-brand-orange text-white font-medium py-3 px-8 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] text-center"
                >
                    {/* <-- PERBAIKAN ESLINT: Mengganti ' dengan " untuk string literals */}
                    {isPending ? "Saving..." : isAnyFileUploading ? "Uploading..." : "Save Changes"}
                </button>
            </div>
        </div>
    </form>
  );
}