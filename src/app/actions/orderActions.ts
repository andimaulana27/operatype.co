// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext';
import { sendPurchaseConfirmationEmail, sendAdminSaleNotification } from './emailActions';
import { Database } from '@/lib/database.types'; // Tambahkan import ini

// Tipe data baru untuk email
type OrderItemWithFont = Database['public']['Tables']['order_items']['Row'] & {
    fonts: { name: string | null } | null;
};

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

  try {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const invoiceId = `INV-${Date.now()}-${user.id.substring(0, 4)}`;

    // PERBAIKAN 1: Buat satu entri di tabel 'purchases' untuk seluruh transaksi
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        transaction_id: transactionDetails.orderId,
        invoice_id: invoiceId,
      })
      .select()
      .single();

    if (purchaseError || !purchaseData) {
      throw new Error(`Failed to create purchase record: ${purchaseError?.message}`);
    }

    const purchaseId = purchaseData.id;

    // PERBAIKAN 2: Simpan setiap item keranjang ke 'order_items' dengan purchase_id yang sama
    const orderItemsToInsert = cartItems.map(item => ({
      purchase_id: purchaseId,
      user_id: user.id,
      font_id: item.fontId,
      amount: item.price,
      license_type: item.license,
      user_count: item.users,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)
      .select('*, fonts(name)'); // Ambil juga nama font untuk email

    if (itemsError || !insertedItems) {
      throw new Error(`Failed to save order items: ${itemsError?.message}`);
    }
    
    revalidatePath('/account', 'layout');

    // PERBAIKAN 3: Kirim data yang sudah sesuai ke fungsi email
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const userDetails = { email: user.email!, full_name: profile?.full_name || transactionDetails.payerName };

    // Ubah tipe data agar cocok
    const emailOrderItems: OrderItemWithFont[] = insertedItems.map(item => ({
        ...item,
        fonts: item.fonts as { name: string | null } | null
    }));
    
    // Gunakan orderId dari PayPal untuk konfirmasi, bukan invoice_id internal
    sendPurchaseConfirmationEmail(userDetails, emailOrderItems, transactionDetails);
    sendAdminSaleNotification(userDetails, emailOrderItems, transactionDetails);

    return { success: 'Your order has been placed successfully!' };

  } catch (error: any) {
    console.error("Create Order Action Error:", error);
    return { error: "An unexpected error occurred while processing your order." };
  }
}