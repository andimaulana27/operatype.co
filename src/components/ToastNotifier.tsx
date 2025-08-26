// src/components/ToastNotifier.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ToastNotifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // PERBAIKAN: Inisialisasi useRef dengan null dan tentukan tipenya sebagai string atau null
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const currentPath = window.location.pathname + window.location.search;

    // Cek apakah sudah ada notifikasi untuk URL ini
    if (notifiedRef.current === currentPath) {
      return;
    }

    if (error) {
      toast.error(error);
      // PERBAIKAN: Tetapkan string ke ref
      notifiedRef.current = currentPath;
    }
    
    if (message) {
      toast.success(message);
      // PERBAIKAN: Tetapkan string ke ref
      notifiedRef.current = currentPath;
      
      // PERINTAH KUNCI: Jika ada pesan sukses (biasanya setelah login),
      // segarkan state dari server untuk memperbarui UI seperti Navbar.
      router.refresh();
    }
  }, [searchParams, router]);

  return null; // Komponen ini tidak merender UI
}
