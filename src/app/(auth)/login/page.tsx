// src/app/(auth)/login/page.tsx
'use client'; 

import Link from 'next/link';
import { loginAction, registerAction } from '@/app/actions/authActions';
import PasswordField from './PasswordField';
import { useState } from 'react';
import AuthLoader from '@/components/AuthLoader';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { view?: string; error?: string; message?: string };
}) {
  const isRegisterView = searchParams.view === 'register';

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleLoginSubmit = (formData: FormData) => {
    setLoading(true);
    setLoadingMessage('Logging in...');
    loginAction(formData);
  };

  const handleRegisterSubmit = (formData: FormData) => {
    setLoading(true);
    setLoadingMessage('Registering...');
    registerAction(formData);
  };

  return (
      <div className="relative w-full max-w-4xl h-auto md:h-[650px] bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {loading && <AuthLoader message={loadingMessage} />}
        
        {searchParams.error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center animate-slide-down">
                <p>{searchParams.error}</p>
            </div>
        )}
        {searchParams.message && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center animate-slide-down">
                <p>{searchParams.message}</p>
            </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full flex flex-col md:flex-row z-10">
          {/* Login Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <form action={handleLoginSubmit} className="w-full text-center">
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
              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
                {loading && loadingMessage === 'Logging in...' ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>

          {/* Register Form */}
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
              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
                {loading && loadingMessage === 'Registering...' ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
        
        {/* --- PERBAIKAN LOGIKA CSS DI SINI --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-brand-orange text-white flex items-center justify-center p-12 text-center rounded-2xl transition-transform duration-700 ease-in-out z-20 ${isRegisterView ? 'translate-x-full' : 'translate-x-0'}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Konten untuk "Register" view */}
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h2 className="text-3xl font-medium">Hello, Friend!</h2>
              <p className="mt-4 font-light">Create an account and start exploring high quality typefaces.</p>
              <Link href="/login" className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">Login Now</Link>
            </div>
            {/* Konten untuk "Login" view */}
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-3xl font-medium">Welcome Back!</h2>
              <p className="mt-4 font-light">Sign in to continue your creative journey.</p>
              <Link href="/login?view=register" className="mt-8 inline-block bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">Register Now</Link>
            </div>
          </div>
        </div>
      </div>
  );
}