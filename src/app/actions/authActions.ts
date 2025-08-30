// src/app/actions/authActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js'; // <-- 1. Impor createClient standar

// ... (fungsi lain tidak berubah)

// --- PERBAIKAN UTAMA ADA DI FUNGSI INI ---
export async function registerAction(formData: FormData) {
  const fullName = String(formData.get('fullName'));
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const confirmPassword = String(formData.get('confirmPassword'));
  const supabase = createServerActionClient({ cookies });

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  // Langkah 1: Daftarkan pengguna di Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }
  
  if (!signUpData.user) {
    return { error: "Registration failed, please try again." };
  }

  // Langkah 2 (BARU): Sisipkan data ke tabel public.profiles
  try {
    // Gunakan service_role key untuk melewati RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        full_name: fullName,
        email: email,
        role: 'user', // Atur role default sebagai 'user'
      });

    if (profileError) {
      // Jika penyisipan profil gagal, berikan pesan error
      return { error: `Could not create user profile: ${profileError.message}` };
    }

  } catch (error: any) {
    return { error: `An unexpected error occurred: ${error.message}` };
  }

  // Jika semua berhasil, kembalikan success
  return { success: true, user: signUpData.user };
}

// ... (sisa fungsi tidak berubah)
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

  revalidatePath('/', 'layout');
  // Pastikan kita mengembalikan sesi
  return { success: true, user: data.user, session: data.session };
}


export async function logoutAction() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return redirect('/');
}

export async function forgotPasswordAction(email: string) {
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