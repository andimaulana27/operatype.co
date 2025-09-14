// src/components/admin/FileUploadProgress.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, File as FileIcon, FileArchive } from 'lucide-react'; // PERBAIKAN: Mengganti FileZip menjadi FileArchive

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type FileUploadProgressProps = {
  label: string;
  bucket: string;
  fileTypes: { [key: string]: string[] };
  onUploadComplete: (filePath: string | null, isUploading: boolean) => void;
  isPublic?: boolean;
  existingFileUrl?: string | null;
};

const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="w-8 h-8 text-gray-400" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-gray-400" />;
    if (fileType.includes('zip')) return <FileArchive className="w-8 h-8 text-gray-400" />; // PERBAIKAN: Menggunakan FileArchive
    return <FileIcon className="w-8 h-8 text-gray-400" />;
};


export default function FileUploadProgress({
  label,
  bucket,
  fileTypes,
  onUploadComplete,
  isPublic = true,
  existingFileUrl
}: FileUploadProgressProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if(existingFileUrl) {
      setStatus('success');
    } else {
      setStatus('idle');
    }
  }, [existingFileUrl]);


  const uploadFile = useCallback(async (fileToUpload: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    onUploadComplete(null, true);

    try {
      const filePath = `${Date.now()}_${fileToUpload.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      let finalUrl = data.path;
      if (isPublic) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        finalUrl = publicUrlData.publicUrl;
      }
      
      onUploadComplete(finalUrl, false);
      setStatus('success');
      setProgress(100);

    } catch (e: unknown) {
      const err = e as Error;
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
      setStatus('error');
      onUploadComplete(null, false);
    }
  }, [bucket, onUploadComplete, isPublic]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      uploadFile(selectedFile);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes,
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    onUploadComplete(null, false);
  };

  const borderColor = isDragActive
    ? 'border-brand-orange'
    : status === 'error'
    ? 'border-red-500'
    : 'border-gray-300';
  
  const getFileName = () => {
    if (file) return file.name;
    if (existingFileUrl && status === 'success') {
      try {
        const pathParts = existingFileUrl.split('/');
        const encodedName = pathParts[pathParts.length - 1];
        return decodeURIComponent(encodedName).substring(encodedName.indexOf('_') + 1);
      } catch {
        return 'Existing file';
      }
    }
    return '';
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {status === 'idle' ? (
        <div {...getRootProps()} className={`w-full p-4 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${borderColor} hover:border-brand-orange`}>
          <input {...getInputProps()} />
          <div className="text-gray-500 flex flex-col items-center">
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
            <p className="font-semibold text-sm">
              <span className="text-brand-orange">Click to upload</span> or drag and drop
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full p-3 border rounded-lg flex items-center gap-3 bg-gray-50">
          <div className="flex-shrink-0">{getFileIcon(file?.type)}</div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{getFileName()}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-brand-orange'}`}
                style={{ width: `${status === 'success' ? 100 : progress}%` }}
              ></div>
            </div>
             {status === 'error' && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <div className="flex-shrink-0">
             {status === 'uploading' && <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-brand-orange"></div>}
             {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
             {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <button type="button" onClick={handleRemove} className="flex-shrink-0 text-gray-400 hover:text-red-600">
             <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}