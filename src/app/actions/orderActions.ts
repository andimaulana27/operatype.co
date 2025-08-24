// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext';
import { sendPurchaseConfirmationEmail, sendAdminSaleNotification } from './emailActions';

type TransactionDetails = {
  orderId: string;
  payerEmail: string;
  payerName: string;
};

export async function createOrderAction(
  cartItems: CartItem[], 
  transactionDetails: TransactionDetails
) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to make a purchase.' };
  }
  if (!cartItems || cartItems.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  // --- PERBAIKAN UTAMA: Pastikan setiap item mendapatkan ID Invoice unik ---
  const ordersToInsert = cartItems.map((item, index) => ({
    user_id: user.id,
    font_id: item.fontId,
    amount: item.price,
    license_type: item.license,
    user_count: item.users,
    transaction_id: transactionDetails.orderId,
    // Buat ID unik untuk setiap baris order, bukan hanya sekali
    invoice_id: `INV-${Date.now() + index}-${user.id.substring(0, 4)}`,
  }));

  try {
    const { data: newOrders, error } = await supabase
        .from('orders')
        .insert(ordersToInsert)
        .select('*, fonts(name)');

    if (error || !newOrders) {
      throw new Error(`Failed to save order: ${error?.message}`);
    }

    revalidatePath('/account', 'layout'); // Revalidate seluruh layout akun

    // Panggil fungsi pengiriman email
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const userDetails = { email: user.email!, full_name: profile?.full_name || transactionDetails.payerName };

    sendPurchaseConfirmationEmail(userDetails, newOrders, transactionDetails);
    sendAdminSaleNotification(userDetails, newOrders, transactionDetails);

    return { success: 'Your order has been placed successfully!' };

  } catch (error: any) {
    console.error("Create Order Action Error:", error);
    return { error: "An unexpected error occurred while processing your order." };
  }
}