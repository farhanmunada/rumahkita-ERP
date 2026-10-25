import { NextRequest, NextResponse } from 'next/server';
import {
  touchSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/features/auth/services/auth-session';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    return NextResponse.json({ error: 'Tidak ada sesi aktif' }, { status: 401 });
  }

  const touchedToken = await touchSessionToken(cookie.value);
  if (!touchedToken) {
    const res = NextResponse.json({ error: 'Sesi telah kedaluwarsa' }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: touchedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
