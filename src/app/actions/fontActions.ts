// src/app/actions/fontActions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

// DIPERBARUI: Mendefinisikan tipe data yang lebih fleksibel secara lokal
// Kita mengambil tipe dasar 'Insert' dari database.types.ts,
// menghapus properti yang menyebabkan error, lalu menambahkannya kembali dengan tipe yang benar.
type FontData = Omit<
  Database['public']['Tables']['fonts']['Insert'], 
  | 'main_image_url' 
  | 'display_font_regular_url' 
  | 'display_font_italic_url' 
  | 'downloadable_file_url' 
  | 'category_id'
> & {
  main_image_url: string | null;
  display_font_regular_url: string | null;
  display_font_italic_url: string | null;
  downloadable_file_url: string | null;
  category_id?: string | null; // Dibuat opsional agar bisa di-delete
};


const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fungsi untuk mengunggah file ke bucket tertentu dan mengembalikan URL
async function uploadFile(file: File, bucket: string, isPublic: boolean = false): Promise<string> {
  const filePath = `${isPublic ? 'public/' : ''}${Date.now()}_${file.name}`;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Error uploading ${file.name} to ${bucket}: ${error.message}`);
  }

  if (bucket === 'downloadable-files') {
    return filePath;
  }
  
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

// Fungsi deleteFontAction tidak ada perubahan, sudah benar
export async function deleteFontAction(fontId: string, fileUrls: any) {
  try {
    const pathsToDelete: { [bucket: string]: string[] } = {
      'font_images': [],
      'display-fonts': [],
      'downloadable-files': [],
    };

    const getPathFromUrl = (url: string, bucket: string): string | null => {
        try {
            if (url && url.includes(`/${bucket}/`)) {
                return decodeURIComponent(url.split(`/${bucket}/`)[1]);
            }
            return null;
        } catch { return null; }
    };

    if (fileUrls.main_image_url) {
        const path = getPathFromUrl(fileUrls.main_image_url, 'font_images');
        if (path) pathsToDelete['font_images'].push(path);
    }
    if (fileUrls.display_font_regular_url) {
        const path = getPathFromUrl(fileUrls.display_font_regular_url, 'display-fonts');
        if (path) pathsToDelete['display-fonts'].push(path);
    }
    if (fileUrls.display_font_italic_url) {
        const path = getPathFromUrl(fileUrls.display_font_italic_url, 'display-fonts');
        if (path) pathsToDelete['display-fonts'].push(path);
    }
    if (fileUrls.downloadable_file_url) {
        pathsToDelete['downloadable-files'].push(fileUrls.downloadable_file_url);
    }

    if (Array.isArray(fileUrls.gallery_image_urls)) {
        const galleryPaths = fileUrls.gallery_image_urls
            .map((url: string) => getPathFromUrl(url, 'font_images'))
            .filter((p: string | null): p is string => p !== null);
        pathsToDelete['font_images'].push(...galleryPaths);
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

// Fungsi addFontAction diperbaiki
export async function addFontAction(formData: FormData) {
  try {
    const fontName = formData.get('name') as string;
    if (!fontName) {
      throw new Error('Font Name is required.');
    }

    const mainImageFile = formData.get('mainImage') as File | null;
    const galleryImageFiles = formData.getAll('galleryImages') as File[];
    const displayFontRegularFile = formData.get('displayFontRegular') as File | null;
    const displayFontItalicFile = formData.get('displayFontItalic') as File | null;
    const downloadableFile = formData.get('downloadableFile') as File | null;

    const [
      main_image_url,
      gallery_image_urls,
      display_font_regular_url,
      display_font_italic_url,
      downloadable_file_url
    ] = await Promise.all([
      mainImageFile ? uploadFile(mainImageFile, 'font_images') : Promise.resolve(null),
      Promise.all(galleryImageFiles.map(file => uploadFile(file, 'font_images'))),
      displayFontRegularFile ? uploadFile(displayFontRegularFile, 'display-fonts', true) : Promise.resolve(null),
      displayFontItalicFile ? uploadFile(displayFontItalicFile, 'display-fonts', true) : Promise.resolve(null),
      downloadableFile ? uploadFile(downloadableFile, 'downloadable-files') : Promise.resolve(null)
    ]);
    
    // DIPERBARUI: Objek ini sekarang cocok dengan tipe FontData yang baru
    const finalData: FontData = {
      name: fontName,
      slug: (formData.get('slug') as string) || '',
      description: (formData.get('description') as string) || '',
      is_bestseller: formData.get('is_bestseller') === 'true',
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      price_desktop: parseFloat(formData.get('price_desktop') as string || '0'),
      price_business: parseFloat(formData.get('price_business') as string || '0'),
      price_corporate: parseFloat(formData.get('price_corporate') as string || '0'),
      glyph_string: (formData.get('glyph_string') as string) || '',
      file_types: (formData.get('file_types') as string) || '',
      file_size: (formData.get('file_size') as string) || '',
      product_information: JSON.parse(formData.get('product_information') as string || '[]'),
      styles: JSON.parse(formData.get('styles') as string || '[]'),
      status: (formData.get('status') as string) || 'Draft',
      category_id: (formData.get('category_id') as string) || null,
      partner_id: (formData.get('partner_id') as string) || null,
      main_image_url: main_image_url,
      gallery_image_urls: gallery_image_urls,
      display_font_regular_url: display_font_regular_url,
      display_font_italic_url: display_font_italic_url,
      downloadable_file_url: downloadable_file_url
    };

    if (!finalData.partner_id) {
        finalData.partner_id = null; // Set ke null daripada delete
    }
    if (!finalData.category_id) {
        delete finalData.category_id; // Ini sekarang aman karena tipe `category_id` opsional
    }

    const { error } = await supabaseAdmin.from('fonts').insert(finalData as any); // Gunakan 'as any' untuk bypass pengecekan ketat Supabase jika masih ada masalah

    if (error) {
        if (error.code === '23505') {
            throw new Error('A font with this name or slug already exists.');
        }
        throw error;
    }
    
    revalidatePath('/admin/fonts');
    return { success: 'Font added successfully!' };
  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { error: `Failed to add font: ${error.message}` };
  }
}