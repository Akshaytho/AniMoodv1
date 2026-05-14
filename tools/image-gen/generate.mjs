#!/usr/bin/env node
/**
 * Generate AniMood atmospheric art via OpenAI gpt-image-1.
 *
 * This tool is intentionally separate from the main monorepo source — it
 * runs standalone with its own dependency on `openai`, so the apps/ and
 * packages/ surfaces don't pick up tool-only deps.
 *
 * Usage:
 *   OPENAI_API_KEY=... node tools/image-gen/generate.mjs \
 *     --out apps/web/public/generated/hero.png \
 *     --size 1536x1024 --quality high \
 *     --prompt "..."
 */
import OpenAI from 'openai';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = { size: '1024x1024', quality: 'medium', n: 1, model: 'gpt-image-1' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prompt') args.prompt = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--size') args.size = argv[++i];
    else if (a === '--quality') args.quality = argv[++i];
    else if (a === '--model') args.model = argv[++i];
  }
  if (!args.prompt || !args.out) {
    console.error('usage: --prompt "..." --out path.png [--size 1536x1024] [--quality low|medium|high]');
    process.exit(1);
  }
  return args;
}

async function main() {
  const { prompt, out, size, quality, model } = parseArgs(process.argv);
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set');
    process.exit(1);
  }
  const client = new OpenAI();
  console.log(`[gen] model=${model} size=${size} quality=${quality}`);
  console.log(`[gen] prompt: ${prompt.slice(0, 140)}${prompt.length > 140 ? '…' : ''}`);

  const res = await client.images.generate({ model, prompt, size, quality, n: 1 });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) {
    console.error('[gen] no image returned:', JSON.stringify(res, null, 2).slice(0, 400));
    process.exit(1);
  }
  const buf = Buffer.from(b64, 'base64');
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(resolve(out), buf);
  console.log(`[gen] wrote ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
  if (res.usage) console.log(`[gen] usage:`, res.usage);
}

main().catch((err) => {
  console.error('[gen] failed:', err?.message ?? err);
  process.exit(1);
});
