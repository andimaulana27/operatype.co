// src/components/ToastNotifier.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ToastNotifier() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    const successMessage = searchParams.get('message');

    if (errorMessage) {
      toast.error(errorMessage);
    }

    if (successMessage) {
      toast.success(successMessage);
    }
  }, [searchParams]);

  return null; // Komponen ini tidak merender apa-apa, hanya memicu notifikasi
}