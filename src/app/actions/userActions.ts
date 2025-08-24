// src/app/actions/userActions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Tipe untuk data gabungan
export type UserWithProfile = {
  id: string;
  email?: string;
  created_at?: string;
  full_name: string | null;
  role: string | null;
};

// Tipe untuk detail pengguna tunggal
type Order = Database['public']['Tables']['orders']['Row'];
type Font = Database['public']['Tables']['fonts']['Row'];
type OrderWithFont = Order & {
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


// Inisialisasi Supabase Admin Client
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

// Fungsi BARU untuk mengambil semua pengguna dengan detailnya
export async function getUsersWithDetails(page: number, limit: number, searchTerm: string = '') {
  try {
    const { data: { users: authUsers }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 });
    if (usersError) throw usersError;

    const { data: profiles, error: profileError } = await supabaseAdmin.from('profiles').select('*');
    if (profileError) throw profileError;
    const profileMap = new Map(profiles.map(p => [p.id, p]));

    let combinedUsers: UserWithProfile[] = authUsers.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      full_name: profileMap.get(user.id)?.full_name || 'N/A',
      role: profileMap.get(user.id)?.role || 'user',
    }));

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      combinedUsers = combinedUsers.filter(user =>
        user.full_name?.toLowerCase().includes(lowercasedSearch) ||
        user.email?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    combinedUsers.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    const totalCount = combinedUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = combinedUsers.slice(start, end);

    return { data: paginatedUsers, count: totalCount, error: null };

  } catch (error: any) {
    return { data: [], count: 0, error: error.message };
  }
}


// Fungsi BARU untuk mengambil detail pengguna tunggal
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
            .from('orders')
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

    } catch (error: any) {
        console.error("Error fetching user details:", error.message);
        return { data: null, error: error.message };
    }
}

// --- FUNGSI BARU UNTUK EDIT PROFIL ---
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

// --- FUNGSI BARU UNTUK UBAH KATA SANDI ---
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