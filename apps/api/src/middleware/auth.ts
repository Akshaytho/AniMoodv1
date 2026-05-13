import type { Request, Response, NextFunction } from 'express';
import { SESSION_COOKIE_NAME, verifySession, type SessionPayload } from '../auth';

export interface AuthedRequest extends Request {
  session?: SessionPayload;
}

export function requireSession(secret: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const token = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE_NAME];
    if (!token) {
      res.status(401).json({ error: 'unauthorized', detail: 'no session cookie' });
      return;
    }
    const payload = verifySession(token, secret);
    if (!payload) {
      res.status(401).json({ error: 'unauthorized', detail: 'invalid or expired session' });
      return;
    }
    req.session = payload;
    next();
  };
}
