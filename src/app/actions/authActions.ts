// src/app/actions/authActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Fungsi loginAction telah dihapus karena logikanya sekarang ditangani
// di sisi klien pada file src/app/(auth)/login/page.tsx untuk sinkronisasi UI yang instan.

export async function registerAction(formData: FormData) {
  const fullName = String(formData.get('fullName'));
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const confirmPassword = String(formData.get('confirmPassword'));
  const supabase = createServerActionClient({ cookies });

  if (password !== confirmPassword) {
    return redirect(`/login?view=register&error=${encodeURIComponent("Passwords do not match.")}`);
  }

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
    return redirect(`/login?view=register&error=${encodeURIComponent(error.message)}`);
  }
  
  return redirect(`/login?message=${encodeURIComponent("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.")}`);
}

export async function logoutAction() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return redirect('/');
}