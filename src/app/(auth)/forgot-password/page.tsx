// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { forgotPasswordAction, resetPasswordWithOtpAction } from '@/app/actions/authActions';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordField from '../login/PasswordField';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'enterEmail' | 'enterOtp'>('enterEmail');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get('email'));
    setEmail(submittedEmail);

    startTransition(async () => {
      const result = await forgotPasswordAction(submittedEmail);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('An OTP has been sent to your email.');
        setStep('enterOtp');
      }
    });
  };

  const handleOtpSubmit = (formData: FormData) => {
    formData.append('email', email);
    startTransition(async () => {
      const result = await resetPasswordWithOtpAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Password has been reset successfully!');
        router.push('/login');
      }
    });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
      {step === 'enterEmail' ? (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-medium text-brand-black">Forgot Password</h1>
            <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-6 mx-auto"></div>
            <p className="text-brand-gray-1">
              Enter your email to receive a 6-digit verification code.
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <input
              id="email"
              name="email" 
              type="email" 
              required 
              autoComplete="email"
              placeholder="Email Address"
              className="w-full p-4 bg-brand-gray-2 rounded-lg focus:outline-none"
            />
            <button type="submit" disabled={isPending} className="w-full bg-brand-orange text-white font-medium py-3 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
              {isPending ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-medium text-brand-black">Check Your Email</h1>
            <div className="w-16 h-0.5 bg-brand-orange mt-3 mb-6 mx-auto"></div>
            <p className="text-brand-gray-1">
              We've sent a code to <strong>{email}</strong>. Enter it below to reset your password.
            </p>
          </div>
          <form action={handleOtpSubmit} className="space-y-4">
            
            {/* --- PERBAIKAN UTAMA DAN FINAL UNTUK MASALAH AUTOFILL --- */}

            {/* 1. Kita menambahkan input palsu (honeypot) yang tidak terlihat oleh pengguna.
                   Browser akan mengisi email ke sini, bukan ke kolom OTP kita. */}
            <input 
              type="email" 
              name="email_honeypot" 
              autoComplete="email" 
              className="hidden" 
            />

            {/* 2. Kita mengubah atribut input OTP agar tidak dikenali sebagai username. */}
            <input
              id="verification-code"
              name="otp" // nama 'otp' tetap untuk Server Action
              type="text" 
              required 
              maxLength={6} 
              placeholder="6-Digit Code"
              // Atribut ini adalah standar baru, tapi kita perkuat dengan teknik di atas.
              autoComplete="one-time-code"
              className="w-full p-4 text-center tracking-[1em] bg-brand-gray-2 rounded-lg focus:outline-none"
            />
            {/* ----------------------------------------------------------- */}

            <PasswordField name="newPassword" placeholder="New Password" autoComplete="new-password"/>
            <PasswordField name="confirmPassword" placeholder="Confirm New Password" autoComplete="new-password"/>
            <button type="submit" disabled={isPending} className="w-full bg-brand-orange text-white font-medium py-3 rounded-full hover:bg-brand-orange-hover disabled:opacity-50">
              {isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
      <div className="text-center">
        <Link href="/login" className="text-sm font-medium text-brand-orange hover:underline">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}