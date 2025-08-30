// src/app/(auth)/login/PasswordField.tsx
'use client'; // Menandai file ini sebagai Client Component

import React, { useState } from 'react'; // Import React dan useState
import { EyeIcon, EyeSlashIcon } from '@/components/icons';

// ==================== PERUBAHAN DI SINI ====================
// Tambahkan `autoComplete` ke dalam tipe props
export default function PasswordField({
    name,
    placeholder,
    autoComplete
}: {
    name: string;
    placeholder: string;
    autoComplete?: string; // Jadikan opsional
}) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative">
      <input 
        type={show ? 'text' : 'password'} 
        name={name}
        placeholder={placeholder}
        // Terapkan autoComplete di sini
        autoComplete={autoComplete}
        className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" 
        required 
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 px-4 text-brand-gray-1">
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}