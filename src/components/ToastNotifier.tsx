// src/components/ToastNotifier.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ToastNotifier() {
  const searchParams = useSearchParams();
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const currentPath = window.location.pathname + window.location.search;

    if (notifiedRef.current === currentPath) {
      return;
    }

    if (error) {
      toast.error(error);
      notifiedRef.current = currentPath;
    }
    
    if (message) {
      toast.success(message);
      notifiedRef.current = currentPath;
      
      // PERBAIKAN: Hapus router.refresh() dari sini karena sudah ditangani
      // oleh AuthContext saat logout dan oleh LoginPage saat login.
    }
  }, [searchParams]);

  return null;
}