// src/app/actions/authActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache'; // 1. Impor revalidatePath

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const supabase = createServerActionClient({ cookies });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Cek role setelah login berhasil
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  // Arahkan ke dashboard admin jika role adalah admin, jika tidak ke homepage
  if (profile?.role === 'admin') {
    revalidatePath('/', 'layout'); // 2. Tambahkan revalidatePath untuk seluruh layout
    return redirect('/admin/dashboard');
  }

  revalidatePath('/', 'layout'); // 2. Tambahkan revalidatePath untuk seluruh layout
  return redirect('/');
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
    console.error('Registration error:', error.message);
    return redirect(`/login?view=register&error=${encodeURIComponent(error.message)}`);
  }
  
  return redirect(`/login?message=${encodeURIComponent("Registration successful! Please check your email for verification.")}`);
}

export async function logoutAction() {
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout'); // 3. Tambahkan revalidatePath untuk seluruh layout
  redirect('/login');
}