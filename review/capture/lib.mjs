import { createRequire } from 'node:module';
const require = createRequire('D:/stuff/right-code/taskflow/.temp/inspection-guide/tools/package.json');
const { chromium } = require('playwright-core');

export const SP = 'C:/Users/MAHMOU~1/AppData/Local/Temp/claude/d--stuff-right-code-taskflow/c108761f-7f91-4a48-a1f5-de6a515fd391/scratchpad';
export const ORG = 'https://ministryofeconomyandindustry.kayanos.app';
export const T2 = 'https://test2.kayanos.app';
const READ_POST = /\/find-records|\/aggregate-figures|\/auth\/(refresh|token)|approval-steps\/(people-check|blocked-starts)|role-assignment-rules\/get-rule|\/roles\/list\b/;

// org: every write is aborted. test2: unrestricted (allowed by the repository rules).
export async function open(env, { scale = 1, width = 1440, height = 900, debugPort } = {}) {
  const dir = SP + (env === 'org' ? '/kayan/profile' : '/kayan/t2profile');
  const ctx = await chromium.launchPersistentContext(dir, { channel: 'msedge', headless: true, viewport: { width, height }, locale: 'ar', deviceScaleFactor: scale, colorScheme: 'light', args: debugPort ? [`--remote-debugging-port=${debugPort}`, '--remote-debugging-address=127.0.0.1'] : [] });
  const page = ctx.pages()[0] || await ctx.newPage();
  const blocked = new Set();
  if (env === 'org') {
    await page.route('**/*', (r) => {
      const q = r.request();
      if (['GET', 'HEAD', 'OPTIONS'].includes(q.method()) || READ_POST.test(q.url())) return r.continue();
      if (!q.url().includes('otel')) blocked.add(q.method() + ' ' + q.url().split('?')[0]);
      return r.abort();
    });
  }
  return { ctx, page, blocked, base: env === 'org' ? ORG : T2 };
}

export async function go(page, url, wait = 6000) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(wait);
  const nn = page.getByRole('button', { name: 'ليس الآن' });
  if (await nn.count()) { await nn.first().click().catch(() => {}); await page.waitForTimeout(400); }
}

export const body = async (page) => (await page.locator('body').innerText()).replace(/\n+/g, ' | ');
export const after = (t, key = 'Ctrl+K', n = 2500) => { const i = t.indexOf(key); return t.slice(i < 0 ? 0 : i + key.length, (i < 0 ? 0 : i) + n); };

// Numbered markers, drawn the same way as the KayanOS guide capture tool.
export async function mark(page, marks) {
  return page.evaluate((marks) => {
    document.querySelectorAll('.guide-mark').forEach((n) => n.remove());
    const rtl = document.documentElement.dir === 'rtl';
    const visible = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 4 && r.height > 4 && c.visibility !== 'hidden' && c.display !== 'none' && r.bottom > 0 && r.top < innerHeight; };
    const textOf = (e) => (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.innerText || e.value || '').trim().replace(/\s+/g, ' ');
    const out = [], missing = [];
    marks.forEach((m, i) => {
      let el = null, r = null;
      if (m.box) r = { left: m.box[0], top: m.box[1], right: m.box[0] + m.box[2], bottom: m.box[1] + m.box[3], width: m.box[2], height: m.box[3] };
      if (!r && m.sel) el = [...document.querySelectorAll(m.sel)].filter(visible)[m.nth ?? 0] || null;
      if (!r && !el && m.t) {
        const re = new RegExp(m.t);
        const cands = [...document.querySelectorAll('button,a,[role=button],[role=tab],input,textarea,h1,h2,h3,h4,label,th,li,p,span,strong,b,div')]
          .filter(visible).filter((e) => re.test(textOf(e)) && textOf(e).length <= (m.max ?? 80));
        cands.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height);
        const c = cands[m.nth ?? 0];
        el = c ? (m.exact ? c : c.closest('button,a,[role=button],[role=tab]') || c) : null;
      }
      if (!r && !el) { missing.push(m.t || m.sel); return; }
      r = r || el.getBoundingClientRect();
      const box = document.createElement('div'); box.className = 'guide-mark';
      Object.assign(box.style, { position: 'fixed', left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px`, border: '3px solid #e8590c', borderRadius: '10px', zIndex: 2147483646, pointerEvents: 'none', boxSizing: 'border-box' });
      const n = document.createElement('div'); n.className = 'guide-mark'; n.textContent = String(i + 1);
      const x = rtl ? r.right - 2 : r.left - 28;
      Object.assign(n.style, { position: 'fixed', left: `${Math.max(2, Math.min(innerWidth - 32, x))}px`, top: `${Math.max(2, r.top - 22)}px`, width: '30px', height: '30px', borderRadius: '50%', background: '#e8590c', color: '#fff', font: '700 16px/30px Arial', textAlign: 'center', zIndex: 2147483647, boxShadow: '0 1px 4px rgba(0,0,0,.35)', pointerEvents: 'none' });
      document.body.append(box, n);
      out.push({ n: i + 1, label: textOf(el || document.body).slice(0, 50) });
    });
    return { marks: out, missing };
  }, marks);
}

// Paints over anything matching the given strings or selectors, including the avatar.
export async function mask(page, { texts = [], sels = [] } = {}) {
  return page.evaluate(({ texts, sels }) => {
    const els = new Set(sels.flatMap((s) => [...document.querySelectorAll(s)]));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (texts.some((t) => n.textContent.includes(t))) els.add(n.parentElement);
    let c = 0;
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const d = document.createElement('div'); d.className = 'guide-mask';
      Object.assign(d.style, { position: 'fixed', left: `${r.left - 1}px`, top: `${r.top - 1}px`, width: `${r.width + 2}px`, height: `${r.height + 2}px`, background: '#c9ced6', borderRadius: '5px', zIndex: 2147483645, pointerEvents: 'none' });
      document.body.append(d); c++;
    });
    return c;
  }, { texts, sels });
}

// Signs in to test2 if needed; the account comes from the repository instructions via the environment.
export async function t2() {
  const s = await open('t2');
  await s.page.goto(s.base + '/', { waitUntil: 'domcontentloaded' });
  await s.page.waitForFunction(() => /login/.test(location.href) || document.body.innerText.includes('Ctrl+K'), null, { timeout: 30000 });
  await s.page.waitForTimeout(1500);
  if (/login/.test(s.page.url())) {
    await s.page.locator('input[type=email]').first().fill(process.env.T2_EMAIL);
    await s.page.locator('input[type=password]').first().fill(process.env.T2_PASS);
    await s.page.keyboard.press('Enter');
    await s.page.waitForURL((u) => !/login/.test(u.href), { timeout: 20000 });
    await s.page.waitForTimeout(4000);
  }
  return s;
}
export const links = (page, re) => page.locator('a[href]').evaluateAll((a, src) => [...new Map(a.map((e) => [e.getAttribute('href'), e.innerText.trim().replace(/\s+/g, ' ').slice(0, 30)])).entries()].filter(([h]) => new RegExp(src).test(h) && !h.includes('?view=')), re);
