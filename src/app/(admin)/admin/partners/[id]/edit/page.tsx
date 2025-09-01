// src/app/(admin)/admin/partners/edit/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { PhotoIcon } from '@/components/icons';
import { getPartnerByIdAction, updatePartnerAction } from '@/app/actions/partnerActions';
import { Database } from '@/lib/database.types';
import { X } from 'lucide-react';

type Partner = Database['public']['Tables']['partners']['Row'];

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) return;
    const fetchPartner = async () => {
      setIsLoading(true);
      const { data, error } = await getPartnerByIdAction(partnerId);
      if (error || !data) {
        toast.error('Failed to fetch partner data.');
        router.push('/admin/partners');
      } else {
        setPartner(data);
        setPreview(data.logo_url);
      }
      setIsLoading(false);
    };
    fetchPartner();
  }, [partnerId, router]);

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.svg'] },
    maxFiles: 1,
  });

  const removeLogo = () => {
    setLogoFile(null);
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!partner) return;

    const formData = new FormData(e.currentTarget);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    formData.append('existing_logo_url', partner.logo_url || '');

    startTransition(async () => {
      const result = await updatePartnerAction(partner.id, formData);
      if (result?.error) {
        toast.error(`Update failed: ${result.error}`);
      } else {
        toast.success('Partner updated successfully! Redirecting...');
        router.push('/admin/partners');
      }
    });
  };

  if (isLoading) {
    return <div className="text-center p-12">Loading partner details...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Partner: {partner?.name}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Partner Name</label>
            <input type="text" id="name" name="name" defaultValue={partner?.name} className="mt-1 block w-full p-2 border rounded-md" required />
          </div>
          <div>
            <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700">Subheadline</label>
            <input type="text" id="subheadline" name="subheadline" defaultValue={partner?.subheadline} className="mt-1 block w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Logo</label>
            {preview ? (
              <div className="relative group">
                <Image src={preview} alt="Logo Preview" width={500} height={281} className="rounded-lg w-full h-auto object-contain border p-2" />
                <button type="button" onClick={removeLogo} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-50 group-hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div {...getRootProps()} className={`w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input {...getInputProps()} />
                <div className="text-gray-500 flex flex-col items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="font-semibold text-brand-orange">Click to upload or drag and drop</p>
                  <p className="text-xs mt-1">PNG, JPG, SVG</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <button type="submit" disabled={isPending} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-400">
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}