// src/components/admin/ResetPasswordForm.tsx
'use client';

import { useState } from 'react';
import { updateUserPassword } from '@/app/actions/userActions';
import toast from 'react-hot-toast';
import { KeyIcon, EyeIcon, EyeSlashIcon } from '@/components/icons';

export default function ResetPasswordForm({ userId }: { userId: string }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateUserPassword(userId, password);

    // DIPERBARUI: Menggunakan 'else if' untuk pengecekan yang lebih eksplisit
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) { // Ini memastikan result.success tidak undefined
      toast.success(result.success);
      setPassword(''); // Kosongkan input setelah berhasil
    } else {
      // Menangani kasus tak terduga
      toast.error('An unexpected error occurred.');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
          Set New Password
        </label>
        <div className="relative mt-1">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-2 pr-10 border rounded-md"
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute inset-y-0 right-0 px-3 text-gray-500"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
      >
        <KeyIcon className="w-4 h-4" />
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}