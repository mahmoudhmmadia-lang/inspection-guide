// Marked screenshots for the industrial dashboard section (test2, Waha data).
import { conn, load, pickAt, SP } from './c.mjs';
import { mark } from './lib.mjs';
const OUT = 'D:/stuff/right-code/taskflow/.temp/inspection-guide/assets/screens';
const DASH = '/dashboards/build/ah5epgpd2hub3iedbivyl';
const only = process.argv.slice(2);
const { b, page } = await conn();
await page.setViewportSize({ width: 1440, height: 900 });
const shot = async (name, marks, clip) => {
  const r = await mark(page, marks);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip });
  console.log(name, r.marks.length, r.missing.length ? 'MISSING ' + JSON.stringify(r.missing) : '');
};
const openWidget = async (title) => {
  const w = page.getByText(title, { exact: true }).first();
  await w.evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(800);
  const r = await w.boundingBox();
  await page.mouse.click(r.x + r.width / 2, r.y + 90); await page.waitForTimeout(2500);
  await page.getByText('البيانات', { exact: true }).first().click().catch(() => {}); await page.waitForTimeout(1200);
};
const S = {
  'i-records': async () => {
    await load(page, '/apps/hmayh_almsthlk_alwahh/records/industrial_facilities', 'المنشآت الصناعية'); await page.waitForTimeout(2500);
    await shot('i-records', [{ t: '^إضافة$' }, { t: '^القطاع$', exact: true }, { t: '^المحافظة$', exact: true, nth: 0 }, { t: '^عدد العمال$', exact: true }]);
  },
  'i-new': async () => {
    await load(page, '/dashboards', 'إنشاء لوحة معلومات'); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'إنشاء لوحة معلومات' }).first().click(); await page.waitForTimeout(1500);
    const d = page.locator('[role=dialog]').last();
    await d.locator('input[id="اسم لوحة المعلومات"]').fill('مؤشرات المنشآت الصناعية - الواحة');
    await d.locator('textarea').first().fill('أعداد المنشآت الصناعية وعمالها وطاقتها الإنتاجية حسب المحافظة والقطاع وحالة الترخيص');
    await shot('i-new', [{ sel: '[role=dialog] input' }, { sel: '[role=dialog] textarea' }, { t: '^إنشاء$', nth: 0 }]);
    await d.getByRole('button', { name: 'إلغاء' }).click(); await page.waitForTimeout(800);
  },
  'i-builder': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3500);
    await shot('i-builder', [{ sel: 'button[aria-label="مؤشر أداء"]' }, { sel: 'button[aria-label="إضافة رسم بياني (Nivo)"]' }, { sel: 'button[aria-label="جدول"]' }, { sel: 'button[aria-label="الإعدادات"]' }, { sel: 'button[aria-label="إدارة الوصول"]' }, { t: '^حفظ$' }, { t: '^نشر$' }]);
  },
  'i-kpi': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3500);
    await openWidget('إجمالي العمال');
    await shot('i-kpi', [{ t: '^البيانات$', exact: true }, { t: '^كيان$', exact: true, nth: 0 }, { t: '^المنشآت الصناعية$', exact: true, nth: 0 }, { t: '^المجموع$', exact: true, nth: 0 }, { t: '^عدد العمال$', exact: true, nth: 0 }]);
  },
  'i-bar': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3500);
    await openWidget('العمال حسب القطاع');
    await shot('i-bar', [{ t: '^أعمدة$', exact: true, nth: 0 }, { t: '^القطاع$', exact: true, nth: 0 }, { t: '^قيمة$', exact: true }, { t: '^عدد العمال$', exact: true, nth: 0 }, { t: '^المجموع$', exact: true, nth: 0 }]);
  },
  'i-wfilter': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3500);
    await openWidget('المنشآت الموقوفة');
    await page.getByText('تكوين مرشحات البيانات').first().click(); await page.waitForTimeout(1800);
    await shot('i-wfilter', [{ t: '^حالة الترخيص$', exact: true }, { t: '^يساوي$', exact: true }, { sel: '[data-radix-popper-content-wrapper] input' }]);
  },
  'i-settings': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'الإعدادات' }).first().click(); await page.waitForTimeout(2000);
    await shot('i-settings', [{ t: '^إظهار في التنقل$', exact: true }, { t: '^حماية المستهلك - الواحة$', exact: true }, { t: '^السجلات$', exact: true }, { t: '^بصلاحيات المشاهد$', exact: true }]);
    await page.getByRole('button', { name: 'إلغاء' }).last().click().catch(() => {}); await page.waitForTimeout(800);
  },
  'i-share': async () => {
    await load(page, DASH, 'القسم 1'); await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'إدارة الوصول' }).first().click(); await page.waitForTimeout(2500);
    console.log('share text', (await page.locator('[role=dialog]').last().innerText()).replace(/\n+/g, ' | ').slice(0, 300));
    await shot('i-share', [{ t: '^تحديد$', nth: 0 }, { t: '^Viewer$', exact: true, nth: 0 }, { t: 'POS-WAHA-LEAD', exact: true, max: 60 }]);
  },
  'i-view': async () => {
    await load(page, '/dashboards/view/ah5epgpd2hub3iedbivyl', 'عدد المنشآت الصناعية'); await page.waitForTimeout(6000);
    await page.evaluate(() => document.querySelector('main')?.scrollTo?.(0, 0));
    await shot('i-view', [{ t: '^v3$', exact: true }, { t: '^تصدير PDF$', exact: true }, { t: '^عدد المنشآت الصناعية$', exact: true }, { t: '^المنشآت حسب المحافظة$', exact: true }]);
  },
  'i-view2': async () => {
    await load(page, '/dashboards/view/ah5epgpd2hub3iedbivyl', 'عدد المنشآت الصناعية'); await page.waitForTimeout(6000);
    await page.getByText('العمال حسب القطاع', { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(2500);
    await shot('i-view2', [{ t: '^العمال حسب القطاع$', exact: true }, { t: '^المنشآت حسب حالة الترخيص$', exact: true }]);
  },
  'i-view3': async () => {
    await load(page, '/dashboards/view/ah5epgpd2hub3iedbivyl', 'عدد المنشآت الصناعية'); await page.waitForTimeout(6000);
    await page.getByText('سجل المنشآت الصناعية', { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(2500);
    await shot('i-view3', [{ t: '^سجل المنشآت الصناعية$', exact: true }, { t: '^حالة الترخيص$', exact: true }]);
  },
};
for (const [n, fn] of Object.entries(S)) {
  if (only.length && !only.includes(n)) continue;
  try { await fn(); } catch (e) { console.log('FAIL', n, e.message.split('\n')[0].slice(0, 160)); }
}
await b.close();
