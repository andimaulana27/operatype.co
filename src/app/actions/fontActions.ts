'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

type FontFormData = Partial<Database['public']['Tables']['fonts']['Row']>;
type DiscountUpdate = Partial<Database['public']['Tables']['discounts']['Update']>;
type FileUrls = {
  main_image_url: string | null;
  gallery_image_urls: string[];
  downloadable_file_url: string | null;
  display_font_regular_url: string | null;
  display_font_italic_url: string | null;
};

// ... (fungsi-fungsi sebelumnya seperti deleteFontAction, addFontAction, dll. tetap di sini) ...

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

export async function addFontAction(formData: FontFormData, fileUrls: FileUrls) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const slug = formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
    
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

    const { data: insertedData, error } = await supabaseAdmin.from('fonts').insert([finalData]).select().single();
    if (error) {
        if (error.code === '23505') {
            throw new Error('A font with this name or slug already exists.');
        }
        throw error;
    }
    
    revalidatePath('/');
    revalidatePath('/fonts');
    revalidatePath(`/fonts/${insertedData.slug}`);
    revalidatePath('/admin/fonts');
    return { success: 'Font added successfully!' };
  } catch (error: any) {
    return { error: `Failed to add font: ${error.message}` };
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

export async function deleteDiscountAction(discountId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Hapus dulu relasi di font_discounts
    await supabaseAdmin
      .from('font_discounts')
      .delete()
      .eq('discount_id', discountId);

    // Baru hapus diskonnya
    const { error: discountError } = await supabaseAdmin
      .from('discounts')
      .delete()
      .eq('id', discountId);

    if (discountError) {
      throw new Error(`Failed to delete discount: ${discountError.message}`);
    }

    revalidatePath('/admin/fonts');
    revalidatePath('/'); // Revalidate homepage juga
    // Perlu revalidate semua halaman font, cara paling mudah revalidate path /fonts
    revalidatePath('/fonts');

    return { success: 'Discount deleted successfully.' };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- FUNGSI BARU UNTUK UPDATE DISKON ---
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
