// src/app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  // Ambil 'next' dari URL, yang akan menjadi '/reset-password'
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error: any) {
        console.error("Auth Callback Error:", error.message);
        // Redirect ke login jika gagal
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not authenticate user.`);
    }
  }

  // Redirect ke halaman tujuan ('/reset-password')
  return NextResponse.redirect(requestUrl.origin + next);
}