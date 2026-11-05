// Interim statistics window ("stats note") in docs/assets/js/site.js.
// Runs the real module in Node against a small stubbed DOM, a stubbed Google CMP and a manual clock for
// setTimeout, so "after 3 s" can be checked without waiting.
import test from 'node:test';
import assert from 'node:assert/strict';

const KEY = 'ssc-stats';
const GA_OFF = 'ga-disable-G-T00HRG2YVF';
const HOST = 'www.smallspacecompass.com';
const MONTH = 30 * 864e5;

// ---------- tiny DOM ----------
class Node {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.parentNode = null; this.listeners = {}; this.hidden = false; this._text = ''; this.style = { props: {}, setProperty(k, v) { this.props[k] = v; } }; this.offsetHeight = 260; const cls = new Set(); this.classList = { add: (c) => cls.add(c), remove: (c) => cls.delete(c), contains: (c) => cls.has(c) }; }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  appendChild(n) { n.parentNode = this; this.children.push(n); return n; }
  insertBefore(n, ref) { n.parentNode = this; const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(n); else this.children.splice(i, 0, n); return n; }
  get nextSibling() { const p = this.parentNode; if (!p) return null; return p.children[p.children.indexOf(this) + 1] || null; }
  get textContent() { return this.tagName === '#TEXT' ? this._text : this._text + this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this._text = String(v); this.children = []; }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  fire(t, ev = {}) { const e = { preventDefault() { e.prevented = true; }, ...ev }; (this.listeners[t] || []).forEach((f) => f(e)); return e; }
  click() { this.fire('click'); }
  focus() { doc.activeElement = this; }
  all() { return [this, ...this.children.flatMap((c) => c.all())]; }
  find(fn) { return this.all().find(fn) || null; }
}
let doc;

function makePage({ stats, tcfapi = true, gpc = false, stored, storage = 'ok', cookies = [], ads = 'yes', gpp } = {}) {
  const store = new Map();
  if (stored !== undefined) store.set(KEY, typeof stored === 'string' ? stored : JSON.stringify(stored));
  const jar = new Map(cookies.map(([name, domain]) => [`${name}|${domain || ''}`, '1']));
  const calls = [], scripts = [], timers = [];
  let clock = 0, tcfListener = null;
  const body = new Node('body');
  const skip = new Node('a'); skip.setAttribute('class', 'skip'); body.appendChild(skip);
  const settingsBtn = new Node('button'); settingsBtn.setAttribute('data-privacy-settings', ''); body.appendChild(settingsBtn);
  doc = {
    documentElement: { dataset: { ads, ...(stats ? { stats } : {}) } },
    body, head: { appendChild: (s) => scripts.push(s.src) }, activeElement: null,
    createElement: (t) => new Node(t),
    createTextNode: (t) => { const n = new Node('#text'); n._text = String(t); return n; },
    querySelector: (sel) => (sel === '.skip' ? skip
      : sel.includes('adsbygoogle') && scripts.some((s) => /adsbygoogle/.test(s)) ? {}
        : sel.includes('fundingchoicesmessages') && scripts.some((s) => /fundingchoicesmessages/.test(s)) ? {} : null),
    querySelectorAll: (sel) => (sel === '[data-privacy-settings]' ? [settingsBtn] : []),
    get cookie() { return [...jar.keys()].map((k) => k.split('|')[0] + '=1').join('; '); },
    set cookie(v) {
      const [pair, ...attrs] = v.split(';').map((x) => x.trim());
      const name = pair.split('=')[0];
      const dom = (attrs.find((a) => a.startsWith('domain=')) || '').replace('domain=', '').replace(/^\./, '');
      if (attrs.includes('max-age=0')) jar.delete(`${name}|${dom}`); else jar.set(`${name}|${dom}`, '1');
    }
  };
  const ls = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { if (storage === 'full') throw new Error('QuotaExceeded'); store.set(k, String(v)); },
    removeItem: (k) => store.delete(k)
  };
  const win = {
    navigator: { globalPrivacyControl: gpc },
    location: { hostname: HOST },
    gtag: (...a) => calls.push(a),
    googlefc: {
      callbackQueue: [],
      getGoogleConsentModeValues: () => win.cmValues,
      usstatesoptout: { getInitialUsStatesOptOutStatus: () => win.usStatus },
      showRevocationMessage: () => calls.push(['revocation'])
    },
    cmValues: { adStoragePurposeConsentStatus: 0, adUserDataPurposeConsentStatus: 0, adPersonalizationPurposeConsentStatus: 0, analyticsStoragePurposeConsentStatus: 0 },
    usStatus: 0,
    setTimeout: (f, ms) => { timers.push({ f, at: clock + (ms || 0) }); return timers.length; }
  };
  if (gpp) win.__gpp = gpp;
  if (storage === 'blocked') Object.defineProperty(win, 'localStorage', { get() { throw new Error('SecurityError'); } });
  else win.localStorage = ls;
  if (tcfapi) win.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') tcfListener = cb; };
  globalThis.window = win; globalThis.document = doc; globalThis.matchMedia = () => ({ matches: false });
  const runQueue = () => {
    for (const item of win.googlefc.callbackQueue.splice(0)) {
      if (typeof item === 'function') item();
      else for (const k of ['CONSENT_API_READY', 'CONSENT_MODE_DATA_READY', 'INITIAL_US_STATES_OPT_OUT_DATA_READY']) if (item[k]) item[k]();
    }
  };
  const tick = (ms) => {
    clock += ms;
    for (let t; (t = timers.filter((x) => x.at <= clock).sort((a, b) => a.at - b.at)[0]);) { timers.splice(timers.indexOf(t), 1); t.f(); }
  };
  return {
    win, doc, store, jar, calls, scripts, settingsBtn, runQueue, tick,
    tcf: (tc) => tcfListener && tcfListener(tc, true),
    note: () => body.find((n) => n.id === 'ssc-stats'),
    shown() { const n = this.note(); return !!n && !n.hidden; },
    button: (label) => body.find((n) => n.tagName === 'BUTTON' && n.textContent === label && n.parentNode && !n.parentNode.hidden),
    updates: () => calls.filter((c) => c[0] === 'consent' && c[1] === 'update').map((c) => c[2]),
    gaScripts: () => scripts.filter((s) => /googletagmanager\.com\/gtag\/js/.test(s)).length,
    cookieNames: () => [...jar.keys()].map((k) => k.split('|')[0])
  };
}
let n = 0;
async function load(opts) {
  const p = makePage(opts);
  const mod = await import(`../docs/assets/js/site.js?stats=${++n}`);
  if (!(opts && opts.noCmpYet)) p.runQueue();                 // noCmpYet: no Google script on the page, queue waits
  return Object.assign(p, { mod });
}
const HIDDEN = { gdprApplies: true, eventStatus: 'cmpuishown', displayStatus: 'hidden' };
const GA_COOKIES = [['_ga', 'smallspacecompass.com'], ['_ga_T00HRG2YVF', 'smallspacecompass.com'], ['_ga', ''], ['_ga_T00HRG2YVF', HOST], ['keep', '']];
const AD_KEYS = ['ad_storage', 'ad_user_data', 'ad_personalization'];

test('CMP loads but shows no message (displayStatus hidden): window appears after 3 s, not before', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(2900);
  assert.equal(p.shown(), false);
  p.tick(200);
  assert.equal(p.shown(), true);
  const note = p.note();
  assert.equal(note.getAttribute('role'), 'dialog');
  assert.equal(note.getAttribute('aria-modal'), 'false');
  assert.equal(note.find((x) => x.id === 'ssc-stats-title').getAttribute('tabindex'), '-1');
  assert.match(note.textContent, /statistics only/i);
  assert.match(note.textContent, /not consent to advertising/);
  assert.ok(note.find((x) => x.tagName === 'A' && x.getAttribute('href') === '/privacy/#interim-statistics'));
  assert.equal(p.win[GA_OFF], true, 'no choice yet: GA off');
  assert.equal(p.gaScripts(), 0);
  p.tick(100);
  assert.match(p.doc.body.find((x) => x.id === 'ssc-stats-live').textContent, /Statistics question/);
});

test('displayStatus "disabled" and a missing __tcfapi also lead to the window', async () => {
  const a = await load();
  a.tcf({ ...HIDDEN, displayStatus: 'disabled' });
  a.tick(3000);
  assert.equal(a.shown(), true);
  const b = await load({ tcfapi: false });
  b.tick(3000);
  assert.equal(b.shown(), true);
});

test('no window when Google decides, shows its message or says the GDPR does not apply', async () => {
  for (const tc of [
    { gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: {} }, vendor: { consents: {} } },
    { gdprApplies: true, eventStatus: 'tcloaded', tcString: 'CQabc', purpose: { consents: {} }, vendor: { consents: {} } },
    { gdprApplies: true, eventStatus: 'cmpuishown', displayStatus: 'visible' },
    { gdprApplies: false, eventStatus: 'tcloaded' }]) {
    const p = await load();
    p.tcf(tc);
    p.tick(5000);
    assert.equal(p.shown(), false, JSON.stringify(tc));
  }
});

test('tcloaded without a tcString is no decision → window', async () => {
  const p = await load();
  p.tcf({ gdprApplies: true, eventStatus: 'tcloaded', tcString: '' });
  p.tick(3000);
  assert.equal(p.shown(), true);
});

test('Global Privacy Control: no window, no GA – also with a stored "granted"', async () => {
  const p = await load({ gpc: true, stored: { v: 1, choice: 'granted', at: Date.now() - 1000 } });
  p.tcf(HIDDEN);
  p.tick(5000);
  assert.equal(p.shown(), false);
  assert.equal(p.gaScripts(), 0);
  assert.equal(p.win[GA_OFF], true);
  p.settingsBtn.click();                                       // on request it explains why nothing is asked
  assert.equal(p.shown(), true);
  assert.match(p.note().textContent, /Global Privacy Control/);
  assert.equal(p.button('Allow'), null);
});

test('Allow: only analytics_storage granted, gtag.js loaded once, signals and ad personalisation off', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(3000);
  const before = p.updates().length;
  p.button('Allow').click();
  assert.equal(p.shown(), false);
  const after = p.updates().slice(before);
  assert.deepEqual(after, [{ analytics_storage: 'granted' }]);
  for (const u of p.updates()) for (const k of AD_KEYS) assert.notEqual(u[k], 'granted', `${k} never granted`);
  assert.equal(p.win[GA_OFF], false);
  assert.equal(p.gaScripts(), 1);
  const cfg = p.calls.find((c) => c[0] === 'config');
  assert.deepEqual(cfg[2], { allow_google_signals: false, allow_ad_personalization_signals: false });
  const rec = JSON.parse(p.store.get(KEY));
  assert.equal(rec.v, 1); assert.equal(rec.choice, 'granted'); assert.equal(typeof rec.at, 'number');
  // opening the settings again and allowing again does not load GA twice
  p.settingsBtn.click();
  assert.equal(p.shown(), true);
  assert.match(p.note().textContent, /current choice: allowed/);
  p.button('Allow').click();
  assert.equal(p.gaScripts(), 1);
});

test('Decline / withdrawal: GA off, analytics denied, _ga and _ga_* deleted on all domain variants', async () => {
  const p = await load({ cookies: GA_COOKIES });
  p.tcf(HIDDEN);
  p.tick(3000);
  p.button('Allow').click();
  assert.equal(p.win[GA_OFF], false);
  p.settingsBtn.click();
  assert.equal(p.doc.activeElement.id, 'ssc-stats-title', 'focus moves to the heading when opened on request');
  p.button('Decline').click();
  assert.equal(p.win[GA_OFF], true);
  assert.deepEqual(p.updates().pop(), { analytics_storage: 'denied' });
  assert.deepEqual(p.cookieNames(), ['keep']);
  assert.equal(JSON.parse(p.store.get(KEY)).choice, 'denied');
  assert.equal(p.doc.activeElement, p.settingsBtn, 'focus returns to the opener');
});

test('× and Escape store nothing and are not consent', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(3000);
  p.note().find((x) => x.getAttribute('class') === 'statnote-x').click();
  assert.equal(p.shown(), false);
  assert.equal(p.store.has(KEY), false);
  assert.equal(p.win[GA_OFF], true);
  p.settingsBtn.click();
  const e = p.note().fire('keydown', { key: 'Escape' });
  assert.ok(e.prevented);
  assert.equal(p.shown(), false);
  assert.equal(p.store.has(KEY), false);
  assert.equal(p.gaScripts(), 0);
});

test('stored "granted" measures without asking; stored "denied" deletes _ga already at load', async () => {
  const a = await load({ stored: { v: 1, choice: 'granted', at: Date.now() - 5 * MONTH } });
  a.tcf(HIDDEN);
  a.tick(3000);
  assert.equal(a.shown(), false);
  assert.equal(a.gaScripts(), 1);
  assert.equal(a.win[GA_OFF], false);
  const b = await load({ stored: { v: 1, choice: 'denied', at: Date.now() - 1000 }, cookies: GA_COOKIES });
  assert.deepEqual(b.cookieNames(), ['keep'], 'deleted before the 3 s have passed');
  b.tcf(HIDDEN);
  b.tick(3000);
  assert.equal(b.shown(), false);
  assert.equal(b.gaScripts(), 0);
});

test('after 12 months, with a future time stamp, another version or junk: ask again', async () => {
  const now = Date.now();
  for (const stored of [{ v: 1, choice: 'granted', at: now - 13 * MONTH }, { v: 1, choice: 'granted', at: now + 864e5 },
    { v: 2, choice: 'granted', at: now - 1000 }, { v: 1, choice: 'yes', at: now }, '{broken']) {
    const p = await load({ stored });
    p.tcf(HIDDEN);
    p.tick(3000);
    assert.equal(p.shown(), true, JSON.stringify(stored));
    assert.equal(p.gaScripts(), 0);
  }
  const p = await load();
  assert.equal(p.mod.readStats(JSON.stringify({ v: 1, choice: 'denied', at: now - 11 * MONTH }), now).choice, 'denied');
  assert.equal(p.mod.readStats(JSON.stringify({ v: 1, choice: 'denied', at: now - 12.5 * MONTH }), now), null);
});

test('blocked or full localStorage throws nothing; the choice holds for the page view', async () => {
  for (const storage of ['blocked', 'full']) {
    const p = await load({ storage, cookies: GA_COOKIES });
    p.tcf(HIDDEN);
    assert.doesNotThrow(() => p.tick(3000));
    assert.equal(p.shown(), true);
    assert.doesNotThrow(() => p.button('Allow').click());
    assert.equal(p.gaScripts(), 1);
    p.settingsBtn.click();
    assert.doesNotThrow(() => p.button('Decline').click());
    assert.equal(p.win[GA_OFF], true);
    assert.deepEqual(p.cookieNames(), ['keep']);
  }
});

test('late Google decision has priority: window closes, own choice deleted, Google "no" deletes _ga', async () => {
  const p = await load({ cookies: GA_COOKIES });
  p.tcf(HIDDEN);
  p.tick(3000);
  p.button('Allow').click();
  assert.equal(p.win[GA_OFF], false);
  p.settingsBtn.click();
  assert.equal(p.shown(), true);
  p.tcf({ gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQno', purpose: { consents: {} }, vendor: { consents: {} } });
  assert.equal(p.shown(), false, 'window closed');
  assert.equal(p.store.has(KEY), false, 'own choice deleted');
  assert.equal(p.win[GA_OFF], true, 'Google says no → GA off');
  assert.equal(p.updates().pop().analytics_storage, 'denied');
  assert.deepEqual(p.cookieNames(), ['keep']);
  p.settingsBtn.click();                                       // from now on "Privacy settings" opens Google's message
  p.runQueue();
  assert.equal(p.shown(), false);
  assert.ok(p.calls.some((c) => c[0] === 'revocation'));
});

test('Google "no" deletes _ga even if the window was never active; Google "yes" overrides a stored "denied"', async () => {
  const a = await load({ cookies: GA_COOKIES });
  a.tcf({ gdprApplies: true, eventStatus: 'tcloaded', tcString: 'CQno', purpose: { consents: { 1: true } }, vendor: { consents: {} } });
  assert.deepEqual(a.cookieNames(), ['keep']);
  const b = await load({ stored: { v: 1, choice: 'denied', at: Date.now() - 1000 } });
  b.win.cmValues = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
  b.tick(3000);                                                // no CMP signal yet → window phase with stored "denied"
  assert.equal(b.win[GA_OFF], true);
  b.tcf({ gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQyes', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } });
  assert.equal(b.store.has(KEY), false);
  assert.equal(b.win[GA_OFF], false, 'only Google decides now');
  assert.equal(b.gaScripts(), 1);
});

test('gdprApplies false later: window closes, own choice deleted, existing non-EU logic applies', async () => {
  const p = await load({ stored: { v: 1, choice: 'granted', at: Date.now() - 1000 } });
  p.tick(3000);
  assert.equal(p.win[GA_OFF], false);
  p.win.usStatus = 3;                                          // U.S. opt-out reported by the CMP
  p.tcf({ gdprApplies: false, eventStatus: 'tcloaded' });
  assert.equal(p.store.has(KEY), false);
  assert.equal(p.win[GA_OFF], true);
});

test('U.S. opt-out through GPP keeps GA off while the window decides', async () => {
  const g = (cmd, cb) => { if (cmd === 'addEventListener') g.cb = cb; };
  const p = await load({ gpp: g, stored: { v: 1, choice: 'granted', at: Date.now() - 1000 } });
  p.tcf(HIDDEN);
  p.tick(3000);
  assert.equal(p.win[GA_OFF], false);
  g.cb({ pingData: { signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: { SaleOptOut: 1, SharingOptOut: 1, TargetedAdvertisingOptOut: 1 } } } }, true);
  assert.equal(p.win[GA_OFF], true);
  assert.equal(p.updates().pop().analytics_storage, 'denied');
});

test('imprint / privacy / 404 (data-stats="off"): no window by itself, never GA; "Privacy settings" opens the window', async () => {
  const p = await load({ stats: 'off', ads: 'no', stored: { v: 1, choice: 'granted', at: Date.now() - 1000 } });
  p.tcf(HIDDEN);
  p.tick(5000);
  assert.equal(p.shown(), false);
  assert.equal(p.gaScripts(), 0);
  assert.equal(p.win[GA_OFF], true);
  p.settingsBtn.click();
  assert.equal(p.shown(), true);
  assert.match(p.note().textContent, /current choice: allowed/);
  assert.match(p.note().textContent, /This page itself never loads Google Analytics/);
  assert.equal(p.scripts.filter((s) => /adsbygoogle/.test(s)).length, 0, 'no ad script loaded for the window');
  p.button('Decline').click();
  assert.equal(JSON.parse(p.store.get(KEY)).choice, 'denied');
  assert.equal(p.gaScripts(), 0);
  // with Google consent granted on such a page GA still does not load
  const q = await load({ stats: 'off', ads: 'no' });
  q.win.cmValues = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
  q.tcf({ gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQyes', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } });
  assert.equal(q.gaScripts(), 0);
  assert.equal(q.win[GA_OFF], true);
});

test('GA events only when GA is switched on', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(3000);
  p.mod.track('test_event');
  assert.equal(p.calls.filter((c) => c[0] === 'event').length, 0);
  p.button('Allow').click();
  p.mod.track('test_event');
  assert.equal(p.calls.filter((c) => c[0] === 'event').length, 1);
});

test('cmpSpoke / cmpDecided classify TCF data as specified', async () => {
  const { mod } = await load();
  assert.equal(mod.cmpSpoke(null), false);
  assert.equal(mod.cmpSpoke(HIDDEN), false);
  assert.equal(mod.cmpSpoke({ ...HIDDEN, displayStatus: 'disabled' }), false);
  assert.equal(mod.cmpSpoke({ gdprApplies: true, eventStatus: 'tcloaded' }), false);
  assert.equal(mod.cmpSpoke({ gdprApplies: true, eventStatus: 'cmpuishown', displayStatus: 'visible' }), true);
  assert.equal(mod.cmpSpoke({ gdprApplies: false }), true);
  assert.equal(mod.cmpDecided({ eventStatus: 'tcloaded', tcString: 'x' }), true);
  assert.equal(mod.cmpDecided({ eventStatus: 'cmpuishown', displayStatus: 'visible' }), false);
});

const GOOGLE_BTN = 'Open Google\u2019s ad & U.S. privacy choices';
test('mandatory pages: the window offers Google\'s choices; a click loads only the Funding Choices script, then Google decides', async () => {
  const p = await load({ stats: 'off', ads: 'no', tcfapi: false, noCmpYet: true });
  p.tick(5000);
  assert.equal(p.shown(), false);
  p.settingsBtn.click();
  assert.equal(p.shown(), true);
  const btn = p.button(GOOGLE_BTN);
  assert.ok(btn && !btn.hidden, 'button visible when opened through "Privacy settings"');
  assert.equal(p.scripts.length, 0, 'nothing loaded before the click');
  btn.click();
  assert.equal(p.shown(), false);
  assert.deepEqual(p.scripts, ['https://fundingchoicesmessages.google.com/i/pub-7811071715414905?ers=1']);
  assert.equal(p.scripts.filter((x) => /adsbygoogle/.test(x)).length, 0, 'never the ad script');
  // the consent script arrives: queue runs, TCF listener attached, revocation message opened
  p.win.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') p.win.__l = cb; };
  p.runQueue();
  assert.ok(p.calls.some((c) => c[0] === 'revocation'));
  p.win.cmValues = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
  p.win.__l({ gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQyes', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } }, true);
  assert.equal(p.gaScripts(), 0, 'GA stays off on mandatory pages');
  assert.equal(p.win[GA_OFF], true);
  const before = p.calls.filter((c) => c[0] === 'revocation').length;
  p.settingsBtn.click(); p.runQueue();                         // Google has spoken: footer link now opens Google directly
  assert.equal(p.shown(), false);
  assert.equal(p.calls.filter((c) => c[0] === 'revocation').length, before + 1);
  assert.equal(p.scripts.length, 1, 'consent script not loaded twice');
});

test('the Google-choices button is not offered on normal pages or when the window opens by itself', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(3000);
  assert.equal(p.shown(), true);
  assert.equal(p.button(GOOGLE_BTN).hidden, true);
  p.settingsBtn.click();
  assert.equal(p.button(GOOGLE_BTN).hidden, true);
});

test('"Privacy settings" in the first 3 s with a silent CMP: window at once, no Google call, no second window later', async () => {
  const p = await load();
  p.tcf(HIDDEN);
  p.tick(1000);
  p.settingsBtn.click();
  p.runQueue();
  assert.equal(p.shown(), true);
  assert.equal(p.doc.activeElement.id, 'ssc-stats-title');
  assert.equal(p.calls.filter((c) => c[0] === 'revocation').length, 0, 'Google path not used');
  assert.equal(p.scripts.length, 0);
  p.note().fire('keydown', { key: 'Escape' });
  p.tick(5000);
  assert.equal(p.shown(), false, 'timer does not open the window again');
  assert.equal(p.doc.body.all().filter((x) => x.id === 'ssc-stats').length, 1);
});

test('"Privacy settings" in the first 3 s after Google has spoken: Google decides, no window', async () => {
  const p = await load();
  p.tcf({ gdprApplies: true, eventStatus: 'tcloaded', tcString: 'CQyes', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } });
  p.tick(500);
  p.settingsBtn.click();
  p.runQueue();
  assert.equal(p.calls.filter((c) => c[0] === 'revocation').length, 1);
  p.tick(5000);
  assert.equal(p.shown(), false);
});

test('U.S. opt-out through GPP after Allow deletes the GA cookies', async () => {
  const g = (cmd, cb) => { if (cmd === 'addEventListener') g.cb = cb; };
  const p = await load({ gpp: g, cookies: GA_COOKIES });
  p.tcf(HIDDEN);
  p.tick(3000);
  p.button('Allow').click();
  assert.equal(p.win[GA_OFF], false);
  g.cb({ pingData: { signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: { SaleOptOut: 1, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 } } } }, true);
  assert.equal(p.win[GA_OFF], true);
  assert.deepEqual(p.cookieNames(), ['keep']);
});

test('Global Privacy Control deletes existing GA cookies at load', async () => {
  const p = await load({ gpc: true, cookies: GA_COOKIES });
  assert.deepEqual(p.cookieNames(), ['keep']);
});
