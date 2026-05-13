import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { eq } from 'drizzle-orm';
import { createDbClient, titles, mappings, emotions } from '@animood/db';
import { createApp } from '../app';
import { signSession, SESSION_COOKIE_NAME } from '../auth';

const DATABASE_URL = process.env['DATABASE_URL'];

describe.skipIf(!DATABASE_URL)('mappings router', () => {
  let client: ReturnType<typeof createDbClient>;
  let app: ReturnType<typeof createApp>;
  let cookie: string;
  let titleId: number;
  let emotionId: number;
  let mappingId: number;

  beforeAll(async () => {
    client = createDbClient({ connectionString: DATABASE_URL! });
    const sessionSecret = 'x'.repeat(64);
    app = createApp({
      db: client.db,
      sql: client.sql,
      auth: {
        adminEmail: 'admin@animood.app',
        adminPasswordHash: 'scrypt:' + 'a'.repeat(32) + ':' + 'b'.repeat(128),
        sessionSecret,
        cookieSecure: false,
      },
    });
    const token = signSession({ email: 'admin@animood.app' }, sessionSecret);
    cookie = `${SESSION_COOKIE_NAME}=${token}`;
  });

  afterAll(async () => {
    if (titleId) {
      await client.db.delete(mappings).where(eq(mappings.sourceId, titleId));
      await client.db.delete(titles).where(eq(titles.id, titleId));
    }
    if (emotionId) {
      await client.db.delete(emotions).where(eq(emotions.id, emotionId));
    }
    await client.close();
  });

  beforeEach(async () => {
    // Fresh fixtures per test run (idempotent via slug ON CONFLICT)
    const [t] = await client.db
      .insert(titles)
      .values({
        slug: '_test_mapping_title',
        name: 'Test Title',
        type: 'anime',
        status: 'completed',
      })
      .onConflictDoUpdate({ target: titles.slug, set: { name: 'Test Title' } })
      .returning({ id: titles.id });
    titleId = t!.id;

    const [e] = await client.db
      .insert(emotions)
      .values({
        slug: '_test_mapping_emotion',
        name: 'TestEmotion',
        category: 'Core',
        definition: 'placeholder',
      })
      .onConflictDoUpdate({ target: emotions.slug, set: { name: 'TestEmotion' } })
      .returning({ id: emotions.id });
    emotionId = e!.id;

    // Delete any pre-existing test mappings to avoid duplicate rows
    await client.db.delete(mappings).where(eq(mappings.sourceId, titleId));

    const [m] = await client.db
      .insert(mappings)
      .values({
        type: 'title_emotion',
        sourceTable: 'titles',
        sourceId: titleId,
        targetTable: 'emotions',
        targetId: emotionId,
        intensity: 3,
        evidenceNotes: 'Test evidence — placeholder for unit test.',
        confidence: 'medium',
        status: 'evidence_collected',
      })
      .returning({ id: mappings.id });
    mappingId = m!.id;
  });

  it('GET /mappings rejects without session', async () => {
    const res = await request(app).get('/mappings');
    expect(res.status).toBe(401);
  });

  it('GET /mappings returns the test mapping with title joined', async () => {
    const res = await request(app).get('/mappings?status=evidence_collected').set('Cookie', cookie);
    expect(res.status).toBe(200);
    const item = res.body.items.find((i: { id: number }) => i.id === mappingId);
    expect(item).toBeDefined();
    expect(item.sourceName).toBe('Test Title');
  });

  it('GET /mappings/:id returns detail', async () => {
    const res = await request(app).get(`/mappings/${mappingId}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(mappingId);
    expect(res.body.signals).toEqual([]);
  });

  it('POST /mappings/:id/approve transitions to human_reviewed', async () => {
    const res = await request(app).post(`/mappings/${mappingId}/approve`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    const [row] = await client.db.select().from(mappings).where(eq(mappings.id, mappingId));
    expect(row?.status).toBe('human_reviewed');
    expect(row?.reviewedBy).toBe('admin@animood.app');
  });

  it('POST /mappings/:id/reject transitions to retired', async () => {
    const res = await request(app).post(`/mappings/${mappingId}/reject`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    const [row] = await client.db.select().from(mappings).where(eq(mappings.id, mappingId));
    expect(row?.status).toBe('retired');
  });

  it('PATCH /mappings/:id updates intensity', async () => {
    const res = await request(app)
      .patch(`/mappings/${mappingId}`)
      .set('Cookie', cookie)
      .send({ intensity: 5, confidence: 'high' });
    expect(res.status).toBe(200);
    const [row] = await client.db.select().from(mappings).where(eq(mappings.id, mappingId));
    expect(row?.intensity).toBe(5);
    expect(row?.confidence).toBe('high');
  });

  it('GET /mappings/stats returns count per status', async () => {
    const res = await request(app).get('/mappings/stats').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.stats).toBeTypeOf('object');
  });
});
