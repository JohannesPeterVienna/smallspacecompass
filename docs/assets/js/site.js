/* Site runtime: ad slots, Consent Mode v2 + CMP-gated analytics, privacy-settings link.
   Written for smallspacecompass.com. Slot IDs stay empty until AdSense units exist;
   an empty ID means the slot is not rendered and no space is reserved. */
const ADSENSE = {
  client: 'ca-pub-7811071715414905',
  slots: { leader: '', side: '', inline: '' }
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
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { box.classList.remove('on'); }
  });
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
const US_DOES_NOT_APPLY = 1, US_NOT_OPTED_OUT = 2;
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

let gaLoaded = false;
function loadAnalytics() {
  if (gaLoaded) return; gaLoaded = true;
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', GA_ID);
}
function readConsentMode() {
  try {
    const fc = window.googlefc;
    return fc && typeof fc.getGoogleConsentModeValues === 'function' ? fc.getGoogleConsentModeValues() || null : null;
  } catch (e) { return null; }                               // CMP API failure → denied
}
function applyConsent() {
  // a clear TCF "no" is decided without asking any further CMP API
  const cm = consent.cmReady && tcfSignal(consent.tc) !== 'no' ? readConsentMode() : null;
  // a later U.S. opt-out through GPP keeps everything denied for the rest of the page view
  const d = consent.gppOptOut
    ? { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }
    : decideConsent({ tc: consent.tc, cm, usOptOut: consent.usOptOut });
  const allowed = d.analytics_storage === 'granted';
  window['ga-disable-' + GA_ID] = !allowed;
  const key = JSON.stringify(d);
  if (key !== consent.last) { consent.last = key; gtag('consent', 'update', d); }
  if (allowed) loadAnalytics();
}
// Later U.S. opt-outs through the IAB GPP API of Google's CMP. Missing API or a failed call: nothing changes.
let gppWatching = false;
function onGppData(pd) {
  let out;
  try { out = gppUsOptOut(pd); } catch (e) { out = true; }
  if (out === true && !consent.gppOptOut) { consent.gppOptOut = true; applyConsent(); }
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
   can always be withdrawn. */
const US_OPTED_OUT = 3;
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
    if ((status === notOptedOut || status === optedOut) && !gdpr) {
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
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    // withdrawing: deny and disable at once; the CMP then reports the new decision through the listeners above
    const before = { tc: consent.tc, cmReady: consent.cmReady };
    consent.tc = null; consent.cmReady = false; applyConsent();
    window.googlefc.callbackQueue.push(() => {
      try { openPrivacyChoice(before); } catch (e) { /* CMP not available */ }
    });
    // pages without ads do not load the ad script up front; load it only when the visitor asks for the consent tool
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const s = document.createElement('script');
      s.async = true; s.crossOrigin = 'anonymous';
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE.client;
      document.head.appendChild(s);
    }
  }));
}

privacyLinks();
fillSlots();
watchConsent();
