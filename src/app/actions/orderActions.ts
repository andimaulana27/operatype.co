// src/app/actions/orderActions.ts
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/context/CartContext';
import { sendPurchaseConfirmationEmail, sendAdminSaleNotification } from './emailActions';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js';
import { InvoiceDetails } from './invoiceActions';
import { generateInvoicePdf } from '@/lib/pdfGenerator';

type OrderItemWithFont = Database['public']['Tables']['order_items']['Row'] & {
    fonts: { name: string | null; downloadable_file_url: string | null } | null;
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

  if (!user) return { error: 'You must be logged in to make a purchase.' };
  if (!cartItems || cartItems.length === 0) return { error: 'Your cart is empty.' };
  
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
    const invoiceId = `INV-${Date.now()}-${user.id.substring(0, 4)}`;

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchases').insert({
        user_id: user.id, total_amount: totalAmount,
        transaction_id: transactionDetails.orderId, invoice_id: invoiceId,
      }).select().single();

    if (purchaseError) throw new Error(`Purchase Error: ${purchaseError.message}`);

    const orderItemsToInsert = cartItems.map(item => ({
      purchase_id: purchaseData.id, user_id: user.id, font_id: item.fontId,
      amount: item.price, license_type: item.license, user_count: item.users,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items').insert(orderItemsToInsert)
      .select('*, fonts(name, downloadable_file_url)');

    if (itemsError) throw new Error(`Order Items Error: ${itemsError.message}`);

    const downloadLinks = await Promise.all(
        (insertedItems as OrderItemWithFont[]).map(async (item) => {
            if (!item.fonts?.downloadable_file_url) {
                return { name: item.fonts?.name || 'Font', url: '#' };
            }
            const { data, error } = await supabaseAdmin.storage
                .from('downloadable-files')
                .createSignedUrl(item.fonts.downloadable_file_url, 3600 * 24 * 7); // Link berlaku 7 hari

            if (error) {
                console.error(`Error creating signed URL for ${item.fonts.name}:`, error);
                return { name: item.fonts.name || 'Font', url: '#' };
            }
            return { name: item.fonts.name || 'Font', url: data.signedUrl };
        })
    );

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const userDetails = { email: user.email!, full_name: profile?.full_name || transactionDetails.payerName };
    
    const invoiceData: InvoiceDetails = {
        id: purchaseData.id, invoice_id: purchaseData.invoice_id, created_at: purchaseData.created_at,
        total_amount: purchaseData.total_amount, user: userDetails,
        order_items: (insertedItems as OrderItemWithFont[]).map(item => ({
            id: item.id, license_type: item.license_type, user_count: item.user_count,
            amount: item.amount, font: item.fonts ? { name: item.fonts.name } : null
        }))
    };
    
    const invoicePdf = await generateInvoicePdf(invoiceData);
    const emailOrderItems: OrderItemWithFont[] = insertedItems.map(item => ({...item, fonts: item.fonts as { name: string | null } | null}));
    
    // ==================== PERBAIKAN UTAMA DI SINI ====================
    try {
      console.log("Mencoba mengirim email...");
      // Tambahkan 'await' untuk memastikan action menunggu email selesai dikirim
      await Promise.all([
        sendPurchaseConfirmationEmail(userDetails, emailOrderItems, transactionDetails, downloadLinks, invoicePdf),
        sendAdminSaleNotification(userDetails, emailOrderItems, transactionDetails)
      ]);
      console.log("Perintah pengiriman email berhasil dieksekusi.");
    } catch (emailError) {
      // Jika email gagal, log errornya tapi jangan gagalkan seluruh transaksi
      console.error("GAGAL MENGIRIM EMAIL:", emailError);
      // Anda bisa menambahkan sistem logging lain di sini jika perlu
    }
    // ===============================================================

    revalidatePath('/account', 'layout');
    return { success: 'Your order has been placed successfully! Please check your email.' };

  } catch (error: any) {
    console.error("Create Order Action Error:", error);
    return { error: "An unexpected error occurred while processing your order." };
  }
}

// ... (sisa kode getAdminOrdersAction tetap sama)
export async function getAdminOrdersAction(page: number, limit: number, searchTerm: string = '') {
    // ...
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

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(
        `profiles.full_name.ilike.${searchPattern},profiles.email.ilike.${searchPattern},invoice_id.ilike.${searchPattern}`
      );
    }

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