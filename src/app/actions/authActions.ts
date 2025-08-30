// src/app/actions/authActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// --- FUNGSI REGISTERACTION DIPERBARUI UNTUK MENGIRIM OTP ---
export async function registerAction(formData: FormData) {
  const fullName = String(formData.get('fullName'));
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const confirmPassword = String(formData.get('confirmPassword'));
  const supabase = createServerActionClient({ cookies });

  if (password !== confirmPassword) {
    // Kembalikan error agar bisa ditangani di client
    return { error: "Passwords do not match." };
  }
  
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Opsi ini memberitahu Supabase untuk tidak login otomatis,
  // pengguna harus verifikasi OTP terlebih dahulu.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }
  
  // Jika berhasil, kembalikan success agar client bisa pindah ke step OTP
  return { success: true, user: data.user };
}

// --- FUNGSI BARU UNTUK VERIFIKASI OTP SIGNUP ---
export async function verifyOtpAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const email = String(formData.get('email'));
  const otp = String(formData.get('otp'));

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup',
  });

  if (error) {
    return { error: error.message };
  }

  // Jika berhasil, pengguna sekarang sudah terverifikasi dan login
  revalidatePath('/', 'layout');
  return { success: true, user: data.user, session: data.session };
}


export async function logoutAction() {
  // ... (fungsi ini tidak berubah)
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return redirect('/');
}

export async function forgotPasswordAction(email: string) {
  // ... (fungsi ini tidak berubah)
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    if (error.message.includes("User not found")) {
        return { success: true };
    }
    return { error: error.message };
  }
  return { success: true };
}

export async function resetPasswordWithOtpAction(formData: FormData) {
  // ... (fungsi ini tidak berubah)
  const supabase = createServerActionClient({ cookies });
  const email = String(formData.get('email'));
  const otp = String(formData.get('otp'));
  const newPassword = String(formData.get('newPassword'));
  const confirmPassword = String(formData.get('confirmPassword'));
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'recovery',
  });
  if (verifyError) {
    return { error: `Invalid OTP: ${verifyError.message}` };
  }
  if (!session) {
    return { error: 'Could not create a session. The OTP may be invalid or expired.' };
  }
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { error: `Could not update password: ${updateError.message}` };
  }
  await supabase.auth.signOut();
  return { success: true };
}