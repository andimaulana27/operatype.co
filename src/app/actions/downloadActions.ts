// src/app/actions/downloadActions.ts
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function getSecureDownloadUrlAction(fontId: string) {
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  // Gunakan Service Key untuk memeriksa data internal dengan aman
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Cek apakah pengguna pernah membeli font ini
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('font_id', fontId)
    .limit(1)
    .single();

  if (orderError || !orderData) {
    return { error: "You have not purchased this font." };
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