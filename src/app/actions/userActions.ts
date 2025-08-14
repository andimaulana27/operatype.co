// src/app/actions/userActions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateUserPassword(userId: string, newPassword: string) {
  // Validasi sederhana
  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  // Membuat koneksi Supabase khusus di server dengan kunci service_role
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Menggunakan fungsi admin untuk mengubah password pengguna
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    return { error: `Failed to update password: ${error.message}` };
  }

  // Membersihkan cache halaman agar data selalu baru
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);

  return { success: 'Password updated successfully!' };
}