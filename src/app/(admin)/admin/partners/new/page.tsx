// src/app/(admin)/admin/partners/new/page.tsx
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { PhotoIcon } from '@/components/icons';
import { addPartnerAction } from '@/app/actions/partnerActions'; // Import Server Action

export default function AddNewPartnerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Gunakan useTransition untuk menangani loading state saat action berjalan
  const [isPending, startTransition] = useTransition();

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

  // PERBAIKAN: handleSubmit sekarang memanggil Server Action
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi di sisi klien tetap penting untuk UX
    if (!name) {
      toast.error('Partner Name is required.');
      return;
    }

    // Buat objek FormData untuk dikirim ke action
    const formData = new FormData(e.currentTarget);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    startTransition(async () => {
      const result = await addPartnerAction(formData);
      
      if (result?.error) {
        toast.error(`An error occurred: ${result.error}`);
      } else if (result?.success) {
        toast.success('Partner added successfully! Redirecting...');
        router.push('/admin/partners');
        router.refresh(); // Memastikan data di halaman daftar partner diperbarui
      }
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Partner</h1>
      {/* Form sekarang memanggil handleSubmit yang baru */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Partner Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Partner Name</label>
            <input
              type="text"
              id="name"
              name="name" // Tambahkan atribut 'name' untuk FormData
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
              name="subheadline" // Tambahkan atribut 'name' untuk FormData
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
          <button type="submit" disabled={isPending} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-400">
            {isPending ? 'Saving Partner...' : 'Save Partner'}
          </button>
        </div>
      </form>
    </div>
  );
}
