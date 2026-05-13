import { scryptSync, timingSafeEqual, randomBytes, createHmac } from 'node:crypto';

const HASH_PARTS = 3;
const SCRYPT_KEYLEN = 64;

export interface PasswordHash {
  algo: 'scrypt';
  saltHex: string;
  hashHex: string;
}

export function parsePasswordHash(stored: string): PasswordHash {
  const parts = stored.split(':');
  if (parts.length !== HASH_PARTS || parts[0] !== 'scrypt') {
    throw new Error(`Invalid password hash format`);
  }
  const saltHex = parts[1];
  const hashHex = parts[2];
  if (!saltHex || !hashHex) {
    throw new Error(`Invalid password hash format`);
  }
  return { algo: 'scrypt', saltHex, hashHex };
}

export function verifyPassword(password: string, stored: string): boolean {
  const { saltHex, hashHex } = parsePasswordHash(stored);
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Minimal HMAC-signed session token. Plain JSON payload + HMAC-SHA256.
 * Format: `<base64url(payload)>.<base64url(signature)>`. No JWT lib needed.
 */
export interface SessionPayload {
  email: string;
  issuedAt: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(s: string): Buffer {
  const pad = (4 - (s.length % 4)) % 4;
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

export function signSession(payload: Omit<SessionPayload, 'issuedAt' | 'expiresAt'>, secret: string): string {
  const now = Date.now();
  const full: SessionPayload = { ...payload, issuedAt: now, expiresAt: now + SESSION_TTL_MS };
  const body = b64urlEncode(Buffer.from(JSON.stringify(full)));
  const sig = b64urlEncode(createHmac('sha256', secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifySession(token: string, secret: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = b64urlEncode(createHmac('sha256', secret).update(body).digest());
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8')) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.expiresAt !== 'number' || payload.expiresAt < Date.now()) return null;
  return payload;
}

export const SESSION_COOKIE_NAME = 'animood_session';
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;
