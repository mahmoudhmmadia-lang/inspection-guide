import { createRequire } from 'node:module';
const require = createRequire('D:/stuff/right-code/taskflow/.temp/inspection-guide/tools/package.json');
const { chromium } = require('playwright-core');
const SP = 'C:/Users/MAHMOU~1/AppData/Local/Temp/claude/d--stuff-right-code-taskflow/c108761f-7f91-4a48-a1f5-de6a515fd391/scratchpad';
const ctx = await chromium.launchPersistentContext(SP + '/kayan/t2profile', { channel: 'msedge', headless: true, viewport: { width: 1440, height: 900 }, locale: 'ar', deviceScaleFactor: 2, colorScheme: 'light', args: ['--remote-debugging-port=9377'] });
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto('https://test2.kayanos.app/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => /login/.test(location.href) || document.body.innerText.includes('Ctrl+K'), null, { timeout: 90000 });
await page.waitForTimeout(1500);
if (/login/.test(page.url())) {
  await page.locator('input[type=email]').first().fill(process.env.T2_EMAIL);
  await page.locator('input[type=password]').first().fill(process.env.T2_PASS);
  await page.keyboard.press('Enter');
  await page.waitForURL((u) => !/login/.test(u.href), { timeout: 60000 });
}
console.log('READY', page.url());
await new Promise(() => {});
