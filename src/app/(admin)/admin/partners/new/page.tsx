// src/app/(admin)/admin/partners/new/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { PhotoIcon } from '@/components/icons';

export default function AddNewPartnerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setLogoFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.svg'] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Partner Name is required.');
      return;
    }
    setIsLoading(true);

    try {
      let logo_url = '';

      // 1. Upload logo jika ada file yang dipilih
      if (logoFile) {
        const filePath = `${Date.now()}_${logoFile.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('partner_logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('partner_logos')
          .getPublicUrl(data.path);
        
        logo_url = urlData.publicUrl;
      }

      // 2. Buat slug dari nama partner
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      // 3. Simpan data ke tabel 'partners'
      const { error: insertError } = await supabase.from('partners').insert({
        name,
        subheadline,
        slug,
        logo_url: logo_url || null,
      });

      if (insertError) throw insertError;

      toast.success('Partner added successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/partners');
        router.refresh(); // Memastikan data di halaman daftar partner diperbarui
      }, 1500);

    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Partner</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Partner Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Partner Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Subheadline */}
          <div>
            <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700">Subheadline</label>
            <input
              type="text"
              id="subheadline"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>

          {/* Logo Uploader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Logo</label>
            <div {...getRootProps()} className={`relative group w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input {...getInputProps()} />
              {logoFile ? (
                  <>
                      <Image src={URL.createObjectURL(logoFile)} alt="Logo Preview" fill style={{ objectFit: 'contain' }} className="rounded-lg p-2" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white">Click or drag to replace</p>
                      </div>
                  </>
              ) : (
                  <div className="text-gray-500 flex flex-col items-center justify-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="font-semibold text-brand-orange">Click to upload or drag and drop</p>
                      <p className="text-xs mt-1">PNG, JPG, SVG</p>
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-400">
            {isLoading ? 'Saving Partner...' : 'Save Partner'}
          </button>
        </div>
      </form>
    </div>
  );
}