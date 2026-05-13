import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from '../auth';
import type { AuthedRequest } from '../middleware/auth';
import { requireSession } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export interface AuthRouterDeps {
  adminEmail: string;
  adminPasswordHash: string;
  sessionSecret: string;
  cookieSecure: boolean;
}

export function authRouter(deps: AuthRouterDeps): Router {
  const router = Router();

  router.post('/auth/login', async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'bad_request', issues: parsed.error.issues });
      return;
    }
    const { email, password } = parsed.data;
    if (email.toLowerCase() !== deps.adminEmail.toLowerCase()) {
      res.status(401).json({ error: 'invalid_credentials' });
      return;
    }
    if (!verifyPassword(password, deps.adminPasswordHash)) {
      res.status(401).json({ error: 'invalid_credentials' });
      return;
    }
    const token = signSession({ email }, deps.sessionSecret);
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: deps.cookieSecure,
      sameSite: 'lax',
      maxAge: SESSION_TTL_SECONDS * 1000,
      path: '/',
    });
    res.json({ ok: true, email });
  });

  router.post('/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  router.get('/auth/me', requireSession(deps.sessionSecret), (req: AuthedRequest, res: Response) => {
    res.json({ email: req.session!.email, expiresAt: req.session!.expiresAt });
  });

  return router;
}
