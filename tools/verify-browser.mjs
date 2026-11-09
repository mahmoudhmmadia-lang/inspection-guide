import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
// Reuses the main guide's playwright-core install.
const { chromium } = await import(new URL('../../main/tools/node_modules/playwright-core/index.mjs', import.meta.url).href);
import { buildHtml, ROOT } from './build-html.mjs';
import { createServer } from './serve-html.mjs';

buildHtml();
const server = createServer();
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/ar`;
const out = path.join(ROOT, 'review/screenshots');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const evidence = [], errors = [];
try {
  for (const width of [1440, 390]) for (const theme of ['dark', 'light']) {
    const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    for (const file of ['index', 'c1']) {
      await page.goto(`${base}/${file}.html`);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file} ${width}: horizontal overflow`);
      if (file === 'index') {
        await page.screenshot({ path: path.join(out, `home-${width}-${theme}.png`) });
        evidence.push({ width, theme, file, passed: true });
        continue;
      }
      assert.ok((await page.locator('main').innerText()).includes('ما معنى سؤال سجل؟'));
      assert.equal(await page.locator('main figure.shot').count(), 14);
      for (const img of await page.locator('main figure.shot img').all()) { await img.scrollIntoViewIfNeeded(); assert.ok(await img.evaluate((e) => e.decode().then(() => e.naturalWidth > 0)), `${file}: broken screenshot`); }
      const done = page.locator('[data-done]').first();
      await done.click();
      assert.equal(await done.getAttribute('aria-pressed'), 'true');
      await page.reload();
      assert.equal(await page.locator('[data-done]').first().getAttribute('aria-pressed'), 'true');
      await page.locator('[data-done]').first().click();
      await page.locator('[data-open-search]').first().click();
      await page.locator('.palette input').fill('أي منشأة سنكشف عليها');
      await page.locator('.palette-list a').first().click();
      await page.waitForLoadState();
      assert.ok(page.url().includes('c1.html#'), `search opened ${page.url()}`);
      await page.goto(`${base}/${file}.html`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, `walkthrough-${width}-${theme}.png`) });
      for (const [n, d] of (await page.locator('main svg.diagram').all()).entries()) {
        await d.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        if (width === 390 || n < 2) await page.screenshot({ path: path.join(out, `${file}-diagram${n + 1}-${width}-${theme}.png`) });
      }
      evidence.push({ width, theme, file, passed: true });
    }
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(ROOT, 'review/browser-verification.json'), JSON.stringify({ checks: ['home and walkthrough at 1440 and 390, every screenshot decodes, dark and light', 'no horizontal overflow', 'fourteen organization screenshots', 'mark-as-done persists after reload', 'search opens the record-question step', 'no page errors'], evidence, errors }, null, 2));
  console.log('PASS', evidence.length, 'page cases');
} finally {
  await browser.close();
  server.close();
}
