import { Router, type Response } from 'express';
import { z } from 'zod';
import type { DbClient } from '@animood/db';
import {
  listMappings,
  getMappingDetail,
  approveMapping,
  rejectMapping,
  updateMapping,
  mappingsStats,
  type MappingStatus,
} from '../services/mappings';
import { requireSession, type AuthedRequest } from '../middleware/auth';

const STATUSES: readonly MappingStatus[] = [
  'proposed',
  'evidence_collected',
  'human_reviewed',
  'published',
  'contested',
  'retired',
];

const listQuerySchema = z.object({
  status: z.enum(STATUSES as unknown as [MappingStatus, ...MappingStatus[]]).optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const updateBodySchema = z.object({
  intensity: z.number().int().min(1).max(5).optional(),
  evidenceNotes: z.string().min(1).max(800).optional(),
  confidence: z.enum(['low', 'medium', 'high', 'verified']).optional(),
});

export function mappingsRouter(db: DbClient, sessionSecret: string): Router {
  const router = Router();
  router.use(requireSession(sessionSecret));

  router.get('/mappings/stats', async (_req, res) => {
    const stats = await mappingsStats(db);
    res.json({ stats });
  });

  router.get('/mappings', async (req: AuthedRequest, res: Response) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'bad_query', issues: parsed.error.issues });
      return;
    }
    const result = await listMappings(db, parsed.data);
    res.json({
      total: result.total,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      items: result.rows,
    });
  });

  router.get('/mappings/:id', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const detail = await getMappingDetail(db, idParse.data);
    if (!detail) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json(detail);
  });

  router.post('/mappings/:id/approve', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const result = await approveMapping(db, idParse.data, req.session!.email);
    if (!result.updated) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, id: idParse.data, status: 'human_reviewed' });
  });

  router.post('/mappings/:id/reject', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const result = await rejectMapping(db, idParse.data, req.session!.email);
    if (!result.updated) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, id: idParse.data, status: 'retired' });
  });

  router.patch('/mappings/:id', async (req: AuthedRequest, res: Response) => {
    const idParse = z.coerce.number().int().positive().safeParse(req.params['id']);
    if (!idParse.success) {
      res.status(400).json({ error: 'bad_id' });
      return;
    }
    const body = updateBodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: 'bad_body', issues: body.error.issues });
      return;
    }
    const result = await updateMapping(db, idParse.data, body.data, req.session!.email);
    if (!result.updated) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, id: idParse.data });
  });

  return router;
}
