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
   Enum values: developers.google.com/funding-choices/fc-api-docs */
const CM = { UNKNOWN: 0, GRANTED: 1, DENIED: 2, NOT_APPLICABLE: 3, NOT_CONFIGURED: 4 };
const US_DOES_NOT_APPLY = 1, US_NOT_OPTED_OUT = 2;
const gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
const consent = { tc: null, cmReady: false, usOptOut: null, last: '' };

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
  const d = decideConsent({ tc: consent.tc, cm, usOptOut: consent.usOptOut });
  const allowed = d.analytics_storage === 'granted';
  window['ga-disable-' + GA_ID] = !allowed;
  const key = JSON.stringify(d);
  if (key !== consent.last) { consent.last = key; gtag('consent', 'update', d); }
  if (allowed) loadAnalytics();
}
function watchConsent() {
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => {
      if (typeof window.__tcfapi === 'function') window.__tcfapi('addEventListener', 2, (tc, ok) => {
        consent.tc = ok ? tc : null;
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
    }
  });
  applyConsent();                                            // start from the denied state
}

function privacyLinks() {
  document.querySelectorAll('[data-privacy-settings]').forEach((b) => b.addEventListener('click', () => {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    // withdrawing: deny and disable at once; the CMP then reports the new decision through the listeners above
    consent.tc = null; consent.cmReady = false; applyConsent();
    window.googlefc.callbackQueue.push(() => window.googlefc.showRevocationMessage());
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
