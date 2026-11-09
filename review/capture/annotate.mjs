// Draws the guide's numbered markers (or grey masks) on an existing screenshot.
// Boxes are [x, y, w, h] in a 1440-px-wide layout, the size the screen was captured at.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('D:/stuff/right-code/taskflow/.temp/inspection-guide/tools/package.json');
const { chromium } = require('playwright-core');
const SP = 'C:/Users/MAHMOU~1/AppData/Local/Temp/claude/d--stuff-right-code-taskflow/c108761f-7f91-4a48-a1f5-de6a515fd391/scratchpad/kayan/';
const OUT = 'D:/stuff/right-code/taskflow/.temp/inspection-guide/assets/screens/';
const s = (a) => a.map((v) => Math.round(v * 0.72));
const JOBS = [
  { src: SP + 'laila-home.png', out: 'b-laila-home.png', marks: [s([1510, 540, 190, 40]), s([1750, 218, 180, 30])] },
  { src: SP + 'laila-form.png', out: 'b-laila-form.png', marks: [s([1445, 155, 80, 30]), s([480, 772, 1040, 66]), s([1430, 1050, 92, 30]), s([10, 215, 385, 120])] },
  { src: SP + 'w3-returned.png', out: 'b-returned.png', marks: [s([1398, 155, 124, 30]), s([10, 585, 350, 180])] },
  { src: SP + 'rana-approvals.png', out: 'b-decide.png', marks: [s([990, 385, 275, 150]), s([730, 1165, 520, 40]), s([540, 1160, 140, 50])], masks: [s([35, 1010, 525, 205])] },
  { src: SP + 'w-return-dlg.png', out: 'b-return-dlg.png', marks: [s([503, 610, 995, 80]), s([503, 815, 995, 135]), s([503, 1007, 175, 42])] },
  { src: OUT + 'b-node.png', out: 'b-node.png', masks: [[1266, 436, 34, 22], [1117, 178, 28, 20]], raw: true },
];
const b = await chromium.launch({ channel: 'msedge', headless: true });
for (const j of JOBS.filter((x) => !process.argv[2] || x.out === process.argv[2])) {
  const data = fs.readFileSync(j.src);
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const box = (r, i) => `<div style="position:absolute;left:${r[0] - 3}px;top:${r[1] - 3}px;width:${r[2] + 6}px;height:${r[3] + 6}px;border:3px solid #e8590c;border-radius:10px;box-sizing:border-box"></div><div style="position:absolute;left:${Math.min(1408, r[0] + r[2] - 2)}px;top:${Math.max(2, r[1] - 22)}px;width:30px;height:30px;border-radius:50%;background:#e8590c;color:#fff;font:700 16px/30px Arial;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.35)">${i + 1}</div>`;
  const mk = (r) => `<div style="position:absolute;left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px;background:#c9ced6;border-radius:5px"></div>`;
  await p.setContent(`<body style="margin:0"><div style="position:relative;width:1440px;height:900px;overflow:hidden"><img src="data:image/png;base64,${data.toString('base64')}" style="width:1440px;display:block">${(j.masks || []).map(mk).join('')}${(j.marks || []).map(box).join('')}</div></body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + j.out });
  await p.close();
  console.log('ok', j.out);
}
await b.close();
