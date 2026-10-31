/* Site runtime: ad slots, consent-gated analytics, privacy-settings link.
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

let gaLoaded = false;
function loadAnalytics() {
  if (gaLoaded) return; gaLoaded = true;
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
}
// GA4 only after TCF purpose 1 + Google (vendor 755) consent, or directly where GDPR does not apply.
function watchConsent(tries = 0) {
  if (typeof window.__tcfapi !== 'function') {
    if (tries < 40) setTimeout(() => watchConsent(tries + 1), 250);
    return;                                // no CMP signal → no analytics
  }
  window.__tcfapi('addEventListener', 2, (tc, ok) => {
    if (!ok || !tc) return;
    if (tc.gdprApplies === false) return loadAnalytics();
    if (tc.eventStatus !== 'tcloaded' && tc.eventStatus !== 'useractioncomplete') return;
    const p1 = tc.purpose && tc.purpose.consents && tc.purpose.consents[1];
    const v = tc.vendor && tc.vendor.consents && tc.vendor.consents[GOOGLE_VENDOR_ID];
    if (p1 && v) loadAnalytics();
  });
}

function privacyLinks() {
  document.querySelectorAll('[data-privacy-settings]').forEach((b) => b.addEventListener('click', () => {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
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
