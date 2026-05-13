import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createDbClient } from '@animood/db';
import { createApp } from '../app';

const DATABASE_URL = process.env['DATABASE_URL'];

describe.skipIf(!DATABASE_URL)('GET /health', () => {
  let client: ReturnType<typeof createDbClient>;

  beforeAll(() => {
    client = createDbClient({ connectionString: DATABASE_URL! });
  });

  afterAll(async () => {
    await client.close();
  });

  it('returns ok with db+budget when DB reachable', async () => {
    const app = createApp({
      db: client.db,
      sql: client.sql,
      auth: {
        adminEmail: 'a@b.c',
        adminPasswordHash: 'scrypt:' + 'a'.repeat(32) + ':' + 'b'.repeat(128),
        sessionSecret: 'x'.repeat(64),
        cookieSecure: false,
      },
    });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('reachable');
    expect(res.body.budget).toMatchObject({ cap: 500000 });
  });
});

describe('POST /auth/login', () => {
  it('rejects bad credentials with 401', async () => {
    const fakeSql = ((..._args: unknown[]) => Promise.resolve([])) as never;
    const app = createApp({
      db: {} as never,
      sql: fakeSql,
      auth: {
        adminEmail: 'admin@animood.app',
        adminPasswordHash:
          'scrypt:00000000000000000000000000000000:' +
          '00'.repeat(64),
        sessionSecret: 'x'.repeat(64),
        cookieSecure: false,
      },
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@animood.app', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  it('rejects malformed body with 400', async () => {
    const fakeSql = ((..._args: unknown[]) => Promise.resolve([])) as never;
    const app = createApp({
      db: {} as never,
      sql: fakeSql,
      auth: {
        adminEmail: 'a@b.c',
        adminPasswordHash: 'scrypt:' + 'a'.repeat(32) + ':' + 'b'.repeat(128),
        sessionSecret: 'x'.repeat(64),
        cookieSecure: false,
      },
    });
    const res = await request(app).post('/auth/login').send({ email: 'not-email' });
    expect(res.status).toBe(400);
  });
});
