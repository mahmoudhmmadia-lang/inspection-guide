import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadDocument } from './latex-parse.mjs';
import { buildHtml, ROOT, STORE } from './build-html.mjs';

const pages = buildHtml();
const doc = loadDocument(ROOT, { lang: 'ar' });
const read = (name) => fs.readFileSync(path.join(ROOT, 'site/ar', name), 'utf8');

test('only the practical chapter and home page are built in Arabic', () => {
  assert.deepEqual(Object.keys(pages).sort(), ['c1.html', 'index.html']);
  for (const name of Object.keys(pages)) {
    const html = read(name);
    assert.match(html, /<html lang="ar" dir="rtl"/);
    assert.doesNotMatch(html, /\.\.\/en\//);
    assert.ok(html.includes(STORE), `${name}: progress store`);
  }
});

test('every local link and fragment resolves', () => {
  for (const name of Object.keys(pages)) {
    for (const match of read(name).matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = match[1].replaceAll('&amp;', '&');
      if (/^(https?:|data:|mailto:)/.test(href)) continue;
      const [url, fragment] = href.split('#');
      const dest = url ? path.resolve(ROOT, 'site/ar', url.split('?')[0]) : path.resolve(ROOT, 'site/ar', name);
      assert.ok(fs.existsSync(dest), `${name}: missing ${href}`);
      if (fragment && dest.endsWith('.html')) assert.ok(fs.readFileSync(dest, 'utf8').includes(`id="${fragment}"`), `${name}: missing anchor ${href}`);
    }
    assert.ok(!read(name).includes('>??<'), `${name}: unresolved reference`);
  }
});

test('every figure has an explanation and every diagram renders', () => {
  const figures = doc.blocks.filter((b) => b.type === 'figure');
  assert.equal(figures.length, 14);
  for (const b of figures) assert.ok(b.note, `figure ${b.label} has no \\shotnote`);
  const diagrams = Object.keys(pages).reduce((n, name) => n + (read(name).match(/<svg class="diagram"/g) || []).length, 0);
  assert.equal(diagrams, doc.blocks.filter((b) => b.tikz).length);
});

test('each beginner step explains the action and includes a result or verification', () => {
  for (const name of ['c1.html']) {
    const steps = read(name).split(/<section class="step/).slice(1);
    assert.ok(steps.length >= 4, `${name}: steps`);
    for (const step of steps) {
      const explanation = step.indexOf('<p>');
      assert.ok(explanation > 0, `${name}: a step without explanation`);
      assert.match(step, /تحقق:|النتيجة:/);
      const figure = step.search(/<svg class="diagram"|<figure class="shot/);
      if (figure > 0) assert.ok(explanation < figure, `${name}: explanation after the first figure`);
    }
  }
});

test('every screenshot exists and carries a numbered key', () => {
  const shots = doc.blocks.filter((b) => b.type === 'figure' && b.image);
  assert.equal(shots.length, 14);
  const organizationScreens = new Set(['entity-fields.png','forms-list.png','form-records.png','journey-map.png','form-builder.png','form-assign.png','plans-list.png','journey-check.png','org-question-settings.png','org-question-rules.png','org-required-condition.png','org-record-source.png','org-record-fields.png','org-dashboard-create.png']);
  for (const b of shots) {
    assert.ok(fs.existsSync(path.join(ROOT, b.image)), b.image);
    assert.ok(organizationScreens.has(path.basename(b.image)), `${b.image}: not an inspected organization screenshot`);
    assert.ok(b.noteKeys?.length, `${b.image}: no numbered key`);
  }
});

test('organization walkthrough keeps exact names, numbered screenshots and execution steps', () => {
  const html = read('c1.html').split('<main')[1].split('</main>')[0];
  for (const name of ['دائرة حماية المستهلك', 'أحمد سالم — تجريبي', 'نور حسن — تجريبي', 'ريم خالد — تجريبي', 'فرن الأمانة', 'كشف منشأة تجارية لطلب سجل تجاري', 'POS-CP-INSPECTOR-01']) assert.ok(html.includes(name), name);
  assert.doesNotMatch(html, /الواحة|WAHA|خالد العلي|ليلى منصور|رنا يوسف|فرن السنابل|1060|36600/);
  assert.equal((html.match(/<figure class="shot/g) || []).length, 14);
  assert.ok(html.includes('ما معنى سؤال سجل؟'));
  assert.ok(html.includes('لنفترض أن لدينا مؤسسة'));
  for (const topic of ['أنشئ لوحة مؤشرات المنشآت التجارية', 'اربط مؤشر العدد بالمنشآت', 'أضف توزيع المنشآت وجدول التفاصيل', 'أضف التصفية بالمحافظة والنشاط واربطها بالعناصر', 'أضف البحث عن منشأة واربط الاختيار باللوحة', 'انشر اللوحة وجرّب البحث بحساب رئيس الفريق', 'استخدام في المرشح']) assert.ok(html.includes(topic), topic);
  assert.doesNotMatch(html, /من منظمتك:|هذه المراجعة|assets\/screens\/(b-|i-)/);
});
