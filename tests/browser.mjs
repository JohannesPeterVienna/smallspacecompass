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
// Codex counterexamples (Nov 2026), end to end in the real pages
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept());
  // SSC02: a broken import must not replace or overwrite the saved plan
  await p.goto(base + '/tools/clearance-planner/', { waitUntil: 'networkidle' });
  const saved0 = await p.evaluate(() => localStorage.getItem('ssc-planner-v1'));
  await p.setInputFiles('[data-file]', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ room: { W: 120, D: 120 }, items: [], doors: 'not-an-array', windows: [] })) });
  await p.waitForTimeout(300);
  const saved1 = await p.evaluate(() => localStorage.getItem('ssc-planner-v1'));
  if (saved1 !== saved0) { fail++; console.log('✗ SSC02 broken import replaced the saved plan'); }
  if (!(await p.$('[data-stage] .item[data-id="desk"]'))) { fail++; console.log('✗ SSC02 old plan no longer shown after broken import'); }
  // SSC02: a corrupt saved plan falls back to a good plan instead of breaking the page
  await p.evaluate(() => localStorage.setItem('ssc-planner-v1', JSON.stringify({ room: { W: 120, D: 120 }, items: [], doors: 'not-an-array', windows: [] })));
  await p.reload({ waitUntil: 'networkidle' });
  if (!/narrowest walkway/.test(await p.textContent('[data-report]'))) { fail++; console.log('✗ SSC02 corrupt saved plan broke the planner'); }
  // SSC03: 84 in → cm → reload must still be 84 in (shown as 213.4 cm)
  await p.goto(base + '/tools/will-it-fit/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.removeItem('ssc-delivery-v2'));
  await p.reload({ waitUntil: 'networkidle' });
  await p.fill('[name=W]', '84'); await p.click('[data-units="cm"]');
  const shown = await p.inputValue('[name=W]');
  await p.reload({ waitUntil: 'networkidle' });
  const st = JSON.parse(await p.evaluate(() => localStorage.getItem('ssc-delivery-v2')));
  const afterCm = await p.inputValue('[name=W]');
  await p.click('[data-units="in"]');
  const afterIn = await p.inputValue('[name=W]');
  if (shown !== '213.4' || st?.lengths?.W !== 84 || st?.unit !== 'cm' || afterCm !== '213.4' || afterIn !== '84') { fail++; console.log(`✗ SSC03 unit round trip: shown ${shown}, stored ${st?.lengths?.W} ${st?.unit}, after reload ${afterCm} cm / ${afterIn} in`); }
  // SSC01 in the page: fridge-like 30×31×68 kept upright, door 36×60
  await p.fill('[name=W]', '30'); await p.fill('[name=D]', '31'); await p.fill('[name=H]', '68'); await p.fill('[name=diag]', '');
  await p.check('[name=upright]'); await p.uncheck('[name=useCorner]'); await p.fill('[name=doorW]', '36'); await p.fill('[name=doorH]', '60');
  if (!/Does not fit at Entry door/.test(await p.textContent('[data-result]'))) { fail++; console.log('✗ SSC01 upright item reported as fitting a 60 in high door'); }
  await p.fill('[name=doorW]', '-5');
  if (!/above 0/.test(await p.textContent('[data-result]'))) { fail++; console.log('✗ delivery accepted a negative door width'); }
  await p.evaluate(() => localStorage.removeItem('ssc-delivery-v2'));
  // Storage: a typed negative width is rejected (HTML min does not stop it)
  await p.goto(base + '/tools/storage-wall/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.removeItem('ssc-storage-v1'));
  await p.reload({ waitUntil: 'networkidle' });
  const tot0 = await p.textContent('[data-bands] tbody tr:last-child');
  await p.fill('[data-unit] [data-k="w"]', '-24'); await p.dispatchEvent('[data-unit] [data-k="w"]', 'change');
  const tot1 = await p.textContent('[data-bands] tbody tr:last-child');
  if (tot1 !== tot0 || /-/.test(tot1) || !/Width: Must be more than 0/.test(await p.textContent('[data-unit]'))) { fail++; console.log(`✗ storage accepted a negative width (${tot0} → ${tot1})`); }
  if (errs.length) { fail++; console.log('✗ counterexample pages: ' + errs.join(' / ')); }
  await ctx.close();
}
await browser.close(); srv.close();
console.log(fail ? `${fail} browser problem(s)` : 'browser checks passed');
process.exit(fail ? 1 : 0);
