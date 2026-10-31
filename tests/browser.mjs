// Playwright smoke test: 390/1366 px, horizontal overflow, console errors, tool interaction, screenshots.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const OUT = process.env.SHOTS || join(dirname(fileURLToPath(import.meta.url)), '..', '.shots');
mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const srv = createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { r.writeHead(404, { 'content-type': 'text/html' }); r.end(readFileSync(join(ROOT, '404.html'))); return; }
  r.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const pages = JSON.parse(readFileSync(join(ROOT, '..', 'build/pages.json'), 'utf8')).map(p => p.path);
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0;
const shots = new Set(process.argv.slice(2));
for (const width of [390, 1366]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // block third-party requests (ads/analytics) in the test
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  for (const path of [...pages, '/404.html']) {
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) { fail++; const who = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 3).map(e => e.tagName + '.' + e.className).join(' | ')); console.log(`✗ ${width}px ${path}: horizontal overflow ${over}px – ${who}`); }
    if (errs.length) { fail++; console.log(`✗ ${width}px ${path}: ${errs.join(' / ')}`); }
    if (shots.has(path) || shots.has('all')) await page.screenshot({ path: join(OUT, `${width}${path.replace(/\//g, '_') || '_home'}.png`), fullPage: true });
    await page.close();
  }
  // interaction: planner
  const p = await ctx.newPage();
  await p.goto(base + '/tools/clearance-planner/', { waitUntil: 'networkidle' });
  const before = await p.textContent('[data-report]');
  if (!/narrowest walkway/.test(before)) { fail++; console.log('✗ planner report missing'); }
  const x0 = await p.getAttribute('[data-stage] .item[data-id="desk"] rect', 'x');
  await p.focus('[data-stage] .item[data-id="desk"]'); for (let i = 0; i < 10; i++) await p.keyboard.press('ArrowLeft');
  const x1 = await p.getAttribute('[data-stage] .item[data-id="desk"] rect', 'x');
  if (x0 === x1) { fail++; console.log('✗ planner did not react to keyboard move'); }
  await p.selectOption('[data-preset]', 'table4'); await p.click('[data-act="add"]');
  if (!(await p.textContent('[data-report]')).match(/overlaps|blocks|inside/)) console.log('  note: added table produced no conflict');
  if (shots.size) await p.screenshot({ path: join(OUT, `${width}_planner_after.png`), fullPage: false });
  await p.goto(base + '/tools/will-it-fit/', { waitUntil: 'networkidle' });
  const res = await p.textContent('[data-result]');
  if (!/Hallway corner/.test(res)) { fail++; console.log('✗ delivery result missing'); }
  await p.goto(base + '/tools/day-night-swap/', { waitUntil: 'networkidle' });
  if ((await p.$$('[data-stage] svg')).length !== 2) { fail++; console.log('✗ swap needs two plans'); }
  await p.goto(base + '/tools/storage-wall/', { waitUntil: 'networkidle' });
  if (!/cu ft/.test(await p.textContent('[data-bands]'))) { fail++; console.log('✗ storage bands missing'); }
  await ctx.close();
}
await browser.close(); srv.close();
console.log(fail ? `${fail} browser problem(s)` : 'browser checks passed');
process.exit(fail ? 1 : 0);
