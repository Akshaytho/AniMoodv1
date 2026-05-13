import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signSession, verifySession } from '../auth';

describe('password hashing', () => {
  it('hashes then verifies correctly', () => {
    const hash = hashPassword('correct-horse-battery-staple');
    expect(hash).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(verifyPassword('correct-horse-battery-staple', hash)).toBe(true);
  });

  it('rejects wrong password', () => {
    const hash = hashPassword('aaa');
    expect(verifyPassword('bbb', hash)).toBe(false);
  });

  it('throws on malformed hash', () => {
    expect(() => verifyPassword('x', 'not-a-hash')).toThrow();
    expect(() => verifyPassword('x', 'scrypt::')).toThrow();
  });
});

describe('session tokens', () => {
  const secret = 'a'.repeat(64);

  it('signs then verifies a session', () => {
    const token = signSession({ email: 'a@b.c' }, secret);
    const payload = verifySession(token, secret);
    expect(payload?.email).toBe('a@b.c');
    expect(payload?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects tampered token', () => {
    const token = signSession({ email: 'a@b.c' }, secret);
    const parts = token.split('.');
    const tampered = `${parts[0]}AAA.${parts[1]}`;
    expect(verifySession(tampered, secret)).toBeNull();
  });

  it('rejects wrong secret', () => {
    const token = signSession({ email: 'a@b.c' }, secret);
    expect(verifySession(token, 'b'.repeat(64))).toBeNull();
  });

  it('rejects malformed token', () => {
    expect(verifySession('not.a.valid.token', secret)).toBeNull();
    expect(verifySession('', secret)).toBeNull();
  });
});
