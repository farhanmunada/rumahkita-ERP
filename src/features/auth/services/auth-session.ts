import { SessionPayload } from '../types';

export const SESSION_COOKIE_NAME = 'rk_session';
export const SESSION_MAX_AGE_SECONDS = 3600; // 1 jam = 3600 detik

const AUTH_SECRET = process.env.AUTH_SECRET || 'rk-erp-secure-secret-key-2026-production';

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToString(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLen);
  return decodeURIComponent(escape(atob(padded)));
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(username: string): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    username,
    role: 'admin',
    createdAt: now,
    lastActive: now,
  };

  const payloadString = JSON.stringify(payload);
  const payloadPart = stringToBase64Url(payloadString);

  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadPart));
  const sigPart = bufferToBase64Url(sigBuffer);

  return `${payloadPart}.${sigPart}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadPart, sigPart] = parts;
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const sigBytes = base64UrlToBuffer(sigPart);

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadPart)
    );

    if (!isValidSig) return null;

    const payloadJson = base64UrlToString(payloadPart);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Cek timeout inaktif 1 jam (3600 detik)
    const now = Date.now();
    const idleTimeSeconds = (now - payload.lastActive) / 1000;
    if (idleTimeSeconds > SESSION_MAX_AGE_SECONDS) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[verifySessionToken ERROR]', err);
    return null;
  }
}

export async function touchSessionToken(token: string): Promise<string | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  payload.lastActive = Date.now();
  const payloadString = JSON.stringify(payload);
  const payloadPart = stringToBase64Url(payloadString);

  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadPart));
  const sigPart = bufferToBase64Url(sigBuffer);

  return `${payloadPart}.${sigPart}`;
}
