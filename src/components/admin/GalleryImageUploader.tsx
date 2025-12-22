// src/components/admin/GalleryImageUploader.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { UploadCloud, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
// 1. Import library compression
import imageCompression from 'browser-image-compression';

const MAX_FILES = 15;

type UploadStatus = 'empty' | 'uploading' | 'success' | 'error';

interface ImageSlot {
  id: number;
  file?: File;
  previewUrl?: string;
  finalUrl?: string | null;
  progress: number;
  status: UploadStatus;
  error?: string;
  isInitial?: boolean; 
}

interface GalleryImageUploaderProps {
  initialUrls?: string[];
  onUploadChange: (urls: string[], isUploading: boolean) => void;
}

const GalleryImageUploader = ({ initialUrls = [], onUploadChange }: GalleryImageUploaderProps) => {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() => {
    const slots: ImageSlot[] = Array.from({ length: MAX_FILES }, (_, i) => ({
      id: i,
      progress: 0,
      status: 'empty',
    }));
    initialUrls.slice(0, MAX_FILES).forEach((url, i) => {
      slots[i] = { ...slots[i], finalUrl: url, previewUrl: url, status: 'success', progress: 100, isInitial: true };
    });
    return slots;
  });

  useEffect(() => {
    const finalUrls = imageSlots.map(slot => slot.finalUrl).filter((url): url is string => !!url);
    const isUploading = imageSlots.some(slot => slot.status === 'uploading');
    onUploadChange(finalUrls, isUploading);
  }, [imageSlots, onUploadChange]);

  const uploadFile = useCallback(async (file: File, slotId: number) => {
    // Set status awal uploading
    setImageSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, file, previewUrl: URL.createObjectURL(file), status: 'uploading', progress: 0, isInitial: false } : slot
    ));

    try {
      // 2. Konfigurasi opsi kompresi
      const options = {
        maxSizeMB: 1,          // Maksimal ukuran file 1MB
        maxWidthOrHeight: 1920, // Maksimal lebar/tinggi 1920px (HD)
        useWebWorker: true,     // Menggunakan web worker agar UI tidak freeze
        fileType: 'image/webp'  // Konversi otomatis ke WebP
      };

      // 3. Proses kompresi
      const compressedFile = await imageCompression(file, options);
      
      // 4. Ubah nama file agar ekstensinya menjadi .webp
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      const newFileName = `${Date.now()}_${fileNameWithoutExt}.webp`;

      // Upload file yang SUDAH dikompresi ke Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('font_images')
        .upload(newFileName, compressedFile, { // Gunakan compressedFile, bukan file asli
          cacheControl: '3600',
          contentType: 'image/webp', // Pastikan content-type diset ke webp
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('font_images').getPublicUrl(data.path);

      setImageSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, finalUrl: publicUrlData.publicUrl, status: 'success', progress: 100 } : slot
      ));
      
      toast.success(`Uploaded & Compressed: ${((file.size - compressedFile.size) / 1024).toFixed(0)}KB saved!`);

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      toast.error(`Upload failed for ${file.name}`);
      setImageSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, status: 'error', error: message } : slot
      ));
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const emptySlots = imageSlots.filter(slot => slot.status === 'empty');
    const filesToUpload = acceptedFiles.slice(0, emptySlots.length);

    if (filesToUpload.length === 0 && acceptedFiles.length > 0) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    filesToUpload.forEach((file, index) => {
      const slotId = emptySlots[index].id;
      uploadFile(file, slotId);
    });
  }, [imageSlots, uploadFile]);
  
  const removeImage = (slotId: number) => {
      const slotToRemove = imageSlots.find(s => s.id === slotId);
      if (slotToRemove?.previewUrl && !slotToRemove.isInitial) {
          URL.revokeObjectURL(slotToRemove.previewUrl);
      }
      
      const resetSlot: ImageSlot = { id: slotId, progress: 0, status: 'empty', file: undefined, previewUrl: undefined, finalUrl: undefined, error: undefined };
      
      setImageSlots(prev => prev.map(slot =>
        slot.id === slotId ? resetSlot : slot
      ).sort((a,b) => (a.status === 'empty' ? 1: -1) - (b.status === 'empty' ? 1: -1)));
  }

  const hasEmptySlots = imageSlots.some(s => s.status === 'empty');
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    noClick: true,
    noKeyboard: true
  });
  
  return (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (Max 15)</label>
        <div {...getRootProps()} className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 border rounded-lg ${isDragActive ? 'border-brand-orange bg-orange-50' : 'border-gray-200'}`}>
            <input {...getInputProps()} id="gallery-dropzone-input" />
            {imageSlots.map(slot => (
                <Slot 
                    key={slot.id}
                    slot={slot}
                    onRemove={removeImage}
                    onSlotClick={slot.status === 'empty' && hasEmptySlots ? openFileDialog : undefined}
                />
            ))}
        </div>
    </div>
  );
};

const Slot = ({ slot, onRemove, onSlotClick }: { slot: ImageSlot, onRemove: (id: number) => void, onSlotClick?: () => void }) => {
    
    if (slot.status === 'empty') {
      return (
        <div 
          onClick={onSlotClick}
          className="aspect-square bg-gray-50 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-brand-orange cursor-pointer transition-colors"
        >
          <UploadCloud className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
    
    return (
        <div className="aspect-square relative group rounded-md overflow-hidden border">
            {slot.previewUrl && 
                <Image src={slot.previewUrl} alt={`Preview ${slot.id}`} fill sizes="20vw" className="object-cover"/>
            }
            
            {(slot.status === 'uploading' || slot.status === 'error') && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                    <div className="w-full bg-gray-500 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${slot.status === 'error' ? 'bg-red-500' : 'bg-brand-orange'}`} style={{width: `${slot.progress}%`}}></div>
                    </div>
                    {slot.status === 'error' && <AlertCircle className="w-6 h-6 text-red-500 mt-2"/>}
                </div>
            )}

            {slot.status === 'success' && (
                <>
                    <CheckCircle2 className="absolute top-1 right-1 w-5 h-5 text-white bg-green-600 rounded-full p-0.5" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type='button' onClick={() => onRemove(slot.id)} className="p-2 bg-red-600/80 text-white rounded-full">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default GalleryImageUploader;