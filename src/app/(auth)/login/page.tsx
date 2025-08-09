// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@/components/icons';

const Notification = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down">
      {message}
    </div>
  );
};

export default function LoginPage() {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
    } else if (signUpData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: signUpData.user.id, full_name: fullName, role: 'user' });

      if (profileError) {
        setError(profileError.message);
      } else {
        setNotification('Registration successful! Please check your email to verify your account.');
        setIsRegisterView(false);
      }
    }
    setIsLoading(false);
  };

  // PERBAIKAN: Logika redirect yang lebih kuat dan eksplisit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
      return;
    }

    if (loginData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', loginData.user.id)
        .single();

      if (profileError) {
        setError("Login successful, but could not retrieve user profile.");
        await supabase.auth.signOut();
        setIsLoading(false);
      } else if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } else {
      setError("An unknown error occurred during login.");
      setIsLoading(false);
    }
  };

  const renderPasswordField = (placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, show: boolean, toggleShow: () => void) => (
    <div className="relative">
      <input type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required disabled={isLoading} />
      <button type="button" onClick={toggleShow} className="absolute inset-y-0 right-0 px-4 text-brand-gray-1">
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full flex z-10">
          <div className="w-1/2 flex items-center justify-center p-8 md:p-12">
            <form onSubmit={handleLogin} className="w-full text-center">
              <h2 className="text-3xl font-medium text-brand-black">Login</h2>
              <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
              <div className="space-y-4 text-left">
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required disabled={isLoading} />
                {renderPasswordField('Password', password, e => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
              </div>
              <Link href="#" className="text-sm text-brand-orange hover:underline mt-4 block text-right">Forgot Password?</Link>
              <button type="submit" className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-75" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            </form>
          </div>
          <div className="w-1/2 flex items-center justify-center p-8 md:p-12">
            <form onSubmit={handleRegister} className="w-full text-center">
              <h2 className="text-3xl font-medium text-brand-black">Registration</h2>
              <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-8 mx-auto"></div>
              <div className="space-y-4 text-left">
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required disabled={isLoading} />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none" required disabled={isLoading} />
                {renderPasswordField('Create Password', password, e => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
                {renderPasswordField('Confirm Password', confirmPassword, e => setConfirmPassword(e.target.value), showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" id="terms" checked={isAgreed} onChange={() => setIsAgreed(!isAgreed)} className="h-4 w-4 accent-brand-orange" required />
                <label htmlFor="terms" className="ml-2 text-sm text-brand-gray-1">I agree to the Terms of Service and Privacy Policy.</label>
              </div>
              <button type="submit" className="w-full mt-6 bg-brand-orange text-white font-medium py-4 rounded-full hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAgreed || isLoading}>
                {isLoading ? 'Loading...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
        
        <div className={`absolute top-0 left-0 w-1/2 h-full bg-brand-orange text-white flex items-center justify-center p-12 text-center rounded-2xl transition-transform duration-700 ease-in-out z-20 ${isRegisterView ? 'translate-x-full' : 'translate-x-0'}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-3xl font-medium">Hello, Friend!</h2>
              <p className="mt-4 font-light">Create an account and start exploring high quality typefaces.</p>
              <button onClick={() => setIsRegisterView(true)} className="mt-8 bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">Register Now</button>
            </div>
            <div className={`absolute transition-opacity duration-500 ${isRegisterView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h2 className="text-3xl font-medium">Welcome Back!</h2>
              <p className="mt-4 font-light">Sign in to continue your creative journey.</p>
              <button onClick={() => setIsRegisterView(false)} className="mt-8 bg-transparent border border-white text-white font-medium py-3 px-12 rounded-full hover:bg-white hover:text-brand-orange transition-colors">Login Now</button>
            </div>
          </div>
        </div>

        {error && <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-500 text-sm z-30">{error}</p>}
      </div>
    </>
  );
}
