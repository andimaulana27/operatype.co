// src/app/(auth)/login/page.tsx
'use client'; 

import Link from 'next/link';
// Hapus import loginAction
import { registerAction } from '@/app/actions/authActions';
import PasswordField from './PasswordField';
import { useState, useEffect, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient'; // <- IMPORT KUNCI

export default function LoginPage({
  searchParams,
}: {
  searchParams: { view?: string; error?: string; message?: string };
}) {
  const [isRegisterView, setIsRegisterView] = useState(searchParams.view === 'register');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setIsRegisterView(searchParams.view === 'register');
  }, [searchParams.view]);
  
  // ==================== ALUR LOGIN BARU YANG JITU ====================
  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    startTransition(async () => {
      // 1. Panggil Supabase langsung dari klien
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Panggilan ini akan otomatis memicu onAuthStateChange di AuthContext,
      // memperbarui Navbar SECARA INSTAN.

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // 2. Ambil peran pengguna untuk menentukan tujuan redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        toast.success('Login berhasil! Selamat datang.');

        const redirectTo = profile?.role === 'admin' ? '/admin/dashboard' : '/account';
        
        // 3. Lakukan navigasi setelah UI dijamin sudah update
        router.push(redirectTo);
        // router.refresh() tidak lagi krusial di sini, tapi bisa ditambahkan untuk memastikan data server lain ikut segar.
        router.refresh();
      }
    });
  };
  // ===================================================================

  const handleRegisterSubmit = (formData: FormData) => {
    startTransition(() => {
      registerAction(formData);
    });
  };

  return (
      <div className="relative w-full max-w-4xl h-auto md:h-[650px] bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {searchParams.message && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center animate-slide-down">
                <p>{searchParams.message || ''}</p>
            </div>
        )}
        {searchParams.error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center animate-slide-down">
                <p>{searchParams.error || ''}</p>
            </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full flex flex-col md:flex-row z-10">
          {/* Ubah <form action={...}> menjadi <form onSubmit={...}> */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <form onSubmit={handleLoginSubmit} className="w-full text-center">
              <h2 className="text-3xl font-medium text-brand-black">Login</h2>
              <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
              <div className="space-y-4 text-left">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" 
                  required 
                />
                <PasswordField name="password" placeholder="Password" />
              </div>
              <Link href="#" className="text-sm text-brand-orange hover:underline mt-4 block text-right">Forgot Password?</Link>
              <button type="submit" disabled={isPending} className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
                {isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <form action={handleRegisterSubmit} className="w-full text-center">
              <h2 className="text-3xl font-medium text-brand-black">Registration</h2>
              <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
              <div className="space-y-4 text-left">
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" 
                  required 
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" 
                  required 
                />
                <PasswordField name="password" placeholder="Create Password" />
                <PasswordField name="confirmPassword" placeholder="Confirm Password" />
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" id="terms" name="terms" className="h-4 w-4 accent-brand-orange" required />
                <label htmlFor="terms" className="ml-2 text-sm text-brand-gray-1">I agree to the Terms of Service and Privacy Policy.</label>
              </div>
              <button type="submit" disabled={isPending} className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
                {isPending ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
        
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-brand-orange text-white flex items-center justify-center p-12 text-center rounded-2xl transition-transform duration-700 ease-in-out z-20 ${isRegisterView ? 'translate-x-full' : 'translate-x-0'}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h2 className="text-3xl font-medium">Hello, Friend!</h2>
              <p className="mt-4 font-light">Create an account and start exploring high quality typefaces.</p>
              <Link 
                href="/login" 
                onClick={(e) => { e.preventDefault(); setIsRegisterView(false); }}
                className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">
                  Login Now
              </Link>
            </div>
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-3xl font-medium">Welcome Back!</h2>
              <p className="mt-4 font-light">Sign in to continue your creative journey.</p>
              <Link 
                href="/login?view=register" 
                onClick={(e) => { e.preventDefault(); setIsRegisterView(true); }}
                className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">
                  Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}