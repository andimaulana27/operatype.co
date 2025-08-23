// src/app/actions/partnerActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Server Action untuk menambah partner baru
export async function addPartnerAction(formData: FormData) {
  const name = String(formData.get('name'));
  const subheadline = String(formData.get('subheadline'));
  const logoFile = formData.get('logo') as File | null;

  const supabase = createServerActionClient({ cookies });

  // Validasi sederhana di server
  if (!name) {
    return { error: 'Partner Name is required.' };
  }

  try {
    let logo_url = '';

    // 1. Handle upload file logo jika ada
    if (logoFile && logoFile.size > 0) {
      const filePath = `${Date.now()}_${logoFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('partner_logos')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // Dapatkan URL publik dari file yang diunggah
      const { data: urlData } = supabase.storage
        .from('partner_logos')
        .getPublicUrl(data.path);
      
      logo_url = urlData.publicUrl;
    }

    // 2. Buat slug dari nama partner
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // 3. Simpan data ke tabel 'partners'
    const { error: insertError } = await supabase.from('partners').insert({
      name,
      subheadline,
      slug,
      logo_url: logo_url || null,
    });

    if (insertError) throw insertError;

    // 4. Revalidate cache untuk halaman terkait agar data baru muncul
    revalidatePath('/admin/partners');
    revalidatePath('/partners');
    
    return { success: true };

  } catch (error: any) {
    console.error('Add partner error:', error);
    return { error: error.message };
  }
}
