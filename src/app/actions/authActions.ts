// src/app/actions/authActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const supabase = createServerActionClient({ cookies });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent('Email atau password salah.')}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  revalidatePath('/', 'layout');
  
  const role = profile?.role || 'user';
  const successMessage = encodeURIComponent('Login berhasil! Selamat datang.');

  if (role === 'admin') {
    return redirect(`/admin/dashboard?message=${successMessage}`);
  } else {
    // PERBAIKAN UTAMA: Arahkan user biasa ke /account
    return redirect(`/account?message=${successMessage}`);
  }
}

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
