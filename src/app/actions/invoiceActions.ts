// src/app/actions/invoiceActions.ts
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

// Definisikan tipe data yang akan kita kembalikan. Ini penting untuk type safety.
export type InvoiceDetails = {
  id: string;
  invoice_id: string | null;
  created_at: string | null;
  total_amount: number | null;
  user: {
    full_name: string | null;
    email: string | null;
  } | null;
  order_items: {
    id: string;
    license_type: string | null;
    user_count: number | null;
    amount: number | null;
    font: {
      name: string | null;
    } | null;
  }[];
} | null;

export async function getInvoiceDetailsAction(invoiceId: string): Promise<{ data: InvoiceDetails, error: string | null }> {
  const supabase = createServerActionClient<Database>({ cookies });

  // 1. Dapatkan sesi pengguna saat ini untuk verifikasi keamanan
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Authentication required." };
  }

  // 2. Ambil data invoice LENGKAP dari database
  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .select(`
      id,
      invoice_id,
      created_at,
      total_amount,
      profiles (full_name, email),
      order_items (
        id,
        license_type,
        user_count,
        amount,
        fonts (name)
      )
    `)
    .eq('invoice_id', invoiceId)
    .eq('user_id', user.id) // <-- KUNCI KEAMANAN: Pastikan invoice ini milik pengguna yang login
    .single();

  if (purchaseError) {
    console.error("Error fetching invoice:", purchaseError.message);
    return { data: null, error: "Could not retrieve invoice details." };
  }

  if (!purchaseData) {
    return { data: null, error: "Invoice not found or you do not have permission to view it." };
  }

  // --- PERBAIKAN DI SINI ---
  // Kita melakukan casting ke 'any' untuk melewati pengecekan ketat TypeScript pada hasil join yang kompleks.
  // TypeScript sering salah menganggap hasil query kompleks sebagai 'never'.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = purchaseData as any;

  // 3. Format data agar sesuai dengan tipe InvoiceDetails
  const formattedData: InvoiceDetails = {
    id: rawData.id,
    invoice_id: rawData.invoice_id,
    created_at: rawData.created_at,
    total_amount: rawData.total_amount,
    user: rawData.profiles, // Mapping dari 'profiles' ke 'user'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order_items: rawData.order_items.map((item: any) => ({
      id: item.id,
      license_type: item.license_type,
      user_count: item.user_count,
      amount: item.amount,
      font: item.fonts // Mapping dari 'fonts' ke 'font'
    }))
  };

  return { data: formattedData, error: null };
}