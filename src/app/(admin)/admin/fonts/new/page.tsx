// src/app/(admin)/admin/fonts/new/page.tsx
'use client';

import { useState, useEffect, useTransition, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import opentype from 'opentype.js';
import toast from 'react-hot-toast';
import { addFontAction } from '@/app/actions/fontActions';
import FileUploadProgress from '@/components/admin/FileUploadProgress';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import TagInput from '@/components/admin/TagInput';

type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];

export default function AddNewFontPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [productInfo, setProductInfo] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>(['Regular']);
  const [slug, setSlug] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [glyphString, setGlyphString] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [uploadedFileUrls, setUploadedFileUrls] = useState<Record<string, string | null>>({
    main_image_url: null,
    downloadable_file_url: null,
    display_font_regular_url: null,
    display_font_italic_url: null,
  });
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});

  const isAnyFileUploading = useMemo(() => {
    return Object.values(uploadingStatus).some(status => status === true) || isGalleryUploading;
  }, [uploadingStatus, isGalleryUploading]);

  const areRequiredFilesReady = useMemo(() => {
    return uploadedFileUrls.main_image_url && 
           uploadedFileUrls.downloadable_file_url && 
           uploadedFileUrls.display_font_regular_url;
  }, [uploadedFileUrls]);
  
  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: partnersData } = await supabase.from('partners').select('*');
      if (categoriesData) setCategories(categoriesData);
      if (partnersData) setPartners(partnersData);
    };
    fetchDropdownData();
  }, []);

  const handleUploadComplete = useCallback((fieldName: string, url: string | null, isUploading: boolean, size?: number) => {
    if(url !== null) {
      setUploadedFileUrls(prev => ({ ...prev, [fieldName]: url }));
    }
    setUploadingStatus(prev => ({...prev, [fieldName]: isUploading }));

    if (fieldName === 'downloadable_file_url' && size) {
        const sizeInMB = (size / (1024 * 1024)).toFixed(2);
        setFileSize(`${sizeInMB} MB`);
    }
  }, []);
  
  const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
    setGalleryImageUrls(urls);
    setIsGalleryUploading(isUploading);
  }, []);
  
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
        setGlyphString(glyphs);
        toast.success('Glyphs scanned successfully!');
    } catch(err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast.error(`Failed to scan glyphs: ${message}`);
    }
  };
  
  const handleSubmit = (formData: FormData) => {
    if (isAnyFileUploading) {
        toast.error("Please wait for all file uploads to complete.");
        return;
    }
    if (!areRequiredFilesReady) {
        toast.error("Please upload all required files (*).");
        return;
    }
    
    Object.entries(uploadedFileUrls).forEach(([key, value]) => {
        if(value) formData.append(key, value);
    });
    galleryImageUrls.forEach(url => formData.append('gallery_image_urls', url));
    formData.append('file_size', fileSize);
    formData.append('glyph_string', glyphString);
    
    startTransition(() => {
        addFontAction(formData);
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="pb-24">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Add New Font</h1>
                <p className="text-gray-500 mt-1">Fill in the details below to add a new product.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label className="font-medium">Font Name</label>
                    <input type="text" name="name" onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <label className="font-medium">Slug</label>
                    <input type="text" name="slug" value={slug} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly />
                </div>
                <div>
                    <label className="font-medium">Description</label>
                    <textarea name="description" rows={5} className="w-full p-2 border rounded-md mt-1" required />
                </div>
                <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Licensing Prices</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Desktop Price</label><input type="number" step="0.01" name="price_desktop" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Standard Commercial Price</label><input type="number" step="0.01" name="price_standard_commercial" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Extended Commercial Price</label><input type="number" step="0.01" name="price_extended_commercial" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Corporate Price</label><input type="number" step="0.01" name="price_corporate" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                    </div>
                </div>
                {/* --- PERUBAHAN DI SINI: Placeholder diubah --- */}
                <TagInput name="product_information" label="Product Information" tags={productInfo} setTags={setProductInfo} placeholder="Add features (separate with commas)..."/>
                <TagInput name="styles" label="Styles" tags={styles} setTags={setStyles} placeholder="Add styles (separate with commas)..."/>
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label className="font-medium">Status</label>
                    <select name="status" defaultValue="Draft" className="w-full p-2 border rounded-md mt-1"><option value="Draft">Draft</option><option value="Published">Published</option></select>
                </div>
                 <div className="flex items-center gap-4">
                    <label htmlFor="is_bestseller" className="font-medium">Bestseller</label>
                    <input type="checkbox" id="is_bestseller" name="is_bestseller" className="toggle toggle-warning" />
                </div>
                <div>
                    <label className="font-medium">Category</label>
                    <select name="category_id" className="w-full p-2 border rounded-md mt-1" required><option value="">Select a category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                </div>
                <div>
                    <label className="font-medium">Partner (Optional)</label>
                    <select name="partner_id" className="w-full p-2 border rounded-md mt-1"><option value="">None (Operatype)</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>
                <TagInput name="tags" label="Tags" tags={tags} setTags={setTags} placeholder="Add tags (separate with commas)..."/>
            </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Files & Images</h3>
            {/* --- PERUBAHAN DI SINI: Teks penjelasan diubah --- */}
            <p className="text-sm text-gray-500 mb-4 -mt-2">File upload will start automatically. The &quot;Save Font&quot; button will be enabled after all required files (*) are uploaded.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FileUploadProgress 
                    label={<>Main Preview Image {'*'}</>} 
                    bucket="font_images" 
                    fileTypes={{ 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }} 
                    onUploadComplete={handleUploadComplete.bind(null, 'main_image_url')}
                    isPublic={true}
                />
                <GalleryImageUploader onUploadChange={handleGalleryUploadChange} />
            </div>
            <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <FileUploadProgress 
                        label={<>Downloadable Font File (ZIP) {'*'}</>}
                        bucket="downloadable-files" 
                        fileTypes={{ 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] }} 
                        onUploadComplete={handleUploadComplete.bind(null, 'downloadable_file_url')}
                        isPublic={false}
                    />
                     <FileUploadProgress 
                        label={<>Font Display File (Regular) {'*'}</>} 
                        bucket="display-fonts" 
                        fileTypes={{ 'font/otf': ['.otf'], 'font/ttf': ['.ttf'] }} 
                        onUploadComplete={(url, isUploading, size) => {
                            handleUploadComplete('display_font_regular_url', url, isUploading, size);
                            if (url) scanGlyphs(url);
                        }}
                        isPublic={true}
                    />
                     <FileUploadProgress 
                        label="Font Display File (Italic)" 
                        bucket="display-fonts" 
                        fileTypes={{ 'font/otf': ['.otf'], 'font/ttf': ['.ttf'] }} 
                        onUploadComplete={handleUploadComplete.bind(null, 'display_font_italic_url')}
                        isPublic={true}
                    />
                </div>
                <input type="hidden" name="file_types" value="OTF, TTF, WOFF" />
            </div>
        </div>
      
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Glyph Display</h3>
            <p className="text-sm text-gray-500 mb-2">Glyphs are scanned automatically from the display font file (Regular).</p>
            <textarea 
                name="glyph_string"
                value={glyphString} 
                onChange={(e) => setGlyphString(e.target.value)}
                rows={4} 
                className="w-full p-2 border rounded-md" 
            />
        </div>

        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-top z-40">
            <div className="max-w-screen-xl mx-auto flex justify-end">
                <button 
                    type="submit" 
                    disabled={isPending || !areRequiredFilesReady || isAnyFileUploading} 
                    className="bg-brand-orange text-white font-medium py-3 px-8 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] text-center"
                >
                    {isPending ? 'Saving...' : isAnyFileUploading ? 'Uploading Files...' : 'Save Font'}
                </button>
            </div>
        </div>
    </form>
  );
}