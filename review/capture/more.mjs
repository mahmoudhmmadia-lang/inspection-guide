import { createRequire } from 'node:module';
import fs from 'node:fs';
import { mark } from './lib.mjs';
const require = createRequire(new URL('../../tools/package.json', import.meta.url));
const browser = await require('playwright-core').chromium.connectOverCDP('http://127.0.0.1:9388');
const page = browser.contexts()[0].pages()[0];
page.setDefaultTimeout(10000);
const dir = new URL('../../assets/screens/', import.meta.url);
const report = new URL('./new-shots.json', import.meta.url);
async function shot(name, marks) {
  await page.evaluate(() => document.querySelectorAll('.guide-mark,.guide-mask').forEach(e => e.remove()));
  const placed = await mark(page, marks);
  if (placed.missing.length) throw Error(JSON.stringify(placed.missing));
  await page.screenshot({ path: new URL(name + '.png', dir).pathname.replace(/^\/(\w:)/, '$1') });
  const entries = JSON.parse(fs.readFileSync(report, 'utf8')).filter(e => e.name !== name);
  entries.push({ name, url: page.url().split('?')[0], marks: placed.marks, capturedAt: new Date().toISOString() });
  fs.writeFileSync(report, JSON.stringify(entries, null, 2));
  console.log('CAPTURED', name);
}
try {
  if (process.argv[2] === 'source') {
    await page.getByRole('button', { name: 'من نوع سجل', exact: true }).click();
    await page.getByPlaceholder('ابحث في أنواع السجلات').fill('المنشآت التجارية');
    await page.getByText('المنشآت التجارية', { exact: true }).first().click();
    await shot('org-record-source', [{ sel: '[placeholder="ابحث في أنواع السجلات"]' }, { t: '^استخدام سؤال', exact: true, max: 100 }, { t: '^سؤال سجل جديد$', exact: true }, { t: '^بلا سؤال سجل$', exact: true }, { t: '^التالي: الحقول$', exact: true }]);
    await page.getByRole('button', { name: 'إلغاء', exact: true }).click();
  } else if (process.argv[2] === 'dashboard-dialog-shot') {
    await page.locator('[role=dialog] input').fill('مؤشرات المنشآت التجارية');
    await page.locator('[role=dialog] textarea').fill('متابعة المنشآت حسب المحافظة والنشاط والبحث عن منشأة');
    await shot('org-dashboard-create', [{ sel: '[role=dialog] input' }, { sel: '[role=dialog] textarea' }, { t: '^إنشاء$', exact: true }]);
  } else if (process.argv[2] === 'dashboard-dialog') {
    await page.getByRole('button', { name: 'إنشاء لوحة معلومات', exact: true }).click();
    console.log((await page.locator('body').innerText()).slice(0,5000));
    console.log(await page.locator('[role=dialog] input,[role=dialog] textarea').evaluateAll(es => es.map(e=>({tag:e.tagName,placeholder:e.getAttribute('placeholder')}))));
  } else if (process.argv[2] === 'dashboards') {
    await page.keyboard.press('Escape');
    await page.goto('https://ministryofeconomyandindustry.kayanos.app/dashboards', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForTimeout(15000);
    console.log((await page.locator('body').innerText()).slice(0,10000));
  } else {
    console.log((await page.locator('body').innerText()).slice(0,10000));
  }
} finally { await browser.close(); }
