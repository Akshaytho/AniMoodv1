/**
 * Server-side fetcher. Forwards the request's cookies so the Express api
 * sees the same session. Use only from server components and route handlers.
 */
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ApiError {
  status: number;
  body: unknown;
}

async function buildCookieHeader(): Promise<string> {
  const c = await cookies();
  return c.getAll().map((x) => `${x.name}=${x.value}`).join('; ');
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Cookie: await buildCookieHeader() },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw { status: res.status, body } satisfies ApiError;
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Cookie: await buildCookieHeader(),
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const responseBody = await res.text();
    throw { status: res.status, body: responseBody } satisfies ApiError;
  }
  return (await res.json()) as T;
}
