import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/features/auth/services/auth-session';

const VALID_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const VALID_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return NextResponse.json(
        { error: 'Username atau kata sandi tidak sesuai' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);

    const response = NextResponse.json({
      success: true,
      username,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
