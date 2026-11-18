// Playwright checks for the November 2026 additions: Clearance Check (home + tool page), reference table,
// share links, copy/CSV, nonsense input, hostile fragments, in-page anchors of every sitemap page.
// Run: PLAYWRIGHT=/opt/npm-tools/node_modules/playwright node tests/tools-new.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const srv = createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]); let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { r.writeHead(404, { 'content-type': 'text/html' }); r.end('not found'); return; }
  r.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const sitemap = [...readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/smallspacecompass\.com([^<]*)<\/loc>/g)].map(m => m[1]);
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fail++; console.log('✗ ' + msg); } };

for (const width of [390, 1366]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base }).catch(() => {});
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const open = async (path) => {
    const page = await ctx.newPage(); page.errs = [];
    page.on('pageerror', e => page.errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::|Failed to load resource/.test(m.text())) page.errs.push(m.text()); });
    page.on('dialog', d => { page.errs.push('dialog opened: ' + d.message()); d.dismiss(); });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    return page;
  };
  const tag = (t) => `${width}px ${t}`;
  // after a navigation the tool script may still be starting: poll for the expected text for up to 5 s
  const shows = (page, sel, re) => page.waitForFunction(([q, src]) => new RegExp(src).test(document.querySelector(q)?.innerText || ''), [sel, re.source], { timeout: 5000 }).then(() => true, () => false);
  const overflow = async (page, t) => ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, tag(t + ': horizontal overflow'));

  /* ---- every sitemap page: in-page anchors and internal links resolve ---- */
  for (const path of sitemap) {
    const page = await open(path);
    const dead = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(id => id && !document.getElementById(id)));
    ok(dead.length === 0, tag(`${path}: dead in-page anchors ${dead.join(', ')}`));
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')));
    for (const href of new Set(links)) {
      const [p, frag] = href.split('#'); const clean = p.split('?')[0];
      const f = join(ROOT, clean.endsWith('/') ? clean + 'index.html' : clean);
      ok(existsSync(f), tag(`${path}: dead link ${href}`));
      // fragments that are element ids (not tool share links, which contain '=') must exist on the target page
      if (frag && !frag.includes('=') && existsSync(f)) ok(new RegExp(`id="${frag.replace(/[^\w-]/g, '')}"`).test(readFileSync(f, 'utf8')), tag(`${path}: dead fragment ${href}`));
    }
    ok(page.errs.length === 0, tag(`${path}: ${page.errs.join(' / ')}`));
    await page.close();
  }

  /* ---- Clearance Check on the home page and on its tool page ---- */
  for (const path of ['/', '/tools/clearance-check/']) {
    const page = await open(path);
    const out = page.locator('[data-q-out]');
    ok(await shows(page, '[data-q-out]', /30 in clear/), tag(`${path}: default bed result`));
    ok(await page.locator('[data-q-out] svg.q-bar').count() === 1, tag(`${path}: section drawing`));
    // every scenario, every example
    for (const scen of ['bed', 'walkway', 'table', 'aisle']) {
      await page.click(`[data-scen="${scen}"]`);
      const n = await page.locator('[data-q-ex] button').count();
      ok(n === 4, tag(`${path} ${scen}: 4 examples`));
      for (let i = 0; i < n; i++) {
        await page.click(`[data-q-ex] button >> nth=${i}`);
        const t = await out.innerText();
        ok(/clear|fit/i.test(t) && !/NaN|undefined|Infinity/.test(t), tag(`${path} ${scen} example ${i}: result text`));
        ok(await page.locator('[data-q-out] table.data tbody tr').count() >= 3, tag(`${path} ${scen} example ${i}: reference rows`));
      }
    }
    // links from the result table lead to existing reference rows
    const refs = await page.evaluate(() => [...document.querySelectorAll('[data-q-out] a[href^="/reference/#"]')].map(a => a.getAttribute('href').split('#')[1]));
    const refHtml = readFileSync(join(ROOT, 'reference/index.html'), 'utf8');
    ok(refs.length > 0 && refs.every(id => refHtml.includes(`<tr id="${id}"`)), tag(`${path}: result links to reference rows`));
    // units
    await page.click('[data-scen="aisle"]'); await page.click('[data-q-ex] button >> nth=0'); await page.click('[data-unit="cm"]');
    ok(/116\.8 cm clear/.test(await out.innerText()), tag(`${path}: centimetres`));
    ok(await page.inputValue('input[name="room"]') === '243.8', tag(`${path}: inputs converted to cm`));
    await page.click('[data-unit="in"]');
    // keyboard only: tab to the first number field and type
    await page.click('[data-scen="walkway"]');
    await page.focus('input[name="gap"]'); await page.keyboard.press('Control+A'); await page.keyboard.type('70');
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
    ok(/38 in clear/.test(await out.innerText()), tag(`${path}: keyboard entry 70 − 32 = 38 (${(await out.innerText()).slice(0, 40)})`));
    // nonsense
    for (const junk of ['', '-5', '0', 'abc', '1e999', '999999999', '<img src=x onerror=alert(1)>', '=1+1']) {
      await page.evaluate((v) => { const i = document.querySelector('input[name="gap"]'); i.type = 'text'; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }, junk);
      const t = await out.innerText();
      ok(/Enter a number above 0/.test(t), tag(`${path}: junk "${junk.slice(0, 12)}" refused`));
      ok(await page.locator('[data-q-act="copy"]').isDisabled(), tag(`${path}: copy disabled on invalid input`));
      ok(await out.locator('img, script').count() === 0, tag(`${path}: no injected element`));
    }
    await page.click('[data-q-ex] button >> nth=0');
    // copy result, copy link
    await page.click('[data-q-act="copy"]');
    const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (clip !== null) ok(/Clearance Check – Walkway/.test(clip) && /28 in/.test(clip), tag(`${path}: copied result text`));
    await page.click('[data-q-act="link"]');
    const link = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (link !== null) {
      ok(/\/tools\/clearance-check\/#c=walkway&u=in&gap=60&zoneA=32&zoneB=0$/.test(link), tag(`${path}: share link ${link}`));
      const shared = await open(link.replace(/^https?:\/\/[^/]+/, ''));
      ok(await shows(shared, '[data-q-out]', /28 in clear/), tag(`${path}: share link restores the check`));
      ok(await shared.evaluate(() => location.hash) === '', tag(`${path}: fragment removed from the address bar`));
      ok(shared.errs.length === 0, tag(`${path} shared: ${shared.errs.join(' / ')}`));
      await shared.close();
    }
    await overflow(page, path + ' clearance check');
    ok(page.errs.length === 0, tag(`${path}: ${page.errs.join(' / ')}`));
    await page.close();
  }
  // hostile fragments: ignored, default shown, nothing executed
  for (const frag of ['#c=bed&wall=<img src=x onerror=alert(1)>&bedW=60&depth=144&bedL=80', '#c=__proto__&wall=1', '#c=bed&wall=120&bedW=60&depth=144&bedL=80&sides="><script>alert(1)</script>', '#"><svg onload=alert(1)>', '#c=walkway&gap=javascript:alert(1)']) {
    const page = await open('/tools/clearance-check/' + frag);
    ok(await shows(page, '[data-q-out]', /in clear/), tag(`hostile fragment still renders: ${frag.slice(0, 30)}`));
    ok(await page.locator('[data-quick] img, [data-quick] script, [data-quick] svg[onload]').count() === 0, tag(`hostile fragment injected nothing: ${frag.slice(0, 30)}`));
    ok(page.errs.length === 0, tag(`hostile fragment ${frag.slice(0, 30)}: ${page.errs.join(' / ')}`));
    await page.close();
  }
  // a guide's "try it" link opens the check with the guide's numbers
  {
    const g = await open('/guides/small-kitchen-clearances/');
    const href = await g.locator('p.try a.btn').first().getAttribute('href');
    await g.close();
    const page = await open(href);
    ok(await shows(page, '[data-q-out]', /46 in clear/), tag('guide link → 46 in aisle'));
    await page.close();
  }

  /* ---- reference table ---- */
  {
    const page = await open('/reference/');
    const total = await page.locator('table.ref tr[data-id]').count();
    const visible = () => page.locator('table.ref tr[data-id]:not([hidden])').count();
    ok(total >= 80 && await visible() === total, tag('reference: all rows visible at start'));
    await page.fill('[data-ref-q]', 'bed 750');
    const n1 = await visible(); ok(n1 >= 3 && n1 < 10, tag(`reference: search "bed 750" → ${n1}`));
    ok(/of \d+ entries/.test(await page.locator('[data-ref-count]').innerText()), tag('reference: count'));
    await page.fill('[data-ref-q]', ''); await page.selectOption('[data-ref-topic]', 'Kitchens');
    const n2 = await visible(); ok(n2 >= 10 && n2 < total, tag(`reference: topic Kitchens → ${n2}`));
    ok(await page.locator('table.ref tbody[data-topic]:not([hidden])').count() === 1, tag('reference: other topic groups hidden'));
    await page.selectOption('[data-ref-src]', 'ada'); const n3 = await visible(); ok(n3 >= 1 && n3 < n2, tag('reference: topic + source'));
    await page.selectOption('[data-ref-region]', 'UK'); ok(await visible() === 0 && await page.locator('[data-ref-none]').isVisible(), tag('reference: empty result message'));
    await page.click('[data-ref-act="clear"]'); ok(await visible() === total, tag('reference: clear filters'));
    for (const junk of ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', '=cmd|calc', '%%%', '\\', 'a'.repeat(3000)]) {
      await page.fill('[data-ref-q]', junk); ok(await visible() === 0, tag(`reference: junk search "${junk.slice(0, 10)}"`));
    }
    ok(await page.locator('[data-ref] img, [data-ref] script').count() === 0, tag('reference: nothing injected'));
    await page.click('[data-ref-act="clear"]');
    // CSV of the filtered rows
    await page.selectOption('[data-ref-src]', 'hud');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-ref-act="csv"]')]);
    const csv = readFileSync(await dl.path(), 'utf8').replace(/^﻿/, '');
    const lines = csv.trimEnd().split('\r\n');
    ok(lines.length === await visible() + 1 && /^Topic,Measurement/.test(lines[0]), tag(`reference: CSV has ${lines.length - 1} rows`));
    ok(lines.every(l => !/(^|,)"?[=+\-@]/.test(l)), tag('reference: no CSV cell starts a formula'));
    await page.click('[data-ref-act="clear"]');
    // row link
    await page.click('tr#adm-bed-principal [data-row-link]');
    const rl = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (rl !== null) ok(/\/reference\/#adm-bed-principal$/.test(rl), tag('reference: row link'));
    const hit = await open('/reference/#adm-bed-principal');
    ok(await hit.locator('tr#adm-bed-principal.hit').count() === 1, tag('reference: linked row is marked'));
    await hit.close();
    // every source link is https and every row has one
    ok(await page.locator('table.ref tr[data-id] td a[href^="https://"]').count() === total, tag('reference: one source link per row'));
    await overflow(page, 'reference');
    ok(page.errs.length === 0, tag(`reference: ${page.errs.join(' / ')}`));
    await page.close();
  }

  /* ---- Will It Fit: worked routes, copy, share link ---- */
  {
    const page = await open('/tools/will-it-fit/');
    const res = page.locator('[data-result]');
    await page.click('[data-example="sofaok"]'); ok(/Fits along the whole route/.test(await res.innerText()), tag('delivery: sofa passes'));
    await page.click('[data-example="sofastuck"]'); ok(/Does not fit at Hallway corner/.test(await res.innerText()), tag('delivery: deeper sofa stuck at the corner'));
    ok(/Next step/.test(await res.innerText()), tag('delivery: next step shown'));
    await page.click('[data-example="mattress"]'); ok(!/NaN|undefined/.test(await res.innerText()), tag('delivery: mattress example'));
    await page.click('[data-example="wardrobe"]'); ok(/upright/i.test(await res.innerText()), tag('delivery: wardrobe upright'));
    await page.click('[data-example="sofastuck"]');
    await page.click('[data-share="copy"]');
    const txt = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (txt !== null) ok(/Will It Fit\?/.test(txt) && /Hallway corner \(90°\): blocked/.test(txt) && !/<[a-z]/.test(txt), tag('delivery: copied text'));
    await page.click('[data-share="link"]');
    const link = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (link !== null) {
      ok(/\/tools\/will-it-fit\/#u=in&W=84&D=37&H=34&diag=31/.test(link), tag('delivery: share link ' + link.slice(0, 80)));
      const fresh = await browser.newContext({ viewport: { width, height: 900 } });   // no stored state
      await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
      const p2 = await fresh.newPage(); const errs = []; p2.on('pageerror', e => errs.push(e.message));
      await p2.goto(base + link.replace(/^https?:\/\/[^/]+/, ''), { waitUntil: 'networkidle' });
      ok(await p2.inputValue('input[name="D"]') === '37' && /Does not fit at Hallway corner/.test(await p2.locator('[data-result]').innerText()), tag('delivery: share link restores the check'));
      ok(await p2.evaluate(() => location.hash) === '' && errs.length === 0, tag('delivery: fragment removed, no errors'));
      await fresh.close();
    }
    // invalid input: actions disabled, message shown
    await page.fill('input[name="W"]', '-3');
    ok(/Enter a number above 0/.test(await res.innerText()) && await page.locator('[data-share="copy"]').isDisabled(), tag('delivery: invalid input disables sharing'));
    await page.click('[data-example="sofaok"]');
    // hostile fragment
    const bad = await open('/tools/will-it-fit/#W=84&D=35&H=34&doorW=<img src=x onerror=alert(1)>&upright="><script>alert(1)</script>');
    ok(/Fits|Does not fit/.test(await bad.locator('[data-result]').innerText()) && await bad.locator('[data-delivery] img, [data-delivery] script').count() === 0 && bad.errs.length === 0, tag('delivery: hostile fragment'));
    await bad.close();
    await overflow(page, 'delivery');
    ok(page.errs.length === 0, tag(`delivery: ${page.errs.join(' / ')}`));
    await page.close();
  }

  /* ---- Storage Wall: CSV with a hostile label ---- */
  {
    const page = await open('/tools/storage-wall/');
    await page.fill('[data-unit] input[data-k="label"]', '=HYPERLINK("http://x","y")');
    await page.locator('[data-unit] input[data-k="label"]').dispatchEvent('change');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-out="csv"]')]);
    const csv = readFileSync(await dl.path(), 'utf8').replace(/^﻿/, ''), lines = csv.trimEnd().split('\r\n');
    ok(lines.length === 6 && /^Unit,From left \(in\)/.test(lines[0]) && /^All units,/.test(lines[5]), tag(`storage: CSV lines ${lines.length}`));
    ok(lines.every(l => !/(^|,)"?[=+\-@]/.test(l)) && csv.includes("'=HYPERLINK"), tag('storage: formula label neutralised in CSV'));
    ok(await page.locator('[data-storage] a[href^="http://x"]').count() === 0, tag('storage: label not rendered as a link'));
    await page.click('[data-act="reset"]');
    await overflow(page, 'storage');
    ok(page.errs.length === 0, tag(`storage: ${page.errs.join(' / ')}`));
    await page.close();
  }
  await ctx.close();
}
await browser.close(); srv.close();
console.log(fail ? `${fail} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fail ? 1 : 0);
