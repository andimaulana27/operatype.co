// src/app/(admin)/admin/fonts/new/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import opentype from 'opentype.js';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@/components/icons';
import { addFontAction } from '@/app/actions/fontActions'; // DIPERBARUI: Import server action

type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];

type FontFormData = {
  name: string;
  slug: string;
  description: string;
  is_bestseller: boolean;
  tags: string[];
  price_desktop: number;
  price_business: number;
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

// Komponen TagInput (Tidak ada perubahan)
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
            <button onClick={() => removeTag(tag)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
          </span>
        ))}
      </div>
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Add ${label.toLowerCase()} (press Enter)`} className="w-full p-2 border rounded-md"/>
    </div>
  );
};


export default function AddNewFontPage() {
  const [formData, setFormData] = useState<FontFormData>({
    name: '', slug: '', description: '', is_bestseller: false, tags: [],
    price_desktop: 0, price_business: 0, price_corporate: 0,
    glyph_string: '', file_types: 'OTF, TTF, WOFF', file_size: '',
    product_information: [], styles: ['Regular'], status: 'Draft',
    category_id: null, partner_id: null,
  });

  const [files, setFiles] = useState<{ 
    mainImage?: File; 
    galleryImages: File[];
    displayFontRegular?: File; 
    displayFontItalic?: File;
    downloadableFile?: File 
  }>({
    galleryImages: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Dropzone Logic (Tidak ada perubahan)
  const onDropMainImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setFiles(prev => ({ ...prev, mainImage: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps: mainImageRootProps, getInputProps: mainImageInputProps, isDragActive: mainImageIsDragActive } = useDropzone({
    onDrop: onDropMainImage,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  const onDropGallery = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setFiles(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...acceptedFiles].slice(0, 15)
      }));
    }
  }, []);

  const { getRootProps: galleryRootProps, getInputProps: galleryInputProps, isDragActive: galleryIsDragActive } = useDropzone({
    onDrop: onDropGallery,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
  });

  const removeGalleryImage = (index: number) => {
    setFiles(prev => ({
        ...prev,
        galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  }

  // Fetch data dropdown (Tidak ada perubahan)
  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: partnersData } = await supabase.from('partners').select('*');
      if (categoriesData) setCategories(categoriesData);
      if (partnersData) setPartners(partnersData);
    };
    fetchDropdownData();
  }, []);

  // Handler input change (Tidak ada perubahan)
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
  
  // Handler file change (Tidak ada perubahan)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
        const file = inputFiles[0];
        setFiles(prev => ({ ...prev, [name]: file }));

        if (name === 'displayFontRegular') {
          scanGlyphs(file);
        }
        if (name === 'downloadableFile') {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            setFormData(prev => ({ ...prev, file_size: `${sizeInMB} MB` }));
        }
    }
  };

  // Scan Glyphs (Tidak ada perubahan)
  const scanGlyphs = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const font = opentype.parse(event.target?.result);
        let glyphs = '';
        for (let i = 0; i < font.numGlyphs; i++) {
          const glyph = font.glyphs.get(i);
          if (glyph.unicode) {
            const char = String.fromCharCode(glyph.unicode);
            if (char.trim().length > 0 || char === ' ') {
                glyphs += char;
            }
          }
        }
        setFormData(prev => ({ ...prev, glyph_string: glyphs }));
        toast.success('Glyphs scanned successfully!');
      } catch (err: any) {
        console.error("Font parsing error:", err);
        toast.error(`Error parsing font file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  // handleSubmit (DIROMBAK TOTAL)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        toast.error('Font Name is required.');
        return;
    }
    setIsLoading(true);

    const data = new FormData();

    // Tambahkan semua data teks ke FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        data.append(key, JSON.stringify(value));
      } else if (value !== null) {
        data.append(key, String(value));
      }
    });

    // Tambahkan semua file ke FormData
    if (files.mainImage) data.append('mainImage', files.mainImage);
    files.galleryImages.forEach(file => data.append('galleryImages', file));
    if (files.displayFontRegular) data.append('displayFontRegular', files.displayFontRegular);
    if (files.displayFontItalic) data.append('displayFontItalic', files.displayFontItalic);
    if (files.downloadableFile) data.append('downloadableFile', files.downloadableFile);

    // Tampilkan notifikasi toast selama proses server action
    await toast.promise(
      addFontAction(data).then(result => {
        if (result.error) {
          throw new Error(result.error);
        }
        // Jika berhasil, redirect setelah sedikit jeda
        setTimeout(() => {
          router.push('/admin/fonts');
        }, 1500);
        return result.success;
      }),
      {
        loading: 'Saving font and uploading files...',
        success: (message) => `${message} Redirecting...`,
        error: (err) => `${err.message}`,
      }
    );

    setIsLoading(false);
  };

  // Render JSX (Tidak ada perubahan signifikan)
  return (
    <form onSubmit={handleSubmit} className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Add New Font</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to add a new product.</p>
        </div>
        <button type="submit" disabled={isLoading} className="bg-brand-orange text-white font-medium py-2 px-6 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Font'}
        </button>
      </div>

      {/* Sisa dari JSX (Form fields, Dropzones, etc.) tetap sama persis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="font-medium">Font Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required />
          </div>
          <div>
            <label className="font-medium">Slug</label>
            <input type="text" name="slug" value={formData.slug} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly />
          </div>
          <div>
            <label className="font-medium">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full p-2 border rounded-md mt-1" required />
          </div>

          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Licensing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label>Desktop Price</label><input type="number" step="0.01" name="price_desktop" value={formData.price_desktop} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
              <div><label>Business Price</label><input type="number" step="0.01" name="price_business" value={formData.price_business} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
              <div><label>Corporate Price</label><input type="number" step="0.01" name="price_corporate" value={formData.price_corporate} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1" required /></div>
            </div>
          </div>
          
          <div><TagInput label="Product Information" tags={formData.product_information} setTags={(newTags) => setFormData(prev => ({ ...prev, product_information: newTags }))} /></div>
          <div><TagInput label="Styles" tags={formData.styles} setTags={(newTags) => setFormData(prev => ({ ...prev, styles: newTags }))} /></div>
        </div>
        
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
           <div>
            <label className="font-medium">Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Category</label>
            <select name="category_id" value={formData.category_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Partner (Optional)</label>
            <select name="partner_id" value={formData.partner_id || ''} onChange={handleInputChange} className="w-full p-2 border rounded-md mt-1">
              <option value="">None (Operatype)</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <TagInput label="Tags" tags={formData.tags} setTags={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleInputChange} className="h-4 w-4" />
            <label>Mark as Bestseller</label>
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
                    {files.mainImage ? (
                        <>
                            <Image src={URL.createObjectURL(files.mainImage)} alt="Preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white">Click or drag to replace</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center justify-center">
                            <PhotoIcon className="w-16 h-16 text-gray-400 mb-2" />
                            <p className="font-semibold text-brand-orange">Click to upload or drag and drop</p>
                            <p className="text-xs mt-1">PNG, JPG, WEBP (2250x1500px ideal)</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="font-medium block mb-2">Gallery Images (Max 15)</label>
                <div {...galleryRootProps()} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 ${galleryIsDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input {...galleryInputProps()} />
                     <div className="text-gray-500">
                        <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p>Click or drag up to 15 images here</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {files.galleryImages.map((file, index) => (
                        <div key={index} className="relative group aspect-square">
                            <Image src={URL.createObjectURL(file)} alt={`gallery-preview-${index}`} fill style={{ objectFit: 'cover' }} className="rounded-md" />
                            <div onClick={() => removeGalleryImage(index)} className="absolute top-0 right-0 m-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                                &times;
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">Font Display File (Regular .otf/.ttf)</label><input type="file" name="displayFontRegular" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".otf,.ttf" /></div>
                <div><label className="font-medium">Font Display File (Italic .otf/.ttf)</label><input type="file" name="displayFontItalic" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".otf,.ttf" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-medium">Downloadable Font File (ZIP)</label><input type="file" name="downloadableFile" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-md" accept=".zip" /></div>
                <div><label className="font-medium">File Size</label><input type="text" name="file_size" value={formData.file_size} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly /></div>
            </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Glyph Display</h3>
        <p className="text-sm text-gray-500 mb-2">Glyphs are scanned automatically from the display font file. You can edit them here if needed.</p>
        <textarea name="glyph_string" value={formData.glyph_string} onChange={handleInputChange} rows={4} className="w-full p-2 border rounded-md bg-gray-100" />
      </div>
    </form>
  );
}