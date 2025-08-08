// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fungsi middleware ini hanya bertujuan untuk menyegarkan sesi pengguna
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession(); // Ini akan menyegarkan cookie sesi jika diperlukan
  return res;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk file-file internal Next.js
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
