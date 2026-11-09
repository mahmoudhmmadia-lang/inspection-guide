import fs from 'node:fs';
import { open, go, mark, mask, SP } from './lib.mjs';
const OUT = process.env.OUT || 'D:/stuff/right-code/taskflow/.temp/inspection-guide/assets/screens';
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const PRIVATE = ['mahmoudHmmadia', 'Ministry of Economy', 'وزارة الاقتصاد', 'mmasri', 'rightcode.io', '(QA)'];
const rail = { access: 220, journey: 282, records: 345, assign: 405, work: 468 };
const form = '/forms/view/001';
const fieldsTab = async (p) => { await p.getByText('الحقول', { exact: true }).first().click(); await p.waitForTimeout(2500); };

const SHOTS = [
  { name: 'app-home', url: '/apps/consumer_protection', do: async (p) => { await p.getByText('المنشآت التجارية', { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(800); }, marks: [{ t: '^المنشآت التجارية$', exact: true }, { t: '^كيان الشكاوى$', exact: true }, { t: '^كشف منشأة تجارية لطلب سجل تجاري$', exact: true }, { t: '^إرسالاتي$' }] },
  { name: 'entity-fields', url: '/entities/commercial_establishments/edit', wait: 8000, do: fieldsTab, marks: [{ t: '^الحقول' }, { t: '^إضافة حقل$' }, { t: '^حالة التوثيق$', exact: true }, { t: '^المراجعة والنشر$' }] },
  { name: 'entity-capabilities', url: '/entities/consumer_complaints/edit', wait: 8000, marks: [{ t: '^إضافة قدرة$' }, { t: '^حفظ السجلات$', exact: true, nth: 1 }, { t: '^السرية$', exact: true }, { t: '^التواريخ الهجرية$', exact: true }] },
  { name: 'entity-currency', url: '/entities/consumer_complaints/edit', wait: 8000, do: async (p) => { await fieldsTab(p); await p.getByText('السعر المدفوع', { exact: true }).first().click(); await p.waitForTimeout(2500); }, marks: [{ t: '^السعر المدفوع$', exact: true }, { t: '^تنسيق الرقم$', exact: true }, { t: '^العملة$', exact: true }] },
  { name: 'form-builder', url: form, wait: 11000, marks: [{ box: [1364, 138, 72, 362] }, { t: '^اختبار النموذج$' }, { t: '^نشر$' }, { t: '^المتغيرات$', exact: true }] },
  { name: 'form-records', url: form, wait: 11000, click: rail.records, marks: [{ t: '^سؤال سجل$', exact: true }, { t: 'يُكتب عند الاعتماد', exact: true }] },
  { name: 'form-assign', url: form, wait: 11000, click: rail.assign, marks: [{ t: '^يمكن التكليف به$', exact: true }, { t: '^خطط هذا النموذج', exact: true }, { t: '^السماح بالاعتذار$', exact: true }] },
  { name: 'journey-map', url: form, wait: 11000, click: rail.journey, marks: [{ t: '^البداية$', exact: true }, { box: [841, 404, 158, 58] }, { box: [1143, 392, 233, 70] }, { box: [841, 535, 158, 46] }, { t: '^انتقال$' }] },
  { name: 'journey-check', url: form, wait: 11000, click: rail.journey, clip: { x: 0, y: 345, width: 432, height: 320 }, marks: [{ t: 'لم يُختر أحد للتوقيع', exact: true, max: 90 }, { t: 'نقل إلى مقبول.*دون انتظارها', exact: true, max: 90 }, { t: 'لا حالة تقود إلى المرحلة', exact: true, max: 90 }] },
  { name: 'tools-automation', url: '/apps/builder', do: async (p) => { await p.getByText('الإجراءات الداخلية', { exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(800); }, marks: [{ t: '^إجراءات التشغيل القياسية$', exact: true }, { t: '^الإجراءات الداخلية$', exact: true }, { t: '^النماذج$', exact: true, nth: 0 }] },
  { name: 'sop-home', url: '/sop', wait: 22000, marks: [{ t: '^إجراءات التشغيل القياسية$', exact: true }, { box: [224, 187, 488, 212] }, { box: [205, 78, 310, 32] }] },
  { name: 'internal-sop', url: '/internal-sop', marks: [{ t: '^إجراء جديد$' }, { t: '^عمليات التشغيل$' }, { t: '^المتغيرات$' }] },
  { name: 'procedures', url: '/procedures', marks: [{ t: '^استيراد دليل PDF$' }, { t: '^بطاقة جديدة$' }] },
  { name: 'forms-list', url: '/forms', marks: [{ t: '^حزمة نماذج جديدة$' }, { t: '^إنشاء نموذج$' }, { t: '^كشف منشأة تجارية لطلب سجل تجاري$', exact: true }] },
  { name: 'package-new', url: '/forms', do: async (p) => { await p.getByRole('button', { name: 'حزمة نماذج جديدة' }).click(); await p.waitForTimeout(1500); }, marks: [{ sel: '[role=dialog] input' }, { t: '^عن سجلات$', exact: true }] },
  { name: 'plans-list', url: '/assignment-plans', marks: [{ t: '^خطة جديدة$' }, { t: '^مسودة$', nth: 0 }] },
  { name: 'services', url: '/services', marks: [{ t: '^خدمة جديدة$' }, { t: '^نماذج داخلية$', exact: true }] },
  { name: 'messages-months', url: '/settings/messages?tab=channels', wait: 8000, do: async (p) => { const t = p.getByText('أسماء الأشهر في التواريخ', { exact: true }); console.log('months found', await t.count(), p.url()); if (await t.count()) { await t.first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(600); } }, marks: [{ t: '^أسماء الأشهر في التواريخ$', exact: true }, { t: 'بلاد الشام', exact: true }, { t: '^ساعات الهدوء$', exact: true }] },
  { name: 'languages', url: '/settings/languages', marks: [{ t: '^ar$', exact: true }, { t: '^غير نشط$', exact: true }] },
  { env: 't2', name: 'package-editor', url: '/forms/packages/v2t2x9nr79zmwi_2nqyvl', wait: 8000, do: async (p) => { await p.evaluate(() => { const leaf = [...document.querySelectorAll('b,strong,span,p,div')].filter((e) => /(QA)/.test(e.textContent) && e.textContent.length < 60); leaf.sort((a, b) => a.textContent.length - b.textContent.length); if (leaf[0]) leaf[0].setAttribute('data-private', '1'); }); await mask(p, { sels: ['[data-private]'] }); }, marks: [{ t: '^بالترتيب$' }, { t: '^إضافة وحدة$' }, { t: '^شرطية$', exact: true }, { t: '^تُفتح$', exact: true }, { t: '^عند رفضها$', exact: true }, { t: '^سجل الجولة$' }, { t: '^التكليف \\(3\\)$' }, { t: '^نشر$' }] },
];

const report = [];
for (const env of ['org', 't2']) {
  const list = SHOTS.filter((s) => (s.env || 'org') === env && (!only.length || only.includes(s.name)));
  if (!list.length) continue;
  const { ctx, page, blocked, base } = await open(env, { scale: 2 });
  for (const s of list) {
    try {
      await go(page, base + s.url, s.wait ?? 6000);
      if (s.click) { await page.mouse.click(1400, s.click); await page.waitForTimeout(4500); }
      if (s.do) await s.do(page);
      const masked = await mask(page, { texts: PRIVATE });
      const placed = await mark(page, s.marks || []);
      await page.screenshot({ path: `${OUT}/${s.name}.png`, clip: s.clip });
      report.push({ name: s.name, env, masked, placed: placed.marks.length, missing: placed.missing });
      console.log(s.name, 'masked', masked, 'marks', placed.marks.length, placed.missing.length ? 'MISSING ' + JSON.stringify(placed.missing) : '');
    } catch (e) { console.log('FAIL', s.name, e.message.slice(0, 160)); report.push({ name: s.name, env, error: e.message.slice(0, 160) }); }
  }
  console.log(env, 'BLOCKED', JSON.stringify([...blocked]));
  await ctx.close();
}
fs.writeFileSync(`${SP}/kayan/capture-report.json`, JSON.stringify(report, null, 1));
