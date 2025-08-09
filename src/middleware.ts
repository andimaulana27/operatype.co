// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  const { pathname } = req.nextUrl;

  // Aturan 1: Jika BELUM login dan mencoba akses halaman terproteksi
  if (!session && (pathname.startsWith('/account') || pathname.startsWith('/admin'))) {
    // Arahkan ke halaman login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Aturan 2: Jika SUDAH login dan BUKAN admin, tapi mencoba akses halaman admin
  if (session && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      // Arahkan ke halaman utama
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Jika semua aturan di atas tidak terpenuhi, izinkan akses
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
