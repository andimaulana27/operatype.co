// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext';
import { sendPurchaseConfirmationEmail, sendAdminSaleNotification } from './emailActions';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js'; // Pastikan import ini ada

// Tipe data baru untuk email
type OrderItemWithFont = Database['public']['Tables']['order_items']['Row'] & {
    fonts: { name: string | null } | null;
};

type TransactionDetails = {
  orderId: string;
  payerEmail: string;
  payerName: string;
};

// --- FUNGSI createOrderAction TETAP SAMA ---
export async function createOrderAction(
  cartItems: CartItem[], 
  transactionDetails: TransactionDetails
) {
  // ... (kode yang ada tidak berubah)
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
      .select('*, fonts(name)');

    if (itemsError || !insertedItems) {
      throw new Error(`Failed to save order items: ${itemsError?.message}`);
    }
    
    revalidatePath('/account', 'layout');

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const userDetails = { email: user.email!, full_name: profile?.full_name || transactionDetails.payerName };

    const emailOrderItems: OrderItemWithFont[] = insertedItems.map(item => ({
        ...item,
        fonts: item.fonts as { name: string | null } | null
    }));
    
    sendPurchaseConfirmationEmail(userDetails, emailOrderItems, transactionDetails);
    sendAdminSaleNotification(userDetails, emailOrderItems, transactionDetails);

    return { success: 'Your order has been placed successfully!' };

  } catch (error: any) {
    console.error("Create Order Action Error:", error);
    return { error: "An unexpected error occurred while processing your order." };
  }
}


// ==================== FUNGSI BARU UNTUK ADMIN ====================
// Fungsi ini aman karena hanya berjalan di server dan menggunakan Service Key
export async function getAdminOrdersAction(page: number, limit: number, searchTerm: string = '') {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabaseAdmin
      .from('purchases')
      .select(`
        *,
        profiles(full_name, email),
        order_items(count)
      `, { count: 'exact' });

    // Terapkan filter pencarian jika ada
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(
        `profiles.full_name.ilike.${searchPattern},profiles.email.ilike.${searchPattern},invoice_id.ilike.${searchPattern}`
      );
    }

    // Terapkan paginasi
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.order('created_at', { ascending: false }).range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, count, error: null };

  } catch (error: any) {
    console.error("Admin order fetch error:", error.message);
    return { data: [], count: 0, error: error.message };
  }
}