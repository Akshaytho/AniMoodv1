#!/usr/bin/env node
/**
 * End-to-end user-flow walk through the AniMood homepage at localhost:3002.
 *
 * Simulates a real user clicking every interactive element and records:
 *  - HTTP status of each destination
 *  - Console errors
 *  - Screenshot of each state
 *  - Whether interactive states (hover, focus, mobile) actually work
 *
 * Output: screenshots/flow/<step>.png + a JSON report at screenshots/flow/report.json
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3002';
const OUT = resolve('screenshots', 'flow');
mkdirSync(OUT, { recursive: true });

const report = { base: BASE, startedAt: new Date().toISOString(), steps: [] };

function record(step, data) {
  console.log(`[${step}]`, JSON.stringify(data));
  report.steps.push({ step, ...data });
}

async function snap(page, name) {
  const file = resolve(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push({ kind: 'pageerror', msg: e.message }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ kind: 'console', msg: msg.text() });
  });

  // ============ STEP 1: page load ============
  const resp = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  record('home.load', {
    url: BASE,
    status: resp?.status() ?? null,
    file: await snap(page, '01-home-load'),
    consoleErrorsSoFar: consoleErrors.length,
  });

  // ============ STEP 2: hover the first poster card ============
  const posters = await page.locator('a[href^="/anime/"]').elementHandles();
  if (posters.length > 0) {
    await posters[0].hover();
    await page.waitForTimeout(400);
    record('home.poster-hover', {
      file: await snap(page, '02-poster-hover'),
      posterCount: posters.length,
    });
  } else {
    record('home.poster-hover', { error: 'no poster links found' });
  }

  // ============ STEP 3: click first poster — expect 404 since /anime/[slug] not built ============
  if (posters.length > 0) {
    const href = await posters[0].getAttribute('href');
    const r = await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    await page.waitForTimeout(800);
    record('poster.click', {
      url: `${BASE}${href}`,
      status: r?.status() ?? null,
      file: await snap(page, '03-anime-page'),
    });
    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }

  // ============ STEP 4: click "Discover Now" CTA ============
  const discoverBtn = page.getByRole('link', { name: /Discover Now/i });
  if (await discoverBtn.count()) {
    const r = await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      discoverBtn.first().click(),
    ]);
    void r;
    await page.waitForTimeout(800);
    record('cta.discover-now', {
      url: page.url(),
      // Next dev returns 200 for in-route 404s; the 404 page itself
      // contains identifiable text.
      content404: await page.locator('text=/404|This page could not be found/i').count() > 0,
      file: await snap(page, '04-discover'),
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  // ============ STEP 5: click a mood pill in sidebar ============
  const moodLonely = page.locator('aside a', { hasText: 'Lonely' }).first();
  if (await moodLonely.count()) {
    await moodLonely.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    record('mood-pill.click', {
      url: page.url(),
      content404: await page.locator('text=/404|This page could not be found/i').count() > 0,
      file: await snap(page, '05-mood-lonely'),
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  // ============ STEP 6: click a nav item ============
  const navMap = page.locator('aside a', { hasText: 'Emotional Map' }).first();
  if (await navMap.count()) {
    await navMap.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    record('nav.emotional-map', {
      url: page.url(),
      content404: await page.locator('text=/404|This page could not be found/i').count() > 0,
      file: await snap(page, '06-emotional-map'),
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  // ============ STEP 7: type in the search bar ============
  const search = page.locator('input[type="search"]');
  if (await search.count()) {
    await search.fill('vinland');
    await page.waitForTimeout(300);
    await snap(page, '07-search-typed');
    // Try submitting via Enter — does anything happen?
    await search.press('Enter');
    await page.waitForTimeout(800);
    record('search.type+enter', {
      typedValue: 'vinland',
      urlAfterEnter: page.url(),
      content404: await page.locator('text=/404|This page could not be found/i').count() > 0,
      file: await snap(page, '08-search-after-enter'),
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  // ============ STEP 8: click "Start Quiz" in mascot card ============
  const startQuiz = page.getByRole('link', { name: /Start Quiz/i });
  if (await startQuiz.count()) {
    await startQuiz.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    record('mascot.start-quiz', {
      url: page.url(),
      content404: await page.locator('text=/404|This page could not be found/i').count() > 0,
      file: await snap(page, '09-quiz'),
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
  }

  // ============ STEP 9: bell icon — intentionally disabled in commit 12 ============
  const bell = page.getByRole('button', { name: /Notifications/i });
  if (await bell.count()) {
    record('topbar.bell', {
      ariaDisabled: await bell.getAttribute('aria-disabled'),
      title: await bell.getAttribute('title'),
      file: await snap(page, '10-bell-state'),
    });
  }

  // ============ STEP 10: hover the user avatar in topbar ============
  const userArea = page.locator('header').getByText('Harish');
  if (await userArea.count()) {
    await userArea.hover();
    await page.waitForTimeout(300);
    record('topbar.user-hover', {
      file: await snap(page, '11-user-hover'),
    });
  }

  // ============ STEP 11: keyboard navigation ============
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return { tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 80) };
  });
  record('keyboard.tab-3-times', {
    focused,
    file: await snap(page, '12-keyboard-focus'),
  });

  // ============ STEP 12: mobile viewport ============
  await ctx.close();
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const mpage = await mctx.newPage();
  mpage.on('pageerror', (e) => consoleErrors.push({ kind: 'pageerror.mobile', msg: e.message }));
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.evaluate(() => document.fonts.ready);
  await mpage.waitForTimeout(2000);
  const mfile = resolve(OUT, '13-mobile.png');
  await mpage.screenshot({ path: mfile, fullPage: true });
  record('mobile.load', { viewport: '390x844', file: mfile });

  // ============ STEP 13: force-graph node click (back on desktop) ============
  await mctx.close();
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const dpage = await dctx.newPage();
  dpage.on('pageerror', (e) => consoleErrors.push({ kind: 'pageerror.graph', msg: e.message }));
  await dpage.goto(BASE, { waitUntil: 'networkidle' });
  await dpage.waitForTimeout(4000);
  // Scroll graph into view
  await dpage.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find((h) =>
      /Emotional Universe/i.test(h.textContent ?? ''),
    );
    h2?.scrollIntoView({ block: 'center' });
  });
  await dpage.waitForTimeout(800);
  // Click roughly center of the graph canvas (where Loneliness usually settles)
  const canvas = dpage.locator('canvas').first();
  if (await canvas.count()) {
    const box = await canvas.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await dpage.mouse.move(cx, cy);
      await dpage.waitForTimeout(300);
      await dpage.mouse.click(cx, cy);
      await dpage.waitForTimeout(800);
      record('graph.click-center', {
        clickedAt: { x: cx, y: cy },
        url: dpage.url(),
        content404: (await dpage.locator('text=/404|This page could not be found/i').count()) > 0,
        file: resolve(OUT, '14-graph-click.png'),
      });
      await dpage.screenshot({ path: resolve(OUT, '14-graph-click.png'), fullPage: false });
    }
  }

  await dctx.close();
  await browser.close();

  report.consoleErrors = consoleErrors;
  report.finishedAt = new Date().toISOString();
  writeFileSync(resolve(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('\n[userflow] done. Report:', resolve(OUT, 'report.json'));
  console.log('[userflow] total steps:', report.steps.length);
  console.log('[userflow] total console errors:', consoleErrors.length);
}

main().catch((err) => {
  console.error('[userflow] failed:', err);
  process.exit(1);
});
