import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/features/auth/services/auth-session';

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (Next.js internal files, static chunks, HMR, images)
     * - favicon.ico (favicon file)
     * - public files with image extensions (svg, png, jpg, etc.)
     */
    '/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log('[MIDDLEWARE HIT]', pathname);

  // Lewati semua aset internal Next.js jika lolos matcher
  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Rute publik tanpa perlu login
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/api/auth') ||
    // Halaman verifikasi publik cetak invoice via QR scan
    /^\/invoices\/\d+\/print$/.test(pathname);

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let sessionPayload = null;

  if (sessionCookie) {
    sessionPayload = await verifySessionToken(sessionCookie);
  }

  // Jika belum login dan mengakses rute terlindungi
  if (!sessionPayload && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    if (sessionCookie) {
      // Hapus cookie stale jika sudah expired
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  // Jika sudah login dan mengakses halaman /login
  if (sessionPayload && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
