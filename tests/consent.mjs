// Playwright self-test of the consent flow with a stubbed Google CMP (no network):
// first visit, reject, accept, withdraw, revisit – plus the edge cases from the Codex review
// (TCF granted but analytics DENIED, UNKNOWN, outside GDPR, U.S. state opt-out).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = createServer((q, r) => {
  let f = join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f));
}).listen(0);
const URL0 = `http://127.0.0.1:${srv.address().port}/guides/small-bathroom-layout-dimensions/`;

// Stub of adsbygoogle.js + Google CMP. State lives in localStorage so a reload is a revisit.
const STUB = `(() => {
  const ls = localStorage, cfg = JSON.parse(ls.getItem('stub') || '{}');
  const E = { UNKNOWN: 0, GRANTED: 1, DENIED: 2, NOT_APPLICABLE: 3, NOT_CONFIGURED: 4 };
  const gdpr = cfg.gdpr !== false, listeners = [];
  const dec = () => ls.getItem('decision');            // null | 'accept' | 'reject'
  const tc = (status) => ({ gdprApplies: gdpr, eventStatus: status, displayStatus: cfg.hidden && status === 'cmpuishown' ? 'hidden' : undefined, tcString: dec() ? 'CQstub' : '', purpose: { consents: dec() === 'accept' ? { 1: true } : {} }, vendor: { consents: dec() === 'accept' ? { 755: true } : {} } });
  window.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') { listeners.push(cb); cb(tc(dec() ? 'tcloaded' : 'cmpuishown'), true); } };
  const fire = (s) => listeners.forEach(cb => cb(tc(s), true));
  const fc = window.googlefc = window.googlefc || {};
  fc.ConsentModePurposeStatusEnum = E;
  fc.getGoogleConsentModeValues = () => {
    const d = dec();
    let v = cfg.cm != null ? E[cfg.cm] : (!gdpr ? E.NOT_APPLICABLE : d === 'accept' ? E.GRANTED : d === 'reject' ? E.DENIED : E.UNKNOWN);
    const a = cfg.analytics != null ? E[cfg.analytics] : v;
    return { adStoragePurposeConsentStatus: v, adUserDataPurposeConsentStatus: v, adPersonalizationPurposeConsentStatus: v, analyticsStoragePurposeConsentStatus: a };
  };
  fc.usstatesoptout = { getInitialUsStatesOptOutStatus: () => cfg.us ?? 1 };
  fc.showRevocationMessage = () => { ls.removeItem('decision'); fire('cmpuishown'); };
  window.__decide = (d) => { ls.setItem('decision', d); fire('useractioncomplete'); };
  const run = (item) => { if (typeof item === 'function') return item(); for (const k of ['CONSENT_API_READY', 'CONSENT_MODE_DATA_READY', 'INITIAL_US_STATES_OPT_OUT_DATA_READY']) if (item[k]) item[k](); };
  const q = fc.callbackQueue || []; fc.callbackQueue = { push: (x) => { run(x); return 0; } }; q.forEach(run);
})();`;

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) fail++; };
async function session(cfg) {
  const ctx = await browser.newContext();
  const st = { ga: 0 };
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => {
    const u = r.request().url();
    if (/adsbygoogle\.js/.test(u)) { st.ads = (st.ads || 0) + 1; return r.fulfill({ contentType: 'text/javascript', body: STUB }); }
    if (/fundingchoicesmessages\.google\.com\/i\/pub-7811071715414905\?ers=1/.test(u)) { st.fc = (st.fc || 0) + 1; return r.fulfill({ contentType: 'text/javascript', body: STUB }); }
    if (/googletagmanager\.com\/gtag\/js/.test(u)) { st.ga++; return r.fulfill({ contentType: 'text/javascript', body: '' }); }
    return r.abort();
  });
  const page = await ctx.newPage();
  await page.addInitScript((c) => { if (!sessionStorage.getItem('init')) { localStorage.setItem('stub', JSON.stringify(c)); sessionStorage.setItem('init', '1'); } }, cfg);
  const state = () => page.evaluate(() => {
    const cmds = (window.dataLayer || []).filter(e => e && e[0] === 'consent').map(e => [e[1], e[2]]);
    return { cmds, last: cmds.filter(c => c[0] === 'update').pop()?.[1] || null, disabled: window['ga-disable-G-T00HRG2YVF'] };
  });
  const go = async () => { await page.goto(URL0, { waitUntil: 'networkidle' }); await page.waitForTimeout(150); };
  return { ctx, page, st, state, go };
}

// 1–5: EU visitor
{
  const s = await session({});
  await s.go();
  let x = await s.state();
  const order = await s.page.evaluate(() => { const sc = [...document.head.querySelectorAll('script')]; return sc.findIndex(e => /consent','default'/.test(e.textContent)) < sc.findIndex(e => /adsbygoogle/.test(e.src || '')); });
  check(order, 'first visit: consent default is set before the ad/CMP script');
  check(x.cmds[0]?.[0] === 'default' && Object.values(x.cmds[0][1]).filter(v => v === 'denied').length === 4, 'first visit: default denies ad_storage, ad_user_data, ad_personalization, analytics_storage');
  check(s.st.ga === 0 && x.disabled === true, 'first visit: no GA request, GA disabled');
  await s.page.evaluate(() => window.__decide('reject')); await s.page.waitForTimeout(100); x = await s.state();
  check(s.st.ga === 0 && x.disabled === true && (!x.last || x.last.analytics_storage === 'denied'), 'reject: no GA, analytics denied');
  await s.page.evaluate(() => window.__decide('accept')); await s.page.waitForTimeout(100); x = await s.state();
  check(s.st.ga === 1 && x.disabled === false && x.last.analytics_storage === 'granted', 'accept: GA loaded once, analytics granted');
  await s.page.click('[data-privacy-settings]'); await s.page.waitForTimeout(100); x = await s.state();
  check(x.disabled === true && x.last.analytics_storage === 'denied' && x.last.ad_storage === 'denied', 'withdraw: consent update denied, GA disabled');
  await s.page.evaluate(() => window.__decide('accept')); await s.go(); x = await s.state();
  check(s.st.ga === 2 && x.disabled === false && x.last.analytics_storage === 'granted', 'revisit after consent: GA loads with granted state');
  await s.page.evaluate(() => window.__decide('reject')); await s.go(); x = await s.state();
  check(s.st.ga === 2 && x.disabled === true, 'revisit after rejection: no GA');
  await s.ctx.close();
}
// edge cases
for (const [cfg, decision, wantGA, name] of [
  [{ analytics: 'DENIED' }, 'accept', false, 'TCF purpose 1 + vendor 755 granted, but CMP analytics DENIED → no GA'],
  [{ analytics: 'NOT_CONFIGURED' }, 'accept', false, 'analytics purpose NOT_CONFIGURED in the CMP → no GA'],
  [{ cm: 'UNKNOWN' }, 'accept', false, 'consent-mode values UNKNOWN → no GA'],
  [{ gdpr: false }, null, true, 'outside GDPR, CMP reports NOT_APPLICABLE → GA'],
  [{ gdpr: false, us: 3 }, null, false, 'U.S. state regulation, visitor opted out → no GA'],
  [{ gdpr: false, cm: 'DENIED' }, null, false, 'outside GDPR, CMP reports DENIED → no GA']]) {
  const s = await session(cfg);
  if (decision) await s.page.addInitScript((d) => localStorage.setItem('decision', d), decision);
  await s.go(); const x = await s.state();
  check((s.st.ga > 0) === wantGA && x.disabled === !wantGA, name);
  await s.ctx.close();
}
// interim statistics window: Google's CMP loads but reports displayStatus "hidden"
{
  const s = await session({ hidden: true });
  await s.page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    document.cookie = '_ga=GA1.1.1.1; path=/'; document.cookie = '_ga_T00HRG2YVF=GS1.1; path=/';
  });
  await s.go();
  const visible = () => s.page.evaluate(() => { const n = document.getElementById('ssc-stats'); return !!n && !n.hidden; });
  check(!(await visible()), 'hidden CMP: no window during the first 3 s');
  await s.page.waitForTimeout(3200);
  check(await visible(), 'hidden CMP: window appears after about 3 s');
  const box = await s.page.evaluate(() => {
    const n = document.getElementById('ssc-stats'), b = [...n.querySelectorAll('.statnote-pick')].filter((x) => x.offsetParent).map((x) => x.getBoundingClientRect());
    return { pos: getComputedStyle(n).position, h: b.map((r) => Math.round(r.height)), w: b.map((r) => Math.round(r.width)), cls: window.__cls };
  });
  check(box.pos === 'fixed' && box.cls === 0, `window is fixed and causes no layout shift (CLS ${box.cls})`);
  check(box.h.every((x) => x >= 44) && box.w[0] === box.w[1] && box.h[0] === box.h[1], `Allow and Decline equal and at least 44 px (${box.w}×${box.h})`);
  await s.page.click('#ssc-stats [data-stats-pick="granted"]'); await s.page.waitForTimeout(100);
  let x = await s.state();
  check(s.st.ga === 1 && x.disabled === false && JSON.stringify(x.last) === '{"analytics_storage":"granted"}', 'Allow: GA loaded once, update is analytics_storage only');
  await s.page.click('[data-privacy-settings]'); await s.page.waitForTimeout(100);
  check(await visible(), '"Privacy settings" reopens the window');
  await s.page.click('#ssc-stats [data-stats-pick="denied"]'); await s.page.waitForTimeout(100);
  x = await s.state();
  const cookies = await s.page.evaluate(() => document.cookie);
  check(x.disabled === true && x.last.analytics_storage === 'denied' && !/_ga/.test(cookies), 'Decline: GA off, analytics denied, _ga cookies deleted');
  await s.go(); await s.page.waitForTimeout(3200);
  check(!(await visible()) && s.st.ga === 1, 'revisit after Decline: no window, no GA');
  for (const w of [320, 390]) {
    await s.page.setViewportSize({ width: w, height: 640 });
    await s.page.click('[data-privacy-settings]'); await s.page.waitForTimeout(100);
    const m = await s.page.evaluate(() => { const n = document.getElementById('ssc-stats'), r = n.getBoundingClientRect(); return { left: r.left, right: r.right, bottom: r.bottom, h: r.height, vw: innerWidth, vh: innerHeight, own: n.scrollWidth - n.clientWidth }; });
    check(m.left === 0 && Math.round(m.right) === m.vw && Math.round(m.bottom) === m.vh && m.own <= 0 && m.h <= m.vh * 0.55 + 1, `${w} px: full width at the bottom, no overflow inside, height ${Math.round(m.h)} ≤ 55 %`);
    await s.page.keyboard.press('Escape');
  }
  // privacy policy (no ads, no GA): "Privacy settings" opens the window; 320 px without horizontal scrolling
  await s.page.goto(URL0.replace(/\/guides\/.*$/, '/privacy/'), { waitUntil: 'networkidle' });
  await s.page.setViewportSize({ width: 320, height: 640 });
  await s.page.waitForTimeout(3200);
  check(!(await visible()), 'privacy policy: no window by itself');
  await s.page.click('footer [data-privacy-settings]'); await s.page.waitForTimeout(100);
  const pv = await s.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: innerWidth, t: document.getElementById('ssc-stats').textContent }));
  check(await visible() && pv.sw <= pv.vw && /current choice: declined/.test(pv.t) && s.st.ga === 1, 'privacy policy at 320 px: window opens on request, shows the stored choice, no overflow, no GA');
  await s.page.emulateMedia({ media: 'print' });
  check(await visible() && await s.page.evaluate(() => getComputedStyle(document.getElementById('ssc-stats')).display === 'none' && getComputedStyle(document.body).paddingBottom === '0px'), 'window hidden in print, no reserved space');
  await s.page.emulateMedia({ media: 'screen' });
  const adsBefore = s.st.ads || 0;
  const gbtn = s.page.locator('#ssc-stats .statnote-google');
  check(await gbtn.isVisible() && /Google’s ad & U\.S\. privacy choices/.test(await gbtn.textContent()) && (await gbtn.boundingBox()).height >= 44, 'privacy policy: window offers “Open Google’s ad & U.S. privacy choices” (≥ 44 px)');
  await gbtn.click(); await s.page.waitForTimeout(200);
  const fcOk = await s.page.evaluate(() => ({ fc: !!document.querySelector('script[src*="fundingchoicesmessages.google.com"]'), ads: !!document.querySelector('script[src*="adsbygoogle.js"]') }));
  check(s.st.fc === 1 && fcOk.fc && !fcOk.ads && (s.st.ads || 0) === adsBefore, 'privacy policy: click loads only Google’s consent script, no ad script');
  await s.page.evaluate(() => window.__decide('accept')); await s.page.waitForTimeout(100);
  x = await s.state();
  check(x.disabled === true && s.st.ga === 1, 'privacy policy: Google consent is evaluated, GA still stays off there');
  await s.ctx.close();
}
await browser.close(); srv.close();
console.log(fail ? `${fail} consent check(s) failed` : 'consent checks passed');
process.exit(fail ? 1 : 0);
