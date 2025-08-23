// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext'; // Kita akan butuh tipe data ini

export async function createOrderAction(
  cartItems: CartItem[], 
  totalAmount: number
) {
  const supabase = createServerActionClient({ cookies });

  // 1. Dapatkan informasi user yang sedang login
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to make a purchase.' };
  }

  // 2. Validasi data
  if (!cartItems || cartItems.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  // 3. Siapkan data untuk dimasukkan ke tabel 'orders'
  const ordersToInsert = cartItems.map(item => ({
    user_id: user.id,
    font_id: item.fontId,
    amount: item.price,
    license_type: item.license,
    user_count: item.users,
  }));

  try {
    // 4. Masukkan semua data pesanan ke database
    const { error } = await supabase.from('orders').insert(ordersToInsert);

    if (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to save order: ${error.message}`);
    }

    // 5. Revalidate path untuk memperbarui cache halaman akun
    revalidatePath('/account');

    return { success: 'Your order has been placed successfully!' };

  } catch (error: any) {
    return { error: error.message };
  }
}