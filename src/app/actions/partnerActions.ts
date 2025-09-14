// src/app/actions/partnerActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js';

// type Partner = Database['public']['Tables']['partners']['Row']; // Dihapus

export async function getPartnersAction(options: { page: number, limit: number, searchTerm?: string }) {
  const { page, limit, searchTerm } = options;
  const supabase = createServerActionClient({ cookies });

  try {
    let query = supabase
      .from('partners')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(start, end);

    if (error) throw error;
    
    return { data, count, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { data: [], count: 0, error: message };
  }
}

export async function addPartnerAction(formData: FormData) {
  const name = String(formData.get('name'));
  const subheadline = String(formData.get('subheadline'));
  const logoFile = formData.get('logo') as File | null;
  const supabase = createServerActionClient({ cookies });

  if (!name) return { error: 'Partner Name is required.' };

  try {
    let logo_url: string | null = null;
    if (logoFile && logoFile.size > 0) {
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const filePath = `public/${Date.now()}_${logoFile.name}`;
      const { error: uploadError } = await supabaseAdmin.storage.from('partner_logos').upload(filePath, logoFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabaseAdmin.storage.from('partner_logos').getPublicUrl(filePath);
      logo_url = urlData.publicUrl;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const { error: insertError } = await supabase.from('partners').insert({ name, subheadline, slug, logo_url });
    if (insertError) throw insertError;

    revalidatePath('/admin/partners');
    revalidatePath('/partners');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

export async function getPartnerByIdAction(id: string) {
    const supabase = createServerActionClient<Database>({ cookies });
    try {
        const { data, error } = await supabase.from('partners').select('*').eq('id', id).single();
        if (error) throw error;
        return { data, error: null };
    } catch(error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { data: null, error: message };
    }
}

export async function updatePartnerAction(id: string, formData: FormData) {
    const name = String(formData.get('name'));
    const subheadline = String(formData.get('subheadline'));
    const logoFile = formData.get('logo') as File | null;
    const existingLogoUrl = String(formData.get('existing_logo_url'));

    const supabase = createServerActionClient({ cookies });
    if (!name) return { error: 'Partner Name is required.' };

    try {
        let logo_url: string | null = existingLogoUrl;
        if (logoFile && logoFile.size > 0) {
            const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            const filePath = `public/${Date.now()}_${logoFile.name}`;
            const { error: uploadError } = await supabaseAdmin.storage.from('partner_logos').upload(filePath, logoFile);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabaseAdmin.storage.from('partner_logos').getPublicUrl(filePath);
            logo_url = urlData.publicUrl;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const { error } = await supabase.from('partners').update({ name, subheadline, slug, logo_url }).eq('id', id);
        if (error) throw error;

        revalidatePath('/admin/partners');
        revalidatePath(`/partners/${slug}`);
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}


export async function deletePartnerAction(id: string) {
    const supabase = createServerActionClient({ cookies });
    try {
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/partners');
        revalidatePath('/partners');
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}