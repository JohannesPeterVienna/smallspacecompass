// "Privacy settings" link: U.S. opt-out dialog where a U.S. state law applies, consent message elsewhere.
// Runs docs/assets/js/site.js in Node against a stubbed DOM and a stubbed Google CMP (googlefc).
import test from 'node:test';
import assert from 'node:assert/strict';

let n = 0;
async function loadPage(usStatus, { withEnum = true, gpp, gdprApplies = false, withDialog = true } = {}) {
  const calls = [], updates = [];
  let onClick = null, tcfListener = null;
  const us = {
    getInitialUsStatesOptOutStatus: () => us.status,
    openConfirmationDialog: (cb) => { calls.push('usDialog'); us.answer = cb; },
    status: usStatus
  };
  if (!withDialog) delete us.openConfirmationDialog;
  if (withEnum) us.InitialUsStatesOptOutStatusEnum = { UNKNOWN: 0, DOES_NOT_APPLY: 1, NOT_OPTED_OUT: 2, OPTED_OUT: 3 };
  const googlefc = {
    callbackQueue: [],
    usstatesoptout: us,
    showRevocationMessage: () => calls.push('revocation'),
    getGoogleConsentModeValues: () => ({ adStoragePurposeConsentStatus: 3, adUserDataPurposeConsentStatus: 3, adPersonalizationPurposeConsentStatus: 3, analyticsStoragePurposeConsentStatus: 3 })
  };
  const scripts = [];
  globalThis.window = {
    googlefc,
    gtag: (...a) => { if (a[0] === 'consent' && a[1] === 'update') updates.push(a[2]); },
    __tcfapi: (cmd, v, cb) => { if (cmd === 'addEventListener') tcfListener = cb; }
  };
  if (gpp) globalThis.window.__gpp = gpp;
  globalThis.document = {
    documentElement: { dataset: { ads: 'no' } },
    querySelectorAll: (sel) => (sel === '[data-privacy-settings]' ? [{ addEventListener: (ev, fn) => { onClick = fn; } }] : []),
    querySelector: (sel) => (sel.includes('adsbygoogle') && scripts.some((s) => /adsbygoogle/.test(s.src)) ? {} : null),
    createElement: () => ({ style: {}, setAttribute(k, v) { this[k] = v; } }),
    head: { appendChild: (s) => scripts.push(s) },
    body: { appendChild: (f) => scripts.push(f) },
    addEventListener: () => {}
  };
  globalThis.matchMedia = () => ({ matches: false });
  await import(`../docs/assets/js/site.js?case=${++n}`);
  const runQueue = () => {
    for (const item of googlefc.callbackQueue.splice(0)) {
      if (typeof item === 'function') item();
      else for (const k of ['CONSENT_API_READY', 'CONSENT_MODE_DATA_READY', 'INITIAL_US_STATES_OPT_OUT_DATA_READY']) if (item[k]) item[k]();
    }
  };
  runQueue();
  // stored decision (tcloaded with a tcString): Google's CMP has spoken, so "Privacy settings" routes to Google
  tcfListener({ gdprApplies, eventStatus: 'tcloaded', tcString: 'CQstub' }, true);
  return { calls, us, scripts, window: globalThis.window, runQueue, click: () => onClick(), last: () => updates[updates.length - 1] };
}

test('U.S. state law applies: opt-out dialog instead of the EU message; opting out keeps everything denied', async () => {
  const p = await loadPage(2);
  assert.equal(p.last().analytics_storage, 'granted');
  p.click();
  assert.equal(p.last().analytics_storage, 'denied', 'withdrawn at once on click');
  assert.ok(p.scripts.some((s) => /fundingchoicesmessages\.google\.com\/i\/pub-7811071715414905\?ers=1/.test(s.src)), 'Google consent script loaded on demand');
  assert.ok(!p.scripts.some((s) => /adsbygoogle\.js/.test(s.src || '')), 'never the ad script');
  p.runQueue();
  assert.deepEqual(p.calls, ['usDialog']);
  p.us.status = 3;
  p.us.answer(true);
  assert.equal(p.last().ad_personalization, 'denied');
  assert.equal(p.last().analytics_storage, 'denied');
});

test('U.S. dialog closed without opting out: previous signals are restored', async () => {
  const p = await loadPage(2, { withEnum: false });                    // no enum object → DOES_NOT_APPLY falls back to 1
  p.click(); p.runQueue();
  assert.deepEqual(p.calls, ['usDialog']);
  p.us.answer(false);
  assert.equal(p.last().analytics_storage, 'granted');
});

test('U.S. state law does not apply: the consent (revocation) message opens', async () => {
  for (const withEnum of [true, false]) {
    const p = await loadPage(1, { withEnum });
    p.click(); p.runQueue();
    assert.deepEqual(p.calls, ['revocation']);
  }
});

test('EU + status 0 (UNKNOWN) → consent (revocation) message, so consent can be withdrawn', async () => {
  for (const withEnum of [true, false]) {
    const p = await loadPage(0, { withEnum, gdprApplies: true });
    p.click(); p.runQueue();
    assert.deepEqual(p.calls, ['revocation']);
  }
});

test('status 0 (UNKNOWN) outside the GDPR → consent message, not the U.S. dialog', async () => {
  const p = await loadPage(0);
  p.click(); p.runQueue();
  assert.deepEqual(p.calls, ['revocation']);
});

test('U.S. status 2 or 3 → U.S. dialog; with gdprApplies → consent message', async () => {
  for (const st of [2, 3]) {
    const p = await loadPage(st);
    p.click(); p.runQueue();
    assert.deepEqual(p.calls, ['usDialog']);
    const q = await loadPage(st, { gdprApplies: true });
    q.click(); q.runQueue();
    assert.deepEqual(q.calls, ['revocation']);
  }
});

test('CMP without the U.S. opt-out API: the consent message opens', async () => {
  const p = await loadPage(1);
  delete p.us.getInitialUsStatesOptOutStatus;
  p.click(); p.runQueue();
  assert.deepEqual(p.calls, ['revocation']);
});

// ---------- later U.S. opt-out through the IAB GPP API (stubbed __gpp) ----------
function gppStub() {
  const g = (cmd, cb) => {
    if (cmd === 'addEventListener') { g.listener = cb; cb({ eventName: 'listenerRegistered', listenerId: 1, data: true, pingData: g.ping }, true); }
    else if (cmd === 'ping') cb(g.ping, true);
  };
  g.ping = { gppVersion: '1.1', cmpStatus: 'loaded', signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: [{ Version: 1, SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 }] } };
  g.fire = (pingData) => g.listener({ eventName: 'signalStatus', listenerId: 1, data: 'ready', pingData }, true);
  g.fireNoPing = () => g.listener({ eventName: 'sectionChange', listenerId: 1, data: 'usnat' }, true);
  return g;
}
const GA_OFF = 'ga-disable-G-T00HRG2YVF';
const ALL_DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };

test('GPP: opt-out after an initial NOT_OPTED_OUT denies everything and switches GA off at once', async () => {
  const g = gppStub();
  const p = await loadPage(2, { gpp: g });
  assert.ok(g.listener, 'GPP listener registered');
  assert.equal(p.last().analytics_storage, 'granted');
  assert.equal(p.window[GA_OFF], false);
  g.fire({ signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: [{ SaleOptOut: 1, SharingOptOut: 1, TargetedAdvertisingOptOut: 1 }, { Gpc: false }] } });
  assert.deepEqual(p.last(), ALL_DENIED);
  assert.equal(p.window[GA_OFF], true);
  g.fire(g.ping);                                            // later "no opt-out" grants nothing again
  assert.deepEqual(p.last(), ALL_DENIED);
});

test('GPP: event without pingData is read through ping; a state section (usca) counts too', async () => {
  const g = gppStub();
  const p = await loadPage(2, { gpp: g });
  g.ping = { signalStatus: 'ready', applicableSections: [8], parsedSections: { usca: { SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 1 } } };
  g.fireNoPing();
  assert.deepEqual(p.last(), ALL_DENIED);
  assert.equal(p.window[GA_OFF], true);
});

test('GPP: no opt-out, no U.S. section or not ready leaves the state unchanged', async () => {
  const g = gppStub();
  const p = await loadPage(2, { gpp: g });
  g.fire({ signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: { SaleOptOut: 0, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 } } });
  g.fire({ signalStatus: 'ready', applicableSections: [-1], parsedSections: {} });
  g.fire({ signalStatus: 'not ready' });
  assert.equal(p.last().analytics_storage, 'granted');
  assert.equal(p.window[GA_OFF], false);
});

test('no GPP API: nothing changes; GPP never grants anything', async () => {
  const p = await loadPage(2);
  assert.equal(p.last().analytics_storage, 'granted');
  const q = await loadPage(0);                               // UNKNOWN initial status stays denied
  assert.equal(q.last().analytics_storage, 'denied');
  const g = gppStub();
  const r = await loadPage(0, { gpp: g });
  g.fire(g.ping);
  assert.equal(r.last().analytics_storage, 'denied');
  assert.equal(r.window[GA_OFF], true);
});

test('GPP: malformed or unreadable data → denied', async () => {
  const bad = ['garbage', null,
    { signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: 'xx' } },
    { signalStatus: 'ready', applicableSections: [7], parsedSections: { usnat: [{ SaleOptOut: 'no' }] } },
    { signalStatus: 'ready', applicableSections: [7] },
    { signalStatus: 'ready', parsedSections: { tcfeuv2: {} } }];
  for (const pd of bad) {
    const g = gppStub();
    const p = await loadPage(2, { gpp: g });
    assert.equal(p.last().analytics_storage, 'granted');
    g.fire(pd);
    assert.deepEqual(p.last(), ALL_DENIED, JSON.stringify(pd));
    assert.equal(p.window[GA_OFF], true);
  }
  const p = await loadPage(0, { gpp: () => { throw new Error('boom'); } });   // throwing API: page keeps working
  assert.equal(p.last().analytics_storage, 'denied');
});

test('U.S. status known but the CMP offers no openConfirmationDialog → consent (revocation) message, no error', async () => {
  for (const status of [2, 3]) {
    const p = await loadPage(status, { withDialog: false });
    assert.equal(typeof p.us.openConfirmationDialog, 'undefined');
    p.click();
    assert.doesNotThrow(() => p.runQueue());
    assert.deepEqual(p.calls, ['revocation']);
  }
});
