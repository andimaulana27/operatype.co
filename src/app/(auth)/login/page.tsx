// src/app/(auth)/login/page.tsx
'use client'; 

import Link from 'next/link';
import { registerAction, verifyOtpAction } from '@/app/actions/authActions';
import PasswordField from './PasswordField';
import { useState, useTransition, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [isOtpView, setIsOtpView] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk membaca query parameter

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    startTransition(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        toast.success('Login successful! Welcome.');
        
        // ==================== PERBAIKAN REDIRECT DI SINI ====================
        const nextUrl = searchParams.get('next'); // Baca parameter 'next' dari URL
        // Jika ada 'next', redirect ke sana. Jika tidak, gunakan logika default.
        const redirectTo = nextUrl || (profile?.role === 'admin' ? '/admin/dashboard' : '/account');
        // ===================================================================

        router.push(redirectTo);
        router.refresh();
      }
    });
  };

  const handleRegisterSubmit = (formData: FormData) => {
    const email = String(formData.get('email'));
    setUserEmail(email);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Registration successful! Please check your email for an OTP.');
        setIsOtpView(true);
      }
    });
  };

  const handleOtpSubmit = (formData: FormData) => {
    formData.append('email', userEmail);
    startTransition(async () => {
      const result = await verifyOtpAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        toast.success('Verification successful! Welcome.');

        // Juga terapkan logika redirect di sini setelah verifikasi OTP
        const nextUrl = searchParams.get('next');
        const redirectTo = nextUrl || '/account';
        
        router.push(redirectTo);
        router.refresh();
      }
    });
  };

  if (isOtpView) {
    return (
       <div className="relative w-full max-w-md h-auto bg-white rounded-2xl shadow-lg p-8">
         <div className="text-center">
            <h2 className="text-3xl font-medium text-brand-black">Verify Your Email</h2>
            <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
            <p className="text-brand-gray-1">We&apos;ve sent a 6-digit code to <strong>{userEmail}</strong>. Please enter it below.</p>
         </div>
         <form action={handleOtpSubmit} className="space-y-6 mt-6">
            <input 
              name="otp" type="text" required maxLength={6} autoComplete="one-time-code" placeholder="6-Digit Code"
              className="w-full p-4 text-center tracking-[1em] bg-brand-gray-2 rounded-lg focus:outline-none"
            />
            <button type="submit" disabled={isPending} className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
                {isPending ? 'Verifying...' : 'Verify & Continue'}
            </button>
         </form>
       </div>
    );
  }

  return (
      <div className="relative w-full max-w-4xl h-auto md:h-[650px] bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col md:flex-row z-10">
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <form onSubmit={handleLoginSubmit} className="w-full text-center">
              <h2 className="text-3xl font-medium text-brand-black">Login</h2>
              <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
              <div className="space-y-4 text-left">
                <input 
                  type="email" name="email" placeholder="Email Address"
                  autoComplete="email" className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required 
                />
                <PasswordField
                    name="password" placeholder="Password" autoComplete="current-password"
                />
              </div>
              <Link href="/forgot-password" className="text-sm text-brand-orange hover:underline mt-4 block text-right">Forgot Password?</Link>
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
                  type="text" name="fullName" placeholder="Full Name" autoComplete="name"
                  className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required 
                />
                <input 
                  type="email" name="email" placeholder="Email Address" autoComplete="email"
                  className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required 
                />
                <PasswordField name="password" placeholder="Create Password" autoComplete="new-password"/>
                <PasswordField name="confirmPassword" placeholder="Confirm Password" autoComplete="new-password"/>
              </div>
              <div className="flex items-start mt-6">
                <input type="checkbox" id="terms" name="terms" className="h-4 w-4 mt-0.5 accent-brand-orange" required />
                <label htmlFor="terms" className="ml-2 text-sm text-brand-gray-1">
                  I agree to the <Link href="/terms-of-service" className="text-brand-orange hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-brand-orange hover:underline">Privacy Policy</Link>.
                </label>
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
              <h2 className="text-3xl font-medium">Welcome Back!</h2>
              <p className="mt-4 font-light">Sign in to continue your creative journey.</p>
              <button 
                onClick={() => setIsRegisterView(false)}
                className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">
                  Login Now
              </button>
            </div>
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-3xl font-medium">Hello, Friend!</h2>
              <p className="mt-4 font-light">Create an account and start exploring high quality typefaces.</p>
              <button 
                onClick={() => setIsRegisterView(true)}
                className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">
                  Register
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}