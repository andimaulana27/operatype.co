// src/app/actions/fontActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js';

type DiscountInsert = Database['public']['Tables']['discounts']['Insert'];
type DiscountUpdate = Partial<Database['public']['Tables']['discounts']['Update']>;

// ==================== PERUBAHAN UTAMA DI SINI ====================
export async function addFontAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  try {
    // 1. Ekstrak semua data teks DAN URL dari FormData
    const name = String(formData.get('name'));
    const description = String(formData.get('description'));
    const price_desktop = Number(formData.get('price_desktop'));
    // --- PERBAIKAN ---
    const price_standard_commercial = Number(formData.get('price_standard_commercial'));
    const price_extended_commercial = Number(formData.get('price_extended_commercial'));
    // --- AKHIR PERBAIKAN ---
    const price_corporate = Number(formData.get('price_corporate'));
    const category_id = String(formData.get('category_id'));
    const partner_id = formData.get('partner_id') ? String(formData.get('partner_id')) : null;
    const status = String(formData.get('status'));
    const is_bestseller = formData.get('is_bestseller') === 'on';
    const glyph_string = String(formData.get('glyph_string'));
    const file_size = String(formData.get('file_size'));
    const file_types = String(formData.get('file_types'));
    
    // Ekstrak URL yang dikirim dari klien
    const main_image_url = String(formData.get('main_image_url'));
    const gallery_image_urls = formData.getAll('gallery_image_urls').map(String);
    const downloadable_file_url = String(formData.get('downloadable_file_url'));
    const display_font_regular_url = String(formData.get('display_font_regular_url'));
    const display_font_italic_url = String(formData.get('display_font_italic_url'));

    const tags = formData.getAll('tags').map(String);
    const product_information = formData.getAll('product_information').map(String);
    const styles = formData.getAll('styles').map(String);

    // 2. Siapkan data untuk dimasukkan ke database
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const finalData = {
      name, slug, description, price_desktop, 
      // --- PERBAIKAN ---
      price_standard_commercial, 
      price_extended_commercial,
      // --- AKHIR PERBAIKAN ---
      price_corporate,
      category_id, partner_id, status, is_bestseller, glyph_string, file_size, file_types,
      tags, product_information, styles,
      main_image_url,
      gallery_image_urls,
      downloadable_file_url,
      display_font_regular_url,
      display_font_italic_url,
    };

    const { error } = await supabase.from('fonts').insert([finalData]);
    if (error) {
        if (error.code === '23505') throw new Error('Font dengan nama atau slug ini sudah ada.');
        throw error;
    }
    
    // 3. Revalidate path untuk memperbarui cache
    revalidatePath('/admin/fonts');
    revalidatePath('/fonts');
    revalidatePath('/');
    
    return { success: 'Font berhasil ditambahkan!' };
  } catch (error: any) {
    console.error("Add Font Action Error: ", error);
    return { error: `Gagal menambahkan font: ${error.message}` };
  }
}
// ===============================================================

// Sisa kode di file ini (deleteFontAction, updateFontAction, dll) tetap sama
export async function deleteFontAction(fontId: string, fileUrls: any) {
    // ...
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

export async function getAdminFontsAction(options: {
  page: number;
  limit: number;
  searchTerm?: string;
  category?: string;
  partner?: string;
}) {
  const { page, limit, searchTerm, category, partner } = options;
  
  // Gunakan service key untuk akses penuh
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from('fonts')
      .select(`
        *, 
        categories(name), 
        partners(name), 
        order_items(count), 
        font_discounts(discounts(*))
      `, { count: 'exact' });

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (partner) {
      query = query.eq('partner_id', partner);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    query = query.order('created_at', { ascending: false }).range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;
    
    return { data, count, error: null };

  } catch (error: any) {
    console.error("Admin fonts fetch error:", error.message);
    return { data: [], count: 0, error: error.message };
  }
}

export async function applyDiscountToFontsAction(
  fontIds: string[],
  discountId: string | null
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Selalu hapus relasi diskon yang lama terlebih dahulu
    const { error: deleteError } = await supabaseAdmin
      .from('font_discounts')
      .delete()
      .in('font_id', fontIds);

    if (deleteError) throw new Error(`Error clearing existing discounts: ${deleteError.message}`);

    // Jika ada discountId baru, sisipkan relasi yang baru
    if (discountId) {
      const recordsToInsert = fontIds.map(fontId => ({
        font_id: fontId,
        discount_id: discountId,
      }));
      
      const { error: insertError } = await supabaseAdmin
        .from('font_discounts')
        .insert(recordsToInsert);
        
      if (insertError) throw new Error(`Failed to apply discount: ${insertError.message}`);
      
      revalidatePath('/');
      revalidatePath('/fonts');
      return { success: `Discount applied to ${fontIds.length} font(s).` };
    }
    
    revalidatePath('/');
    revalidatePath('/fonts');
    return { success: `Discounts removed from ${fontIds.length} font(s).` };

  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAvailableHomepageFontsAction(options: {
  page: number;
  limit: number;
  searchTerm?: string;
  showBestsellers?: boolean;
}) {
  const { page, limit, searchTerm, showBestsellers } = options;
  
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from('fonts')
      .select('*', { count: 'exact' })
      .eq('status', 'Published');

    // ==================== PERBAIKAN BUG ====================
    // Gunakan .or() untuk mencari font yang kolom homepage_section-nya
    // entah NULL (belum pernah diatur) ATAU 'none' (sudah dihapus dari homepage).
    query = query.or('homepage_section.is.null,homepage_section.eq.none');
    // =======================================================

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    if (showBestsellers) {
      query = query.eq('is_bestseller', true);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    query = query.order('name', { ascending: true }).range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;
    
    return { data, count, error: null };

  } catch (error: any) {
    console.error("Available homepage fonts fetch error:", error.message);
    return { data: [], count: 0, error: error.message };
  }
}