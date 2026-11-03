// "Privacy settings" link: U.S. opt-out dialog where a U.S. state law applies, consent message elsewhere.
// Runs docs/assets/js/site.js in Node against a stubbed DOM and a stubbed Google CMP (googlefc).
import test from 'node:test';
import assert from 'node:assert/strict';

let n = 0;
async function loadPage(usStatus, { withEnum = true } = {}) {
  const calls = [], updates = [];
  let onClick = null, tcfListener = null;
  const us = {
    getInitialUsStatesOptOutStatus: () => us.status,
    openConfirmationDialog: (cb) => { calls.push('usDialog'); us.answer = cb; },
    status: usStatus
  };
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
  globalThis.document = {
    documentElement: { dataset: { ads: 'no' } },
    querySelectorAll: (sel) => (sel === '[data-privacy-settings]' ? [{ addEventListener: (ev, fn) => { onClick = fn; } }] : []),
    querySelector: (sel) => (sel.includes('adsbygoogle') && scripts.some((s) => /adsbygoogle/.test(s.src)) ? {} : null),
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s) }
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
  tcfListener({ gdprApplies: false, eventStatus: 'tcloaded' }, true);   // visitor outside the GDPR
  return { calls, us, scripts, runQueue, click: () => onClick(), last: () => updates[updates.length - 1] };
}

test('U.S. state law applies: opt-out dialog instead of the EU message; opting out keeps everything denied', async () => {
  const p = await loadPage(2);
  assert.equal(p.last().analytics_storage, 'granted');
  p.click();
  assert.equal(p.last().analytics_storage, 'denied', 'withdrawn at once on click');
  assert.ok(p.scripts.some((s) => /adsbygoogle\.js/.test(s.src)), 'ad/CMP script loaded on demand');
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

test('CMP without the U.S. opt-out API: the consent message opens', async () => {
  const p = await loadPage(1);
  delete p.us.getInitialUsStatesOptOutStatus;
  p.click(); p.runQueue();
  assert.deepEqual(p.calls, ['revocation']);
});
