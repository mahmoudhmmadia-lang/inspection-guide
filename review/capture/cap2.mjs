// Marked screenshots of the Waha build on test2, taken from the running session.
import { conn, load, SP } from './c.mjs';
import { mark, mask } from './lib.mjs';
const OUT = 'D:/stuff/right-code/taskflow/.temp/inspection-guide/assets/screens';
const only = process.argv.slice(2);
const { b, page } = await conn();
await page.setViewportSize({ width: 1440, height: 900 });
const shot = async (name, marks, opts = {}) => {
  if (opts.maskTexts) await mask(page, { texts: opts.maskTexts });
  const r = await mark(page, marks);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: opts.clip });
  console.log(name, r.marks.length, r.missing.length ? 'MISSING ' + JSON.stringify(r.missing) : '');
};
const S = {
  'b-node': async () => {
    await load(page, '/apps/hr/core/nodes/field_oversight_department_wahafld', 'يتبع ل');
    await shot('b-node', [{ t: '^الرمز$', exact: true }, { t: '^الاسم$', exact: true }, { t: '^النوع$', exact: true }, { t: '^يتبع ل$', exact: true }], { maskTexts: [] });
  },
  'b-position': async () => {
    await load(page, '/apps/hr/workforce/positions/senior_field_researcher_poswahares', 'الوحدة');
    await shot('b-position', [{ t: '^الوصف الوظيفي$', exact: true }, { t: '^الوحدة$', exact: true }, { t: '^المدير$', exact: true }]);
  },
  'b-member': async () => {
    await load(page, '/apps/hr/core/members/add', 'رقم الموظف');
    await shot('b-member', [{ t: '^رقم الموظف$', exact: true }, { t: '^الاسم$', exact: true }, { t: '^البريد الإلكتروني$', exact: true }, { t: '^نوع المقعد$', exact: true }, { t: '^إنشاء$' }]);
  },
  'b-assignment': async () => {
    await load(page, '/apps/hr/workforce/assignments/add', 'العضو');
    await shot('b-assignment', [{ t: '^العضو$', exact: true }, { t: '^المنصب$', exact: true }, { t: '^تاريخ البدء$', exact: true }, { t: '^الحالة$', exact: true }]);
  },
  'b-role': async () => {
    await load(page, '/settings/roles/organizations/waha_researcher', 'المسؤولين');
    await page.getByText('المسؤولين', { exact: true }).first().click(); await page.waitForTimeout(1500);
    await shot('b-role', [{ t: '^عنوان الدور$', exact: true }, { t: '^النطاق$', exact: true }, { t: '^المسؤولين$', exact: true }, { t: 'POS-WAHA-RES', exact: true, max: 40 }]);
  },
  'b-entity-fields': async () => {
    await load(page, '/entities/oasis_facilities/edit', 'الحقول');
    await page.getByText('الحقول', { exact: true }).first().click(); await page.waitForTimeout(2500);
    await page.getByText('حالة التوثيق', { exact: true }).first().click(); await page.waitForTimeout(2000);
    await shot('b-entity-fields', [{ t: '^حالة التوثيق$', exact: true }, { t: '^الاختيارات$', exact: true }, { t: '^المراجعة والنشر' }]);
  },
  'b-grants': async () => {
    await load(page, '/entities/oasis_facilities/edit?section=access', 'الصلاحيات');
    await page.locator('button[aria-label="قائمة لدور باحث الواحة"]').first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(800);
    await shot('b-grants', [{ t: '^باحث الواحة$', exact: true }, { sel: 'button[aria-label="قائمة لدور باحث الواحة"]' }, { sel: 'button[aria-label="فتح لدور باحث الواحة"]' }, { t: '^المراجعة والنشر' }]);
  },
  'b-form-writes': async () => {
    await load(page, '/entities/oasis_facilities/edit?section=access', 'الصلاحيات');
    await page.getByText('الحقول', { exact: true }).nth(1).click().catch(() => {}); await page.waitForTimeout(2000);
    await page.getByText('النماذج التي تكتب', { exact: false }).first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(800);
    await shot('b-form-writes', [{ t: '^كشف منشأة - الواحة$', exact: true }, { t: '^حالة التوثيق$', exact: true }, { t: '^مسموح$', exact: true }]);
  },
  'b-wizard': async () => {
    await load(page, '/forms/view/waha_inspection', 'اختبار النموذج'); await page.waitForTimeout(2500);
    await page.mouse.click(1376, 355); await page.waitForTimeout(2000);
    await page.getByText('من نوع سجل', { exact: true }).first().click(); await page.waitForTimeout(2000);
    const d = page.locator('[role=dialog]').last();
    await d.locator('input').first().fill('منشآت الواحة'); await page.waitForTimeout(1000);
    await d.getByText('منشآت الواحة', { exact: true }).first().click(); await page.waitForTimeout(1200);
    await d.getByRole('button', { name: /التالي/ }).first().click(); await page.waitForTimeout(2000);
    await shot('b-wizard', [{ t: '^حقل السجل$', exact: true }, { t: '^في النموذج$', exact: true }, { t: '^الربط$', exact: true }, { t: '^التعبئة المسبقة$', exact: true }]);
    await d.getByRole('button', { name: 'إغلاق' }).first().click().catch(async () => { await page.keyboard.press('Escape'); });
    await page.waitForTimeout(1000);
  },
  'b-default': async () => {
    await load(page, '/forms/view/waha_inspection', 'اختبار النموذج'); await page.waitForTimeout(2500);
    await page.getByText('حالة التوثيق', { exact: true }).last().scrollIntoViewIfNeeded(); await page.getByText('حالة التوثيق', { exact: true }).last().click(); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /فتح القاعدة: القيمة الافتر/ }).first().click(); await page.waitForTimeout(1800);
    await shot('b-default', [{ t: '^ثابتة$', exact: true }, { sel: 'input[placeholder="القيمة الافتراضية"]' }, { t: '^النتيجة', exact: true, max: 30 }]);
    await page.getByRole('button', { name: 'إلغاء' }).last().click().catch(() => {}); await page.waitForTimeout(800);
  },
  'b-journey': async () => {
    await load(page, '/forms/view/waha_inspection', 'اختبار النموذج'); await page.waitForTimeout(2500);
    await page.mouse.click(1376, 282); await page.waitForTimeout(3500);
    await page.mouse.click(1148, 268); await page.waitForTimeout(1500);
    await page.mouse.move(200, 500); await page.mouse.wheel(0, 760); await page.waitForTimeout(900);
    await shot('b-journey', [{ t: '^المعتمِد$', exact: true }, { t: '^اعتماد الكشف$', exact: true }, { t: '^رفض$', exact: true }, { t: '^إعادة للتصحيح$', exact: true }, { box: [1076, 247, 145, 40] }]);
  },
  'b-access': async () => {
    await load(page, '/forms/view/waha_inspection', 'اختبار النموذج'); await page.waitForTimeout(2500);
    await page.mouse.click(1376, 222); await page.waitForTimeout(2500);
    await shot('b-access', [{ t: '^إضافة أشخاص$' }, { t: '^الباحثون$', exact: true }, { t: '^مدققو الكشوف$', exact: true }, { t: '^رئيس فريق الكشف$', exact: true }]);
  },
  'b-plan': async () => {
    await load(page, '/assignment-plans/u8kpfb6mp0nvgt2urb266?tab=setup', 'المرشحون');
    await page.getByText('2 · المرشحون').first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(800);
    await page.getByText('2 · المرشحون').first().click(); await page.waitForTimeout(1500);
    const run = page.getByRole('button', { name: 'تشغيل المعاينة' }); if (await run.count()) { await run.first().click(); await page.waitForTimeout(3000); }
    await shot('b-plan', [{ t: '^قائمة ثابتة$', exact: true }, { t: 'POS-WAHA-RES', exact: true, max: 40 }, { t: '^ليلى منصور$', exact: true }]);
  },
  'b-record-after': async () => {
    await load(page, '/apps/hmayh_almsthlk_alwahh/records/oasis_facilities/frn_alsnabl', 'حالة التوثيق');
    await shot('b-record-after', [{ t: '^العنوان التفصيلي$', exact: true }, { t: '^حالة التوثيق$', exact: true }]);
  },
};
for (const [n, fn] of Object.entries(S)) {
  if (only.length && !only.includes(n)) continue;
  try { await fn(); } catch (e) { console.log('FAIL', n, e.message.split('\n')[0].slice(0, 150)); }
}
await b.close();
