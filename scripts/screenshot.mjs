#!/usr/bin/env node
/**
 * Visual verification tool. Headless Chromium opens a route on localhost,
 * saves a PNG into ./screenshots/, optionally captures the full scroll height.
 *
 * Usage:
 *   node scripts/screenshot.mjs <url> <output> [--viewport=WxH] [--full]
 *
 * Examples:
 *   node scripts/screenshot.mjs http://localhost:3002/ screenshots/web-home.png --viewport=1440x900 --full
 *   node scripts/screenshot.mjs http://localhost:3002/discover screenshots/web-discover.png
 *
 * Used by the visual-regression test in apps/web and by Claude during UI work.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const [, , url, output, ...flags] = argv;
  if (!url || !output) {
    console.error('usage: screenshot.mjs <url> <output> [--viewport=WxH] [--full] [--wait=ms]');
    process.exit(1);
  }
  const opts = { viewport: { width: 1440, height: 900 }, fullPage: false, waitMs: 1500 };
  for (const f of flags) {
    if (f === '--full') opts.fullPage = true;
    else if (f.startsWith('--viewport=')) {
      const [w, h] = f.slice('--viewport='.length).split('x').map(Number);
      if (!Number.isFinite(w) || !Number.isFinite(h)) {
        console.error(`invalid --viewport: ${f}`);
        process.exit(1);
      }
      opts.viewport = { width: w, height: h };
    } else if (f.startsWith('--wait=')) {
      opts.waitMs = Number(f.slice('--wait='.length));
    }
  }
  return { url, output, ...opts };
}

async function main() {
  const { url, output, viewport, fullPage, waitMs } = parseArgs(process.argv);
  mkdirSync(dirname(resolve(output)), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    console.log(`[screenshot] ${url} → ${output} (${viewport.width}x${viewport.height}, full=${fullPage})`);

    const consoleErrors = [];
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
    });

    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    if (!response) {
      console.error('[screenshot] no response');
      process.exit(1);
    }
    console.log(`[screenshot] status ${response.status()}`);

    // Wait for fonts and images to settle
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(waitMs);

    await page.screenshot({ path: resolve(output), fullPage });
    console.log(`[screenshot] saved ${output}`);

    if (consoleErrors.length > 0) {
      console.error(`[screenshot] WARN: ${consoleErrors.length} console errors:`);
      for (const e of consoleErrors) console.error(`  - ${e}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[screenshot] failed:', err);
  process.exit(1);
});
