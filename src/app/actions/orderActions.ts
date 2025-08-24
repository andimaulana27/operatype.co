// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext';

// --- PERBAIKAN: Tambahkan detail transaksi ke data yang disimpan ---
type TransactionDetails = {
  orderId: string; // ID dari PayPal
  payerEmail: string;
  payerName: string;
};

export async function createOrderAction(
  cartItems: CartItem[], 
  transactionDetails: TransactionDetails // Tambahkan ini
) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to make a purchase.' };
  }
  if (!cartItems || cartItems.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  // Siapkan data pesanan dengan detail dari PayPal
  const ordersToInsert = cartItems.map(item => ({
    user_id: user.id,
    font_id: item.fontId,
    amount: item.price,
    license_type: item.license,
    user_count: item.users,
    transaction_id: transactionDetails.orderId, // Simpan ID transaksi PayPal
    invoice_id: `INV-${Date.now()}-${user.id.substring(0, 4)}`, // Buat ID invoice unik
  }));

  try {
    const { error } = await supabase.from('orders').insert(ordersToInsert);
    if (error) {
      throw new Error(`Failed to save order: ${error.message}`);
    }

    revalidatePath('/account');

    // Nanti di sini kita akan memanggil fungsi pengiriman email
    // await sendConfirmationEmailsAction(user, ordersToInsert, transactionDetails);

    return { success: 'Your order has been placed successfully!' };

  } catch (error: any) {
    return { error: error.message };
  }
}