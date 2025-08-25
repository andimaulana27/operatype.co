// src/app/actions/downloadActions.ts
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

export async function getSecureDownloadUrlAction(fontId: string) {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Gunakan Service Key untuk memeriksa data internal dengan aman
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Cek apakah pengguna pernah membeli font ini
  const { data: orderItemData, error: orderItemError } = await supabaseAdmin
    .from('order_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('font_id', fontId)
    .limit(1)
    .single();

  if (orderItemError || !orderItemData) {
    return { error: "Purchase not found. You cannot download this font." };
  }

  // 2. Jika pembelian valid, ambil path file dari tabel font
  const { data: fontData, error: fontError } = await supabaseAdmin
    .from('fonts')
    .select('downloadable_file_url')
    .eq('id', fontId)
    .single();

  if (fontError || !fontData || !fontData.downloadable_file_url) {
    return { error: "Downloadable file not found for this font." };
  }

  // 3. Buat URL download sementara (signed URL) yang aman
  const filePath = fontData.downloadable_file_url;
  const { data: urlData, error: urlError } = await supabaseAdmin
    .storage
    .from('downloadable-files')
    .createSignedUrl(filePath, 60); // URL berlaku selama 60 detik

  if (urlError) {
    return { error: "Could not create download link." };
  }

  return { success: true, url: urlData.signedUrl };
}