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
  const tc = (status) => ({ gdprApplies: gdpr, eventStatus: status, purpose: { consents: dec() === 'accept' ? { 1: true } : {} }, vendor: { consents: dec() === 'accept' ? { 755: true } : {} } });
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

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) fail++; };
async function session(cfg) {
  const ctx = await browser.newContext();
  const st = { ga: 0 };
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => {
    const u = r.request().url();
    if (/adsbygoogle\.js/.test(u)) return r.fulfill({ contentType: 'text/javascript', body: STUB });
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
await browser.close(); srv.close();
console.log(fail ? `${fail} consent check(s) failed` : 'consent checks passed');
process.exit(fail ? 1 : 0);
