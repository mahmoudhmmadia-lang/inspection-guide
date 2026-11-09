import { createRequire } from 'node:module';
const require = createRequire('D:/stuff/right-code/taskflow/.temp/inspection-guide/tools/package.json');
const { chromium } = require('playwright-core');
export const SP = 'C:/Users/MAHMOU~1/AppData/Local/Temp/claude/d--stuff-right-code-taskflow/c108761f-7f91-4a48-a1f5-de6a515fd391/scratchpad/kayan';
export const base = 'https://test2.kayanos.app';
export async function conn() {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9377');
  const page = b.contexts()[0].pages()[0];
  return { b, page };
}
export const text = async (p) => { const t = (await p.locator('body').innerText()).replace(/\n+/g, ' | '); const i = t.indexOf('Ctrl+K'); return i < 0 ? t : t.slice(i + 6); };
// Goes inside the running app, without a reload, so each step stays fast.
export async function nav(p, path, ready = 'Ctrl+K', ms = 90000) {
  await p.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate')); }, path);
  await p.waitForFunction((r) => document.body.innerText.includes(r), ready, { timeout: ms });
  await p.waitForTimeout(1800);
}

export async function clear(p) {
  const d = p.getByRole('button', { name: 'تجاهل التغييرات' });
  if (await d.count()) { await d.click(); await p.waitForTimeout(1200); }
}
export const go = async (p, path, ready) => { await clear(p); await nav(p, path, ready); await clear(p); };
export const txt = (p, id, v) => p.locator(`input[id="${id}"], textarea[id="${id}"]`).first().fill(v);
export const dd = async (p, label, choice) => {
  await p.locator(`[aria-label="${label}"]`).first().click();
  await p.waitForTimeout(900);
  const o = p.locator('[role=option], [role=menuitem]');
  const all = (await o.allInnerTexts()).map((s) => s.trim());
  if (choice === undefined) { await p.keyboard.press('Escape'); return all; }
  await o.filter({ hasText: choice }).first().click();
  await p.waitForTimeout(500);
  return all;
};
export const rel = async (p, label, q) => {
  await p.getByText(`اختر ${label}`, { exact: true }).first().click({ timeout: 8000 });
  await p.waitForTimeout(900);
  await p.keyboard.type(q, { delay: 20 });
  await p.locator('[role=option]').filter({ hasText: q }).first().waitFor({ timeout: 12000 });
  await p.locator('[role=option]').filter({ hasText: q }).first().click();
  await p.waitForTimeout(700);
};
export const submit = async (p, label = 'إنشاء') => {
  await p.getByRole('button', { name: label, exact: true }).first().click();
  await p.waitForTimeout(4500);
  return p.url();
};

// Full page load: warm loads take seconds, and no form state leaks between records.
export const load = async (p, path, ready = 'Ctrl+K', ms = 60000) => {
  await p.goto(base + path, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction((r) => document.body.innerText.includes(r), ready, { timeout: ms });
  await p.waitForTimeout(1800);
  const n = p.getByRole('button', { name: 'ليس الآن' }); if (await n.count()) { await n.first().click().catch(() => {}); await p.waitForTimeout(400); }
};
export const ids = (p) => p.evaluate(() => [...document.querySelectorAll('input,textarea,[aria-label]')].filter((e) => e.getBoundingClientRect().width > 30 && e.getBoundingClientRect().y > 75).map((e) => e.id || e.getAttribute('aria-label') || e.placeholder).filter((s) => s && !s.startsWith('_r_') && !s.startsWith('radix')));

// Entity creator: sets the type, title and key of one field in the side panel, then its choices.
export async function field(p, n, f) {
  if (n === 1) await p.getByRole('button', { name: 'حقل 1' }).first().click();
  else await p.getByText('اضافة حقل جديد').first().click({ timeout: 8000 });
  await p.waitForTimeout(700);
  const title = p.locator('input[id="عنوان الحقل"]');
  if (f.type !== 'نص') {
    await title.evaluate((e) => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(350);
    const box = await title.boundingBox();
    await p.mouse.click(box.x + box.width / 2 - 60, box.y - 24);
    await p.waitForTimeout(700);
    await p.getByText(f.type, { exact: true }).last().click({ timeout: 6000 });
    await p.waitForTimeout(900);
  }
  await title.fill(f.title); await p.waitForTimeout(250);
  await p.evaluate(() => { document.querySelectorAll('[data-key-input]').forEach((e) => e.removeAttribute('data-key-input')); const k = [...document.querySelectorAll('input')].find((e) => /^field_d+$|^[a-z_]+$/.test(e.value) && e.getBoundingClientRect().x > 1040); if (k) k.setAttribute('data-key-input', '1'); });
  await p.locator('[data-key-input]').first().fill(f.key, { timeout: 4000 }).catch((e) => console.log('key?', f.key, e.message.slice(0, 90)));
  await p.waitForTimeout(250);
  for (const o of f.opts || []) {
    await p.getByText('إضافة اختيار', { exact: true }).first().evaluate((e) => (e.closest('button') || e).click()); await p.waitForTimeout(250);
    await p.locator('input[placeholder="الاختيار"]').last().fill(o); await p.waitForTimeout(120);
  }
  if (f.req) await p.locator('tbody tr').nth(n - 1).locator('td').nth(3).click().catch(() => console.log('req?'));
}

// Journey side panel: finds a label on the left and opens the dropdown under it.
export const leaf = (p, t, nth = 0) => p.evaluate(({ t, nth }) => { const a = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.textContent.trim() === t && e.getBoundingClientRect().x < 395 && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().y > 50); const e = a[nth]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, right: r.right, n: a.length }; }, { t, nth });
export const under = async (p, label, choice, nth = 0) => {
  let r = await leaf(p, label, nth); if (!r) { console.log('no label', label); return; }
  if (r.y > 760) { await p.mouse.move(200, 500); await p.mouse.wheel(0, r.y - 500); await p.waitForTimeout(600); r = await leaf(p, label, nth); }
  await p.mouse.click(r.right - 30, r.y + 32); await p.waitForTimeout(900);
  const o = p.locator('[role=option],[role=menuitem]'); const all = (await o.allInnerTexts()).map((s) => s.trim().replace(/\n+/g, ' '));
  console.log(label, JSON.stringify(all));
  if (choice && all.length) { await o.filter({ hasText: choice }).first().click(); await p.waitForTimeout(800); }
  else if (all.length) { await p.mouse.click(900, 700); await p.waitForTimeout(500); }
};

// A private session for one test member, sharing the running browser but not its sign-in.
export async function as(email) {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9377');
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ar', deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(base + '/login', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[type=email]', { timeout: 90000 });
  await p.locator('input[type=email]').first().fill(email);
  await p.locator('input[type=password]').first().fill(process.env.WAHA_FIRST ? process.env.WAHA_PASS : process.env.WAHA_PASS2);
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => !/\/login/.test(location.pathname) || document.body.innerText.includes('كلمة المرور الجديدة'), null, { timeout: 90000 });
  await p.waitForTimeout(2500);
  if (/first-login/.test(p.url())) {
    const pw = p.locator('input[type=password]');
    await pw.nth(0).fill(process.env.WAHA_PASS2); await pw.nth(1).fill(process.env.WAHA_PASS2);
    await p.getByRole('button', { name: 'حفظ' }).click();
    await p.waitForFunction(() => document.body.innerText.includes('Ctrl+K') || /login/.test(location.pathname) && document.querySelector('input[type=email]'), null, { timeout: 90000 });
    if (/login/.test(p.url())) { await p.locator('input[type=email]').first().fill(email); await p.locator('input[type=password]').first().fill(process.env.WAHA_PASS2); await p.keyboard.press('Enter'); await p.waitForFunction(() => document.body.innerText.includes('Ctrl+K'), null, { timeout: 90000 }); }
  }
  await p.waitForTimeout(3000);
  return { b, ctx, p };
}

// Dashboard widget panel helpers.
export const pickAt = async (p, x, y, re) => { await p.mouse.click(x, y); await p.waitForTimeout(900); const o = p.locator('[role=option],[role=menuitem]'); const all = (await o.allInnerTexts()).map((s) => s.trim()); if (re === undefined) { await p.keyboard.press('Escape'); return all; } await o.filter({ hasText: re }).first().click(); await p.waitForTimeout(1500); return all; };
export const panelBox = (p, label) => p.evaluate((label) => { const e = [...document.querySelectorAll('[role=dialog] *')].find((x) => x.children.length === 0 && x.textContent.trim() === label); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right }; }, label);
