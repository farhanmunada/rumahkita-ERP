import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/features/auth/services/auth-session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
