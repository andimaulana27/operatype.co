// src/app/actions/userActions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export type UserWithProfile = {
  id: string;
  email?: string;
  created_at?: string;
  full_name: string | null;
  role: string | null;
};

type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];
type OrderWithFont = OrderItem & {
  fonts: Pick<Font, 'name' | 'main_image_url' | 'slug'> | null;
};

export type UserDetail = {
  id: string;
  full_name: string | null;
  role: string | null;
  created_at: string | undefined;
  email: string | undefined;
  orders: OrderWithFont[];
};


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateUserPassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    return { error: `Failed to update password: ${error.message}` };
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: 'Password updated successfully!' };
}

export async function getUsersWithDetails(page: number, limit: number, searchTerm: string = '') {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    query = query.order('created_at', { ascending: false }).range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 10000 });
    if(authError) throw authError;

    const authUserMap = new Map(authUsers.map(u => [u.id, u]));

    const combinedData = data.map(profile => ({
        ...profile,
        email: authUserMap.get(profile.id)?.email || profile.email,
        created_at: authUserMap.get(profile.id)?.created_at || profile.created_at,
    }));


    return { data: combinedData, count, error: null };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error("Admin users fetch error:", message);
    return { data: [], count: 0, error: message };
  }
}

export async function getUserDetails(userId: string): Promise<{ data: UserDetail | null, error: string | null }> {
    try {
        const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authError || !user) throw authError || new Error('User not found');

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('order_items')
            .select(`*, fonts ( name, main_image_url, slug )`)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        
        const userDetails: UserDetail = {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            full_name: profile?.full_name || 'N/A',
            role: profile?.role || 'user',
            orders: (orders as OrderWithFont[]) || []
        };
        
        return { data: userDetails, error: null };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error fetching user details:", message);
        return { data: null, error: message };
    }
}

export async function updateProfileAction(formData: FormData) {
    const supabase = createServerActionClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You are not authenticated.' };

    const fullName = String(formData.get('fullName'));
    if (!fullName) return { error: 'Full name is required.' };

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
    
    if (error) return { error: error.message };

    revalidatePath('/account/edit-profile');
    return { success: 'Profile updated successfully!' };
}

export async function changePasswordAction(formData: FormData) {
    const newPassword = String(formData.get('newPassword'));
    const confirmPassword = String(formData.get('confirmPassword'));

    if (newPassword.length < 6) return { error: 'Password must be at least 6 characters.' };
    if (newPassword !== confirmPassword) return { error: 'Passwords do not match.' };
    
    const supabase = createServerActionClient({ cookies });
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) return { error: error.message };

    return { success: 'Password changed successfully!' };
}