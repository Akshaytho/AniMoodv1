import { Router, type Response } from 'express';
import { z } from 'zod';
import type { DbClient } from '@animood/db';
import { listDrafts, getDraft, approveDraft, rejectDraft } from '../services/drafts';
import { requireSession, type AuthedRequest } from '../middleware/auth';

const STATUSES = ['pending_review', 'review_passed', 'review_flagged', 'approved', 'rejected'] as const;
const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export function draftsRouter(db: DbClient, sessionSecret: string): Router {
  const router = Router();
  router.use(requireSession(sessionSecret));

  router.get('/drafts', async (req: AuthedRequest, res: Response) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'bad_query', issues: parsed.error.issues });
      return;
    }
    const rows = await listDrafts(db, parsed.data);
    res.json({ items: rows, limit: parsed.data.limit, offset: parsed.data.offset });
  });

  router.get('/drafts/:id', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const draft = await getDraft(db, idParse.data);
    if (!draft) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json(draft);
  });

  router.post('/drafts/:id/approve', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const result = await approveDraft(db, idParse.data);
    if (!result.published) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, id: idParse.data, publishedSlug: result.slug });
  });

  router.post('/drafts/:id/reject', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const result = await rejectDraft(db, idParse.data);
    if (!result.updated) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, id: idParse.data, status: 'rejected' });
  });

  return router;
}
