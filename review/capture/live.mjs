import { open } from './lib.mjs';
const s = await open('org', { scale: 1.5, debugPort: 9388 });
// Login is authorized; all other writes remain blocked by open().
await s.page.route('https://auth.kayanos.app/api/auth/login', r => r.continue());
await s.page.goto(s.base + '/forms/view/001', { waitUntil: 'commit', timeout: 60000 });
console.log('READY');
setInterval(() => {}, 30000);
