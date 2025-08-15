// src/app/actions/fontActions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

// Mendefinisikan tipe data untuk konsistensi di seluruh aplikasi
type FontFormData = Partial<Database['public']['Tables']['fonts']['Row']>;
type FileUrls = {
  main_image_url: string | null;
  gallery_image_urls: string[];
  downloadable_file_url: string | null;
  display_font_regular_url: string | null;
  display_font_italic_url: string | null;
};

// Fungsi untuk menghapus font
export async function deleteFontAction(fontId: string, fileUrls: any) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const pathsToDelete = {
      font_images: [] as string[],
      'display-fonts': [] as string[],
      'downloadable-files': [] as string[],
    };

    const getPathFromUrl = (url: string, bucket: string): string | null => {
        try {
            if (url && url.includes(`/${bucket}/`)) {
                return decodeURIComponent(url.split(`/${bucket}/`)[1]);
            }
            return null;
        } catch { return null; }
    };

    if (fileUrls.main_image_url) pathsToDelete.font_images.push(getPathFromUrl(fileUrls.main_image_url, 'font_images')!);
    if (fileUrls.display_font_regular_url) pathsToDelete['display-fonts'].push(getPathFromUrl(fileUrls.display_font_regular_url, 'display-fonts')!);
    if (fileUrls.display_font_italic_url) pathsToDelete['display-fonts'].push(getPathFromUrl(fileUrls.display_font_italic_url, 'display-fonts')!);
    if (fileUrls.downloadable_file_url) pathsToDelete['downloadable-files'].push(fileUrls.downloadable_file_url);

    if (Array.isArray(fileUrls.gallery_image_urls)) {
        const galleryPaths = fileUrls.gallery_image_urls
            .map((url: string) => getPathFromUrl(url, 'font_images'))
            .filter((p: string | null): p is string => p !== null);
        pathsToDelete.font_images.push(...galleryPaths);
    }
    
    for (const [bucket, paths] of Object.entries(pathsToDelete)) {
        if (paths.length > 0) {
            const { error: storageError } = await supabaseAdmin.storage.from(bucket).remove(paths);
            if (storageError) console.error(`Error deleting files from ${bucket}:`, storageError.message);
        }
    }

    await supabaseAdmin.from('font_discounts').delete().eq('font_id', fontId);
    const { error: dbError } = await supabaseAdmin.from('fonts').delete().eq('id', fontId);
    if (dbError) throw dbError;
    
    revalidatePath('/admin/fonts');
    return { success: 'Font and associated files deleted successfully!' };
  } catch (error: any) {
    return { error: `Deletion failed: ${error.message}` };
  }
}

// BARU: Fungsi untuk menambah font baru
export async function addFontAction(formData: FontFormData, fileUrls: FileUrls) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const slug = formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
    
    // Menggabungkan data form dan URL file dengan tipe yang benar
    const finalData = {
      ...formData,
      slug,
      price_desktop: parseFloat(String(formData.price_desktop || 0)),
      price_business: parseFloat(String(formData.price_business || 0)),
      price_corporate: parseFloat(String(formData.price_corporate || 0)),
      main_image_url: fileUrls.main_image_url,
      gallery_image_urls: fileUrls.gallery_image_urls,
      downloadable_file_url: fileUrls.downloadable_file_url,
      display_font_regular_url: fileUrls.display_font_regular_url,
      display_font_italic_url: fileUrls.display_font_italic_url,
    };

    const { error } = await supabaseAdmin.from('fonts').insert([finalData]);
    if (error) {
        // Memberikan pesan error yang lebih spesifik jika font sudah ada
        if (error.code === '23505') { // Kode untuk unique constraint violation
            throw new Error('A font with this name or slug already exists.');
        }
        throw error;
    }
    
    revalidatePath('/admin/fonts');
    return { success: 'Font added successfully!' };
  } catch (error: any) {
    return { error: `Failed to add font: ${error.message}` };
  }
}