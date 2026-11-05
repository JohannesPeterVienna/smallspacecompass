/* Site runtime: ad slots, Consent Mode v2 + CMP-gated analytics, interim statistics window,
   privacy-settings link. Written for smallspacecompass.com. Slot IDs stay empty until AdSense units exist;
   an empty ID means the slot is not rendered and no space is reserved. */
const ADSENSE = {
  client: 'ca-pub-7811071715414905',
  // Shared responsive AdSense units “Themen-Websites – …” (created 17 Oct 2026)
  slots: { leader: '7497607759', side: '1292301217', inline: '1292301217' }
};
const GA_ID = 'G-T00HRG2YVF';
const GOOGLE_VENDOR_ID = 755;

const page = document.documentElement.dataset;
const adsAllowed = page.ads === 'yes';

function fillSlots() {
  if (!adsAllowed) return;
  document.querySelectorAll('.ad[data-slot]').forEach((box) => {
    const id = ADSENSE.slots[box.dataset.slot];
    if (!id) return;                      // no unit configured → nothing rendered, no gap reserved
    if (box.dataset.slot === 'side' && !matchMedia('(min-width:1100px)').matches) return;
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle slot';
    ins.dataset.adClient = ADSENSE.client;
    ins.dataset.adSlot = id;
    ins.style.display = 'block';
    box.appendChild(ins);
    box.classList.add('on');
    watchFill(box, ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { box.classList.remove('on'); }
  });
}

// Fallback for browsers without :has(): the slot only opens (.ad-filled, see site.css) once Google
// marks its ins with data-ad-status="filled"; "unfilled" or no answer keeps it collapsed.
function watchFill(box, ins) {
  if (!(window.CSS && CSS.supports && CSS.supports('selector(:has(a))'))) document.documentElement.classList.add('no-has-support');
  const sync = () => box.classList.toggle('ad-filled', ins.getAttribute('data-ad-status') === 'filled');
  sync();
  if (typeof MutationObserver === 'function') new MutationObserver(sync).observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
}

/* ---------- consent ----------
   Consent Mode v2 defaults (everything denied, GA disabled) are set by an inline script in <head>
   before any Google tag loads. This module only ever moves a purpose to "granted" when the Google CMP
   (Privacy & messaging) reports it as granted:
   - GDPR applies (or is not stated as false): TCF purpose 1 + Google vendor 755 consent AND the CMP's
     Consent Mode value GRANTED (1).
   - GDPR does not apply (gdprApplies === false): the CMP's Consent Mode value GRANTED (1) or
     NOT_APPLICABLE (3) AND the CMP has reported the U.S. state status as DOES_NOT_APPLY (1) or
     NOT_OPTED_OUT (2); UNKNOWN/not yet reported, OPTED_OUT (3) or an API error → nothing granted.
   Missing, UNKNOWN (0), DENIED (2), NOT_CONFIGURED (4), a missing CMP or an exception from any CMP API
   never become "granted". A clear TCF "no" switches GA off at once, before any other CMP API is called.
   A U.S. opt-out made later in the page view arrives through the IAB GPP API (__gpp addEventListener)
   and denies everything at once (see gppUsOptOut).
   Enum values: developers.google.com/funding-choices/fc-api-docs */
const CM = { UNKNOWN: 0, GRANTED: 1, DENIED: 2, NOT_APPLICABLE: 3, NOT_CONFIGURED: 4 };
const US_DOES_NOT_APPLY = 1, US_NOT_OPTED_OUT = 2, US_OPTED_OUT = 3;
const gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
const consent = { tc: null, cmReady: false, usOptOut: null, gppOptOut: false, last: '' };
let lastTc = null;                                         // latest TCF data the CMP reported

// 'yes' = TCF consent for purpose 1 + vendor 755, 'no' = anything else in the GDPR branch, 'outside' = GDPR does not apply
function tcfSignal(tc) {
  if (!tc) return 'no';
  if (tc.gdprApplies === false) return 'outside';
  const tcfReady = tc.eventStatus === 'tcloaded' || tc.eventStatus === 'useractioncomplete';
  const p1 = !!(tc.purpose && tc.purpose.consents && tc.purpose.consents[1]);
  const v = !!(tc.vendor && tc.vendor.consents && tc.vendor.consents[GOOGLE_VENDOR_ID]);
  return tcfReady && p1 && v ? 'yes' : 'no';
}

export function decideConsent({ tc, cm, usOptOut }) {
  const none = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  const signal = tcfSignal(tc);
  if (signal === 'no' || !cm) return none;
  if (signal === 'outside' && usOptOut !== US_DOES_NOT_APPLY && usOptOut !== US_NOT_OPTED_OUT) return none;
  const ok = signal === 'yes'
    ? (val) => val === CM.GRANTED
    : (val) => val === CM.GRANTED || val === CM.NOT_APPLICABLE;
  return {
    ad_storage: ok(cm.adStoragePurposeConsentStatus) ? 'granted' : 'denied',
    ad_user_data: ok(cm.adUserDataPurposeConsentStatus) ? 'granted' : 'denied',
    ad_personalization: ok(cm.adPersonalizationPurposeConsentStatus) ? 'granted' : 'denied',
    analytics_storage: ok(cm.analyticsStoragePurposeConsentStatus) ? 'granted' : 'denied'
  };
}

/* IAB GPP (spec v1.1) pingData → U.S. opt-out? Section IDs from 6 up are U.S. (6 uspv1, 7 usnat, 8 usca,
   9 usva, 10 usco …). Opt-out fields: 0 = not applicable, 1 = opted out, 2 = did not opt out.
   Returns true  = a U.S. section reports SaleOptOut / SharingOptOut / TargetedAdvertisingOptOut 1 (uspv1:
                   OptOutSale "Y"), or a U.S. section applies but its data cannot be read (fail closed);
           false = no U.S. section applies, or every one clearly reports no opt-out;
           null  = CMP signal not ready yet.
   Only "true" is acted on (deny); this never grants anything. */
const GPP_US_FIELDS = ['SaleOptOut', 'SharingOptOut', 'TargetedAdvertisingOptOut'];
function gppSectionState(sec) {                              // 'out' | 'in' | 'unclear'
  if (typeof sec === 'string') return sec.length === 4 ? (sec[2] === 'Y' ? 'out' : 'in') : 'unclear';   // uspv1 "1YYN"
  let seen = false;
  for (const seg of Array.isArray(sec) ? sec : [sec]) {      // [core, gpc] segments or a single object
    if (!seg || typeof seg !== 'object') continue;
    if (seg.OptOutSale !== undefined) {
      if (seg.OptOutSale === 'Y') return 'out';
      if (seg.OptOutSale !== 'N' && seg.OptOutSale !== '-') return 'unclear';
      seen = true;
    }
    for (const f of GPP_US_FIELDS) {
      const v = seg[f];
      if (v === undefined) continue;
      if (v === 1 || v === '1') return 'out';
      if (typeof v !== 'number') return 'unclear';
      seen = true;
    }
  }
  return seen ? 'in' : 'unclear';
}
export function gppUsOptOut(pd) {
  if (!pd || typeof pd !== 'object') return true;
  if (pd.signalStatus === 'not ready') return null;
  const applies = Array.isArray(pd.applicableSections)
    ? pd.applicableSections.some((id) => typeof id === 'number' && id >= 6) : null;
  if (applies === false) return false;
  const parsed = pd.parsedSections;
  if (!parsed || typeof parsed !== 'object') return true;
  const us = Object.keys(parsed).filter((k) => k.startsWith('us'));
  if (!us.length) return true;                               // U.S. section applies (or list missing) but none parsed
  return us.some((k) => gppSectionState(parsed[k]) !== 'in');
}

/* ---------- interim statistics window ("stats note", since 5 Nov 2026) ----------
   Google's consent message is published but currently reports displayStatus "hidden", so no TCF decision
   ever arrives and analytics never starts. Rules:
   - The note is used only if, STATS_WAIT ms after start, Google's CMP has not "spoken" (see cmpSpoke):
     no __tcfapi at all, or no "useractioncomplete", no "tcloaded" with a tcString, no visible message
     ("cmpuishown" with displayStatus hidden/disabled does not count) and gdprApplies is not false.
   - It asks about statistics only. "Allow" sends Consent Mode { analytics_storage: 'granted' } and loads
     gtag.js once (Google signals and ad personalisation off); ad_storage, ad_user_data and
     ad_personalization are never sent from here and stay at their "denied" default.
     "Decline", "×", Escape or no choice: analytics stays denied. Decline/withdrawal also deletes _ga/_ga_*.
   - Stored in localStorage "ssc-stats" as { v, choice, at }; asked again after 12 months; a time stamp in
     the future, another version or a blocked storage count as "no choice".
   - Google's CMP has priority: once it speaks, the note closes for good (phase "retired"); a real decision
     or gdprApplies === false also deletes the stored note choice; a Google "no" for analytics deletes the
     GA cookies, whether or not the note was ever used.
   - Global Privacy Control, a U.S. opt-out (initial status or GPP) → no analytics, the note is not pushed.
   - Pages marked data-stats="off" (imprint, privacy policy, 404) never load Google Analytics; there the
     note only opens through "Privacy settings", so a choice made in it can be seen and withdrawn. */
const STATS_KEY = 'ssc-stats', STATS_V = 1, STATS_WAIT = 3000, STATS_MONTHS = 12;
const GA_OFF = 'ga-disable-' + GA_ID;
const gpc = !!(window.navigator && window.navigator.globalPrivacyControl === true);
const statsOff = page.stats === 'off';
// 'waiting' (first ~3 s) | 'active' (the note decides analytics) | 'settings' (data-stats="off" page) | 'retired' (CMP decides)
const stats = { phase: statsOff ? 'settings' : 'waiting', pick: null };

export function readStats(raw, now) {
  let rec;
  try { rec = JSON.parse(raw); } catch (e) { return null; }
  if (!rec || typeof rec !== 'object' || rec.v !== STATS_V) return null;
  if (rec.choice !== 'granted' && rec.choice !== 'denied') return null;
  if (typeof rec.at !== 'number' || !Number.isFinite(rec.at) || rec.at > now) return null;   // future time stamp: discarded
  const renew = new Date(rec.at);
  renew.setMonth(renew.getMonth() + STATS_MONTHS);
  return now < renew.getTime() ? rec : null;
}
function storedStats() {
  let raw = null;
  try { raw = window.localStorage.getItem(STATS_KEY); } catch (e) { /* storage blocked */ }
  return readStats(raw, Date.now());
}
function saveStats(choice) {
  const rec = { v: STATS_V, choice, at: Date.now() };
  try { window.localStorage.setItem(STATS_KEY, JSON.stringify(rec)); } catch (e) { /* blocked: holds for this page view */ }
  return rec;
}
function dropStats() {
  try { window.localStorage.removeItem(STATS_KEY); } catch (e) { /* storage blocked: nothing stored */ }
}

// Has Google's CMP spoken? A real decision, its own message actually on screen, or GDPR clearly not applicable.
export function cmpDecided(tc) {
  return !!tc && (tc.eventStatus === 'useractioncomplete' ||
    (tc.eventStatus === 'tcloaded' && typeof tc.tcString === 'string' && tc.tcString !== ''));
}
export function cmpSpoke(tc) {
  if (!tc) return false;
  const shown = tc.displayStatus === 'visible' ||
    (tc.eventStatus === 'cmpuishown' && tc.displayStatus !== 'hidden' && tc.displayStatus !== 'disabled');
  return tc.gdprApplies === false || cmpDecided(tc) || shown;
}
// a real Google decision that leaves analytics off (TCF data first; Consent Mode only if TCF says yes)
function googleSaysNo(tc) {
  if (!cmpDecided(tc) || tc.gdprApplies === false) return false;
  const p1 = !!(tc.purpose && tc.purpose.consents && tc.purpose.consents[1]);
  const v = !!(tc.vendor && tc.vendor.consents && tc.vendor.consents[GOOGLE_VENDOR_ID]);
  if (!p1 || !v) return true;
  const cm = readConsentMode();
  return !!cm && cm.analyticsStoragePurposeConsentStatus === CM.DENIED;
}

// _ga and _ga_<container> on the host itself and on every parent domain (www.example.com, example.com)
export function eraseGaCookies() {
  let jar = '';
  try { jar = String(document.cookie || ''); } catch (e) { return; }
  const host = String((window.location && window.location.hostname) || '');
  const labels = host.split('.').filter(Boolean);
  const scopes = [''];
  for (let i = 0; i < labels.length - 1; i++) scopes.push('; domain=.' + labels.slice(i).join('.'));
  for (const part of jar.split(';')) {
    const name = part.split('=')[0].trim();
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    for (const scope of scopes) {
      try { document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${scope}`; } catch (e) { /* ignore */ }
    }
  }
}

let gaLoaded = false;
function loadAnalytics() {
  if (gaLoaded) return; gaLoaded = true;
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
}
// Every GA event goes through here: nothing is sent unless analytics is switched on.
export function track(name, params) {
  if (window[GA_OFF] !== false) return;
  try { gtag('event', name, params || {}); } catch (e) { /* ignore */ }
}
// note phase: only analytics_storage is ever updated; a U.S. opt-out, GPC or a data-stats="off" page keep it denied
function applyStats() {
  const allowed = !gpc && !statsOff && !consent.gppOptOut && consent.usOptOut !== US_OPTED_OUT &&
    !!stats.pick && stats.pick.choice === 'granted';
  window[GA_OFF] = !allowed;
  const d = { analytics_storage: allowed ? 'granted' : 'denied' };
  const key = 'stats:' + d.analytics_storage;
  if (key !== consent.last) { consent.last = key; gtag('consent', 'update', d); }
  if (allowed) loadAnalytics();
}
function readConsentMode() {
  try {
    const fc = window.googlefc;
    return fc && typeof fc.getGoogleConsentModeValues === 'function' ? fc.getGoogleConsentModeValues() || null : null;
  } catch (e) { return null; }                               // CMP API failure → denied
}
function applyConsent() {
  if (stats.phase === 'active') { applyStats(); return; }   // interim note decides analytics (ad_* untouched)
  // a clear TCF "no" is decided without asking any further CMP API
  const cm = consent.cmReady && tcfSignal(consent.tc) !== 'no' ? readConsentMode() : null;
  // a later U.S. opt-out through GPP keeps everything denied for the rest of the page view
  const d = consent.gppOptOut
    ? { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }
    : decideConsent({ tc: consent.tc, cm, usOptOut: consent.usOptOut });
  // Global Privacy Control or a page without statistics (imprint, privacy policy, 404): analytics stays off
  if (gpc || statsOff) d.analytics_storage = 'denied';
  const allowed = d.analytics_storage === 'granted';
  window[GA_OFF] = !allowed;
  const key = JSON.stringify(d);
  if (key !== consent.last) { consent.last = key; gtag('consent', 'update', d); }
  if (allowed) loadAnalytics();
}
// Later U.S. opt-outs through the IAB GPP API of Google's CMP. Missing API or a failed call: nothing changes.
let gppWatching = false;
function onGppData(pd) {
  let out;
  try { out = gppUsOptOut(pd); } catch (e) { out = true; }
  if (out === true && !consent.gppOptOut) { consent.gppOptOut = true; applyConsent(); eraseGaCookies(); }   // U.S. opt-out: no GA cookie may linger
}
function watchGpp() {
  if (gppWatching || typeof window.__gpp !== 'function') return;
  try {
    window.__gpp('addEventListener', (evt, ok) => {
      if (!ok) return;
      try {
        if (evt && evt.pingData !== undefined) onGppData(evt.pingData);
        else window.__gpp('ping', (pd, pok) => { if (pok) onGppData(pd); });
      } catch (e) { onGppData(null); }
    });
    gppWatching = true;
  } catch (e) { /* GPP API not usable: keep the current state */ }
}
function watchConsent() {
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => {
      watchGpp();
      if (typeof window.__tcfapi === 'function') window.__tcfapi('addEventListener', 2, (tc, ok) => {
        consent.tc = ok ? tc : null;
        if (ok && tc) lastTc = tc;                           // kept across the click-time withdrawal
        if (ok && tc) onCmpSignal(tc);                       // Google's CMP has priority over the interim note
        // after a new decision in the message the CMP's consent-mode values are current again
        if (ok && tc && tc.eventStatus === 'useractioncomplete' && typeof window.googlefc.getGoogleConsentModeValues === 'function') consent.cmReady = true;
        applyConsent();
      });
    },
    CONSENT_MODE_DATA_READY: () => { consent.cmReady = true; applyConsent(); },
    INITIAL_US_STATES_OPT_OUT_DATA_READY: () => {
      try {
        const u = window.googlefc.usstatesoptout;
        consent.usOptOut = u && typeof u.getInitialUsStatesOptOutStatus === 'function' ? u.getInitialUsStatesOptOutStatus() : null;
      } catch (e) { consent.usOptOut = null; }      // API failure → treated like an opt-out
      applyConsent();
      watchGpp();
    }
  });
  applyConsent();                                            // start from the denied state
}

/* Where the CMP reports that a U.S. state privacy law applies, "Privacy settings" opens Google's U.S.
   opt-out dialog ("Do Not Sell or Share"); everywhere else it reopens the consent message.
   The U.S. dialog opens only for a known U.S. status (NOT_OPTED_OUT or OPTED_OUT) and only when the latest
   TCF data does not say the GDPR applies; UNKNOWN (0) or an EU visitor gets the consent message, so consent
   can always be withdrawn. If the CMP offers no openConfirmationDialog, the consent message opens instead. */
function openPrivacyChoice(before) {
  const fc = window.googlefc;
  const us = fc.usstatesoptout;
  if (us && typeof us.getInitialUsStatesOptOutStatus === 'function') {
    const E = us.InitialUsStatesOptOutStatusEnum || {};
    const notOptedOut = E.NOT_OPTED_OUT !== undefined ? E.NOT_OPTED_OUT : US_NOT_OPTED_OUT;
    const optedOut = E.OPTED_OUT !== undefined ? E.OPTED_OUT : US_OPTED_OUT;
    const tc = lastTc || (before && before.tc);
    const gdpr = !!(tc && tc.gdprApplies === true);
    const status = us.getInitialUsStatesOptOutStatus();
    if ((status === notOptedOut || status === optedOut) && !gdpr && typeof us.openConfirmationDialog === 'function') {
      us.openConfirmationDialog((userDidOptOut) => {
        if (userDidOptOut) {
          consent.usOptOut = US_OPTED_OUT;                    // ad personalisation and analytics stay denied
        } else {
          try { consent.usOptOut = us.getInitialUsStatesOptOutStatus(); } catch (e) { consent.usOptOut = null; }
          // no opt-out: bring back the signals withdrawn on click, unless the CMP has reported new ones meanwhile
          if (consent.tc === null && !consent.cmReady) { consent.tc = before.tc; consent.cmReady = before.cmReady; }
        }
        applyConsent();
      });
      return;
    }
  }
  fc.showRevocationMessage();
}

function privacyLinks() {
  document.querySelectorAll('[data-privacy-settings]').forEach((b) => b.addEventListener('click', () => {
    // interim mode, a page without statistics, or no CMP at all: our own note shows and changes the choice
    // first ~3 s: if Google has already spoken it decides, otherwise the window takes over at once (no second
    // window from the timer, because startStats only acts in the "waiting" phase)
    if (stats.phase === 'waiting') { if (cmpSpoke(lastTc)) retireStats(); else activateStats(); }
    if (stats.phase === 'active' || stats.phase === 'settings') { openNote(b); return; }
    openGoogleChoices();
  }));
}
/* Google's consent message / U.S. opt-out dialog. Withdraws first; the CMP then reports the new decision through
   the listeners in watchConsent (Google has priority). Mandatory pages (data-stats="off") carry no ad code: there
   only Google's consent script (Funding Choices) is loaded, and only on an explicit click – never adsbygoogle.js. */
const FC_SRC = 'https://fundingchoicesmessages.google.com/i/pub-' + ADSENSE.client.replace('ca-pub-', '') + '?ers=1';
function openGoogleChoices() {
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  // withdrawing: deny and disable at once; the CMP then reports the new decision through the listeners above
  const before = { tc: consent.tc, cmReady: consent.cmReady };
  consent.tc = null; consent.cmReady = false; applyConsent();
  window.googlefc.callbackQueue.push(() => {
    try { openPrivacyChoice(before); } catch (e) { /* CMP not available */ }
  });
  // CMP already on the page (static ad loader or loaded before): nothing is loaded, the queued call opens it.
  // Otherwise Google's standard snippet is rebuilt: queue (above) → hidden iframe "googlefcPresent" → consent script.
  // The ad script adsbygoogle.js is never loaded from here.
  if (document.querySelector('script[src*="adsbygoogle.js"]') || document.querySelector('script[src*="fundingchoicesmessages.google.com"]')) return;
  if (!document.querySelector('iframe[name="googlefcPresent"]')) {
    const f = document.createElement('iframe');
    f.setAttribute('name', 'googlefcPresent');
    f.setAttribute('title', 'Google consent presence marker');
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('tabindex', '-1');
    f.style.width = '0'; f.style.height = '0'; f.style.border = 'none'; f.style.zIndex = '-1000';
    f.style.left = '-1000px'; f.style.top = '-1000px'; f.style.display = 'none';
    document.body.appendChild(f);
  }
  const s = document.createElement('script');
  s.async = true; s.src = FC_SRC;
  document.head.appendChild(s);
}

/* ---------- interim statistics window: phases ---------- */
function onCmpSignal(tc) {
  if (cmpSpoke(tc)) retireStats();
  if (cmpDecided(tc) || tc.gdprApplies === false) dropStats();   // only Google's decision counts from now on
  if (googleSaysNo(tc)) eraseGaCookies();                        // also if the note was never used
}
function retireStats() {
  if (stats.phase === 'retired') return;
  stats.phase = 'retired'; stats.pick = null;
  closeNote(false);
}
function activateStats() {
  if (stats.phase !== 'waiting') return;
  stats.phase = 'active';
  stats.pick = storedStats();
  applyConsent();
}
function startStats() {
  if (stats.phase !== 'waiting') return;
  if (cmpSpoke(lastTc)) { retireStats(); return; }
  activateStats();
  const usOut = consent.gppOptOut || consent.usOptOut === US_OPTED_OUT;
  if (!stats.pick && !gpc && !usOut) openNote(null);          // GPC / U.S. opt-out: nothing is pushed
}
function choose(choice) {
  stats.pick = saveStats(choice);
  if (choice === 'denied') {
    window[GA_OFF] = true;
    if (stats.phase !== 'active') gtag('consent', 'update', { analytics_storage: 'denied' });
    eraseGaCookies();
  }
  if (stats.phase === 'active') applyConsent();
  closeNote(true);
  announce(choice === 'granted' ? 'Statistics allowed.' : 'Statistics declined. Google Analytics stays off.');
}

/* ---------- interim statistics window: the note itself (built with DOM calls, no innerHTML) ---------- */
let note = null, noteOpener = null, live = null;
const ui = {};
function h(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const k of Object.keys(attrs || {})) n.setAttribute(k, attrs[k]);
  for (const c of kids) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return n;
}
function announce(msg) {
  try {
    if (!live) { live = h('p', { class: 'sr', 'aria-live': 'polite', id: 'ssc-stats-live' }); document.body.appendChild(live); }
    live.textContent = '';
    window.setTimeout(() => { live.textContent = msg; }, 60);
  } catch (e) { /* no DOM */ }
}
function buildNote() {
  ui.close = h('button', { type: 'button', class: 'statnote-x', 'aria-label': 'Close – statistics stay off', title: 'Close – statistics stay off' }, '×');
  ui.title = h('h2', { id: 'ssc-stats-title', class: 'statnote-title', tabindex: '-1' }, 'Count this visit?');
  ui.text = h('p', { id: 'ssc-stats-text', class: 'statnote-text' });
  ui.now = h('p', { class: 'statnote-now' });
  ui.allow = h('button', { type: 'button', class: 'statnote-pick', 'data-stats-pick': 'granted' }, 'Allow');
  ui.decline = h('button', { type: 'button', class: 'statnote-pick', 'data-stats-pick': 'denied' }, 'Decline');
  ui.picks = h('div', { class: 'statnote-picks' }, ui.allow, ui.decline);
  ui.gpcClose = h('button', { type: 'button', class: 'statnote-pick' }, 'Close');
  ui.gpc = h('div', { class: 'statnote-picks statnote-one' }, ui.gpcClose);
  // mandatory pages only, and only when opened through "Privacy settings": the way to Google's own choices
  ui.google = h('button', { type: 'button', class: 'statnote-google' }, 'Open Google\u2019s ad & U.S. privacy choices');
  const el = h('section', { class: 'statnote', id: 'ssc-stats', role: 'dialog', 'aria-modal': 'false',
    'aria-labelledby': 'ssc-stats-title', 'aria-describedby': 'ssc-stats-text' },
    ui.close, h('p', { class: 'statnote-kicker' }, 'Statistics only · interim notice'), ui.title, ui.text, ui.now, ui.picks, ui.gpc, ui.google);
  el.hidden = true;
  ui.allow.addEventListener('click', () => choose('granted'));
  ui.decline.addEventListener('click', () => choose('denied'));
  ui.close.addEventListener('click', () => closeNote(true));      // closes for now: nothing stored, no consent
  ui.gpcClose.addEventListener('click', () => closeNote(true));
  ui.google.addEventListener('click', () => { closeNote(true); openGoogleChoices(); });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeNote(true); } });
  // Escape also works without focus in the window – unless something else on the page handles Escape itself
  // (an open menu or another dialog, or a handler that already called preventDefault)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !note || note.hidden || e.defaultPrevented) return;
    if (inside(note, e.target)) return;                          // handled by the window's own listener
    const t = e.target;
    if (t && typeof t.closest === 'function' && t.closest('[role="dialog"],dialog[open],[aria-expanded="true"],[aria-modal="true"]')) return;
    e.preventDefault(); closeNote(true);
  });
  const skip = document.querySelector('.skip');                   // early in the tab order, shown fixed at the bottom
  if (skip && skip.parentNode) skip.parentNode.insertBefore(el, skip.nextSibling); else document.body.appendChild(el);
  return el;
}
const longDate = (ms) => new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
function fillNote() {
  const rec = stats.phase === 'settings' ? storedStats() : stats.pick;
  ui.text.textContent = '';
  if (gpc) {
    ui.text.appendChild(document.createTextNode('Your browser sends a Global Privacy Control signal, so Google Analytics stays switched off on this site and we do not ask. '));
    ui.now.textContent = '';
  } else {
    ui.text.appendChild(document.createTextNode('With your permission, Google Analytics (Google Ireland Ltd.) counts which pages and tools are used, with cookies (_ga); data may be processed in the USA. ' +
      'Statistics only – this is not consent to advertising. Kept in this browser for 12 months; change it any time under “Privacy settings”. '));
    const parts = [];
    if (rec) parts.push(`Your current choice: ${rec.choice === 'granted' ? 'allowed' : 'declined'} on ${longDate(rec.at)}.`);
    else if (stats.phase === 'settings') parts.push('No choice saved in this browser yet.');
    if (statsOff) parts.push('This page itself never loads Google Analytics.');
    ui.now.textContent = parts.join(' ');
  }
  ui.text.appendChild(h('a', { href: '/privacy/#interim-statistics' }, 'Privacy policy'));
  ui.picks.hidden = gpc;
  ui.gpc.hidden = !gpc;
  ui.google.hidden = !noteOpener;                     // only when opened through "Privacy settings"
}
function openNote(opener) {
  try {
    if (!note) note = buildNote();
    noteOpener = opener;
    fillNote();
    note.hidden = false;
    document.body.classList.add('stats-open');
    document.body.style.setProperty('--stats-room', note.offsetHeight + 'px');   // the footer stays reachable
    announce('Statistics question shown at the bottom of the page.');
    if (opener) ui.title.focus();                    // opened on request: focus moves in; shown by itself: focus stays
  } catch (e) { /* no DOM: nothing to show */ }
}
function inside(root, n) { for (; n; n = n.parentNode) if (n === root) return true; return false; }
function closeNote(returnFocus) {
  if (!note || note.hidden) return;
  const hadFocus = inside(note, document.activeElement);
  note.hidden = true;
  try {
    document.body.classList.remove('stats-open');
    if (returnFocus && noteOpener && typeof noteOpener.focus === 'function') noteOpener.focus();
    else if (hadFocus) {                               // no opener: focus must not get lost with the hidden window
      const main = document.getElementById('main');
      if (main) { if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1'); main.focus(); }
    }
  } catch (e) { /* ignore */ }
  noteOpener = null;
}

{ const rec = storedStats(); if (gpc || (rec && rec.choice === 'denied')) eraseGaCookies(); }   // GPC or declined earlier: no GA cookie may linger
privacyLinks();
fillSlots();
watchConsent();
if (!statsOff && typeof window.setTimeout === 'function') window.setTimeout(startStats, STATS_WAIT);
