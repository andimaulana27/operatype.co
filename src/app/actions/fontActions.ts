// src/app/actions/fontActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js'; // PERBAIKAN: Tambahkan import ini

type FontFormData = Partial<Database['public']['Tables']['fonts']['Row']>;
type DiscountInsert = Database['public']['Tables']['discounts']['Insert'];
type DiscountUpdate = Partial<Database['public']['Tables']['discounts']['Update']>;

// PERBAIKAN UTAMA: Fungsi addFontAction sekarang menangani upload file di server
export async function addFontAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  // Helper function untuk upload file di server
  const uploadFile = async (file: File, bucket: string, isPublic: boolean = true) => {
    const filePath = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
    if (isPublic) {
        return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
    }
    return data.path; // Untuk file yang tidak publik
  };

  try {
    // 1. Ekstrak semua data dari FormData
    const name = String(formData.get('name'));
    const description = String(formData.get('description'));
    const price_desktop = Number(formData.get('price_desktop'));
    const price_business = Number(formData.get('price_business'));
    const price_corporate = Number(formData.get('price_corporate'));
    const category_id = String(formData.get('category_id'));
    const partner_id = formData.get('partner_id') ? String(formData.get('partner_id')) : null;
    const status = String(formData.get('status'));
    const is_bestseller = formData.get('is_bestseller') === 'on';
    const glyph_string = String(formData.get('glyph_string'));
    const file_size = String(formData.get('file_size'));
    const file_types = String(formData.get('file_types'));
    
    // Ekstrak data array (tags, styles, dll.)
    const tags = formData.getAll('tags').map(String);
    const product_information = formData.getAll('product_information').map(String);
    const styles = formData.getAll('styles').map(String);

    // 2. Handle upload file
    const mainImageFile = formData.get('mainImage') as File | null;
    const galleryImageFiles = formData.getAll('galleryImages') as File[];
    const downloadableFile = formData.get('downloadableFile') as File | null;
    const displayFontRegularFile = formData.get('displayFontRegular') as File | null;
    const displayFontItalicFile = formData.get('displayFontItalic') as File | null;

    const fileUrls = {
      main_image_url: mainImageFile && mainImageFile.size > 0 ? await uploadFile(mainImageFile, 'font_images') : null,
      gallery_image_urls: await Promise.all(galleryImageFiles.map(f => uploadFile(f, 'font_images'))),
      downloadable_file_url: downloadableFile && downloadableFile.size > 0 ? await uploadFile(downloadableFile, 'downloadable-files', false) : null,
      display_font_regular_url: displayFontRegularFile && displayFontRegularFile.size > 0 ? await uploadFile(displayFontRegularFile, 'display-fonts') : null,
      display_font_italic_url: displayFontItalicFile && displayFontItalicFile.size > 0 ? await uploadFile(displayFontItalicFile, 'display-fonts') : null,
    };

    // 3. Siapkan data untuk dimasukkan ke database
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const finalData = {
      name, slug, description, price_desktop, price_business, price_corporate,
      category_id, partner_id, status, is_bestseller, glyph_string, file_size, file_types,
      tags, product_information, styles,
      main_image_url: fileUrls.main_image_url,
      gallery_image_urls: fileUrls.gallery_image_urls,
      downloadable_file_url: fileUrls.downloadable_file_url,
      display_font_regular_url: fileUrls.display_font_regular_url,
      display_font_italic_url: fileUrls.display_font_italic_url,
    };

    const { error } = await supabase.from('fonts').insert([finalData]);
    if (error) {
        if (error.code === '23505') throw new Error('A font with this name or slug already exists.');
        throw error;
    }
    
    // 4. Revalidate path untuk memperbarui cache
    revalidatePath('/admin/fonts');
    revalidatePath('/fonts');
    revalidatePath('/');
    
    return { success: 'Font added successfully!' };
  } catch (error: any) {
    console.error("Add Font Action Error: ", error);
    return { error: `Failed to add font: ${error.message}` };
  }
}

export async function deleteFontAction(fontId: string, fileUrls: any) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const pathsToDelete: { [key: string]: string[] } = {
      font_images: [],
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
        if (path) pathsToDelete.font_images.push(path);
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
        // Asumsi downloadable_file_url adalah path, bukan public URL
        pathsToDelete['downloadable-files'].push(fileUrls.downloadable_file_url);
    }

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
    const { data: fontData } = await supabaseAdmin.from('fonts').select('slug').eq('id', fontId).single();
    const { error: dbError } = await supabaseAdmin.from('fonts').delete().eq('id', fontId);
    if (dbError) throw dbError;
    
    revalidatePath('/');
    revalidatePath('/fonts');
    if (fontData?.slug) {
        revalidatePath(`/fonts/${fontData.slug}`);
    }
    revalidatePath('/admin/fonts');
    return { success: 'Font and associated files deleted successfully!' };
  } catch (error: any) {
    return { error: `Deletion failed: ${error.message}` };
  }
}

export async function updateFontAction(fontId: string, updateData: any) {
   const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { error } = await supabaseAdmin
      .from('fonts')
      .update(updateData)
      .eq('id', fontId);

    if (error) {
      if (error.message.includes("column") && error.message.includes("does not exist")) {
        throw new Error(`Database Error: A column in the data does not exist in the 'fonts' table.`);
      }
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/fonts');
    if (updateData.slug) {
      revalidatePath(`/fonts/${updateData.slug}`);
    }
    revalidatePath('/admin/fonts');

    return { success: 'Font updated successfully!' };
  } catch (error: any) {
    return { error: `Update failed: ${error.message}` };
  }
}

export async function updateFontStatusAction(
  fontId: string, 
  updates: { is_bestseller?: boolean }
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { error } = await supabaseAdmin.from('fonts').update(updates).eq('id', fontId);
    if (error) throw error;

    revalidatePath('/admin/fonts');
    revalidatePath('/');
    
    return { success: 'Font status updated successfully.' };
  } catch (error: any) {
    return { error: `Database error: ${error.message}` };
  }
}

export async function updateHomepageLayoutAction(
  featuredIds: string[],
  curatedIds: string[]
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    await supabaseAdmin
      .from('fonts')
      .update({ homepage_section: 'none', homepage_order: 0 })
      .in('homepage_section', ['featured', 'curated']);

    const featuredUpdates = featuredIds.map((id, index) => 
      supabaseAdmin
        .from('fonts')
        .update({ homepage_section: 'featured', homepage_order: index })
        .eq('id', id)
    );

    const curatedUpdates = curatedIds.map((id, index) =>
      supabaseAdmin
        .from('fonts')
        .update({ homepage_section: 'curated', homepage_order: index })
        .eq('id', id)
    );

    const allPromises = [...featuredUpdates, ...curatedUpdates];
    const results = await Promise.all(allPromises);

    const firstError = results.find(res => res.error);
    if (firstError) throw firstError.error;

    revalidatePath('/');

    return { success: 'Homepage layout saved successfully!' };
  } catch (error: any) {
    console.error('Error saving homepage layout:', error);
    return { error: `Failed to save layout: ${error.message}` };
  }
}

export async function createDiscountAction(data: DiscountInsert) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { error } = await supabaseAdmin.from('discounts').insert([data]);
    if (error) {
      const errorMessage = error.message.includes('violates row-level security policy') 
        ? 'The action is blocked by a security policy.' 
        : error.message;
      throw new Error(`Failed to create discount: ${errorMessage}`);
    }
    
    revalidatePath('/admin/fonts');
    revalidatePath('/');
    revalidatePath('/fonts');
    
    return { success: `Discount "${data.name}" created successfully!` };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteDiscountAction(discountId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    await supabaseAdmin
      .from('font_discounts')
      .delete()
      .eq('discount_id', discountId);

    const { error: discountError } = await supabaseAdmin
      .from('discounts')
      .delete()
      .eq('id', discountId);

    if (discountError) {
      throw new Error(`Failed to delete discount: ${discountError.message}`);
    }

    revalidatePath('/admin/fonts');
    revalidatePath('/');
    revalidatePath('/fonts');

    return { success: 'Discount deleted successfully.' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateDiscountAction(discountId: string, updateData: DiscountUpdate) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { error } = await supabaseAdmin
      .from('discounts')
      .update(updateData)
      .eq('id', discountId);

    if (error) {
      throw new Error(`Failed to update discount: ${error.message}`);
    }
    
    revalidatePath('/admin/fonts');
    revalidatePath('/');
    revalidatePath('/fonts');
    
    return { success: 'Discount updated successfully!' };
  } catch (error: any) {
    return { error: error.message };
  }
}