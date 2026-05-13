import { defineConfig } from 'drizzle-kit';

const url = process.env['DATABASE_URL'];

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: url ?? 'postgresql://placeholder',
  },
  strict: true,
  verbose: true,
});
