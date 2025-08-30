// src/app/api/auth/reset-password/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Pertama, periksa apakah ada sesi yang valid dari cookie
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required. Your session may have expired.' }, { status: 401 });
  }

  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
  }

  // Lakukan pembaruan password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    return NextResponse.json({ error: `Failed to update password: ${updateError.message}` }, { status: 500 });
  }

  // Logout pengguna setelah berhasil mengubah password
  await supabase.auth.signOut();

  return NextResponse.json({ success: true, message: 'Password updated successfully. Please log in again.' });
}