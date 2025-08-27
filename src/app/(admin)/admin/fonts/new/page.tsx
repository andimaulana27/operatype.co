// src/app/(admin)/admin/fonts/new/page.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import opentype from 'opentype.js';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { PhotoIcon } from '@/components/icons';
import { addFontAction } from '@/app/actions/fontActions';

type Category = Database['public']['Tables']['categories']['Row'];
type Partner = Database['public']['Tables']['partners']['Row'];

const TagInput = ({ name, label, tags, setTags }: { name: string, label: string, tags: string[], setTags: (tags: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      const newTags = inputValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !tags.includes(tag));

      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
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
       {tags.map(tag => <input key={tag} type="hidden" name={name} value={tag} />)}
      <div className="flex flex-wrap gap-2 mb-2 mt-1 border rounded-md p-2">
        {tags.map(tag => (
          <span key={tag} className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full flex items-center">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
          </span>
        ))}
      </div>
      <input 
        type="text" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder={`Add ${label.toLowerCase()} (pisahkan dengan koma)`} 
        className="w-full p-2 border rounded-md"
      />
    </div>
  );
};

// ==================== PENAMBAHAN FUNGSI VALIDASI ====================
const MAX_PAYLOAD_SIZE_MB = 4; // Batas aman dalam MB (Vercel sekitar 4.5MB)
const MAX_PAYLOAD_SIZE_BYTES = MAX_PAYLOAD_SIZE_MB * 1024 * 1024;
// ====================================================================

export default function AddNewFontPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [productInfo, setProductInfo] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>(['Regular']);
  const [slug, setSlug] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [glyphString, setGlyphString] = useState('');

  const [files, setFiles] = useState<{ 
    mainImage?: File; 
    galleryImages: File[];
    displayFontRegular?: File; 
    displayFontItalic?: File;
    downloadableFile?: File 
  }>({ galleryImages: [] });

  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();

  const onDropMainImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFiles(prev => ({ ...prev, mainImage: acceptedFiles[0] }));
  }, []);
  const { getRootProps: mainImageRootProps, getInputProps: mainImageInputProps, isDragActive: mainImageIsDragActive } = useDropzone({ onDrop: onDropMainImage, accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] }, maxFiles: 1 });
  const onDropGallery = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFiles(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...acceptedFiles].slice(0, 15) }));
  }, []);
  const { getRootProps: galleryRootProps, getInputProps: galleryInputProps, isDragActive: galleryIsDragActive } = useDropzone({ onDrop: onDropGallery, accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] } });
  const removeGalleryImage = (indexToRemove: number) => {
    setFiles(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, index) => index !== indexToRemove) }));
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: partnersData } = await supabase.from('partners').select('*');
      if (categoriesData) setCategories(categoriesData);
      if (partnersData) setPartners(partnersData);
    };
    fetchDropdownData();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));
      if (name === 'displayFontRegular') scanGlyphs(file);
      if (name === 'downloadableFile') {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setFileSize(`${sizeInMB} MB`);
      }
    }
  };
  
  const scanGlyphs = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const font = opentype.parse(event.target?.result as ArrayBuffer);
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
      } catch (err: any) {
        toast.error(`Error parsing font file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // ==================== PERBAIKAN: Validasi Ukuran File ====================
    const totalSize = 
      (files.mainImage?.size || 0) +
      (files.galleryImages.reduce((sum, f) => sum + f.size, 0)) +
      (files.downloadableFile?.size || 0) +
      (files.displayFontRegular?.size || 0) +
      (files.displayFontItalic?.size || 0);

    if (totalSize > MAX_PAYLOAD_SIZE_BYTES) {
      toast.error(`Total file size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds the ${MAX_PAYLOAD_SIZE_MB} MB limit. Please reduce image sizes or gallery count.`);
      return;
    }
    // ====================================================================

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (files.mainImage) formData.append('mainImage', files.mainImage);
    files.galleryImages.forEach(file => formData.append('galleryImages', file));
    if (files.downloadableFile) formData.append('downloadableFile', files.downloadableFile);
    if (files.displayFontRegular) formData.append('displayFontRegular', files.displayFontRegular);
    if (files.displayFontItalic) formData.append('displayFontItalic', files.displayFontItalic);

    startTransition(async () => {
      const result = await addFontAction(formData);
      // Pengecekan result ditambahkan untuk menghindari error 'undefined'
      if (result?.error) { 
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        router.push('/admin/fonts');
      } else {
        // Fallback jika terjadi error tak terduga (seperti 413)
        toast.error('An unknown error occurred. The file might be too large.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Licensing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label>Desktop Price</label><input type="number" step="0.01" name="price_desktop" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Business Price</label><input type="number" step="0.01" name="price_business" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                        <div><label>Corporate Price</label><input type="number" step="0.01" name="price_corporate" defaultValue={0} className="w-full p-2 border rounded-md mt-1" required /></div>
                    </div>
                </div>
                <TagInput name="product_information" label="Product Information" tags={productInfo} setTags={setProductInfo} />
                <TagInput name="styles" label="Styles" tags={styles} setTags={setStyles} />
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <label className="font-medium">Status</label>
                    <select name="status" defaultValue="Draft" className="w-full p-2 border rounded-md mt-1"><option value="Draft">Draft</option><option value="Published">Published</option></select>
                </div>
                <div>
                    <label className="font-medium">Category</label>
                    <select name="category_id" className="w-full p-2 border rounded-md mt-1" required><option value="">Select a category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>
                </div>
                <div>
                    <label className="font-medium">Partner (Optional)</label>
                    <select name="partner_id" className="w-full p-2 border rounded-md mt-1"><option value="">None (Operatype)</option>{partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                </div>
                <TagInput name="tags" label="Tags" tags={tags} setTags={setTags} />
            </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Files & Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="font-medium block mb-2">Main Preview Image</label>
                    <div {...mainImageRootProps()} className={`relative group w-full h-80 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${mainImageIsDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}><input {...mainImageInputProps()} />{files.mainImage ? (<Image src={URL.createObjectURL(files.mainImage)} alt="Preview" fill style={{ objectFit: 'cover' }} className="rounded-lg" />) : (<div className="text-gray-500 flex flex-col items-center justify-center"><PhotoIcon className="w-16 h-16 text-gray-400 mb-2" /><p className="font-semibold text-brand-orange">Click to upload or drag and drop</p><p className="text-xs mt-1">PNG, JPG, WEBP</p></div>)}</div>
                </div>
                <div>
                    <label className="font-medium block mb-2">Gallery Images (Max 15)</label>
                    <div {...galleryRootProps()} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 ${galleryIsDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}><input {...galleryInputProps()} /><p className="text-gray-500">Click or drag up to 15 images here</p></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {files.galleryImages.map((file, index) => (
                            <div key={index} className="relative group aspect-square">
                                <Image src={URL.createObjectURL(file)} alt={`gallery-preview-${index}`} fill style={{ objectFit: 'cover' }} className="rounded-md border-2 border-green-500" />
                                <div onClick={() => removeGalleryImage(index)} className="absolute top-0 right-0 m-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">&times;</div>
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
                    <div><label className="font-medium">File Size</label><input type="text" name="file_size" value={fileSize} className="w-full p-2 border rounded-md mt-1 bg-gray-100" readOnly /></div>
                </div>
                <input type="hidden" name="file_types" value="OTF, TTF, WOFF" />
            </div>
        </div>
      
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Glyph Display</h3>
            <p className="text-sm text-gray-500 mb-2">Glyphs are scanned automatically from the display font file. You can edit them here if needed.</p>
            <textarea 
                name="glyph_string" 
                value={glyphString} 
                onChange={(e) => setGlyphString(e.target.value)}
                rows={4} 
                className="w-full p-2 border rounded-md bg-gray-100" 
            />
        </div>

        <div className="mt-8 border-t pt-6 flex justify-end">
            <button type="submit" disabled={isPending} className="bg-brand-orange text-white font-medium py-3 px-8 rounded-lg hover:bg-brand-orange-hover disabled:opacity-50 min-w-[150px] text-center">
                {isPending ? 'Saving...' : 'Save Font'}
            </button>
        </div>
    </form>
  );
}