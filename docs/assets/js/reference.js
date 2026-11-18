/* Reference table: search, filters, CSV of the visible rows, copy link to a row. The table itself is in the HTML. */
import { REFERENCE, filterRows, referenceCsv } from './refdata.js';

const box = document.querySelector('[data-ref]');
if (box) {
  const $ = (s) => box.querySelector(s);
  const rows = new Map([...box.querySelectorAll('tr[data-id]')].map(tr => [tr.dataset.id, tr]));
  const q = $('[data-ref-q]'), topic = $('[data-ref-topic]'), src = $('[data-ref-src]'), region = $('[data-ref-region]'), count = $('[data-ref-count]'), msg = $('[data-ref-msg]');
  let shown = REFERENCE;
  const say = (t) => { msg.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { msg.textContent = ''; }, 4000); };
  function apply() {
    shown = filterRows(REFERENCE, { q: q.value, topic: topic.value, src: src.value, region: region.value });
    const ids = new Set(shown.map(r => r.id));
    for (const [id, tr] of rows) tr.hidden = !ids.has(id);
    // topic header rows disappear with their last row
    box.querySelectorAll('tbody[data-topic]').forEach(tb => { tb.hidden = !tb.querySelector('tr[data-id]:not([hidden])'); });
    count.textContent = shown.length === REFERENCE.length ? `${REFERENCE.length} entries` : `${shown.length} of ${REFERENCE.length} entries`;
    $('[data-ref-none]').hidden = shown.length > 0;
  }
  async function copy(text, done) {
    try { await navigator.clipboard.writeText(text); say(done); }
    catch (e) { say('Copying is blocked in this browser – the address is ' + text); }
  }
  box.addEventListener('input', apply);
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.refAct === 'clear') { q.value = ''; topic.value = ''; src.value = ''; region.value = ''; apply(); q.focus(); }
    else if (b.dataset.refAct === 'print') window.print();
    else if (b.dataset.refAct === 'csv') {
      const url = URL.createObjectURL(new Blob(['﻿' + referenceCsv(shown)], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'small-space-clearance-reference.csv'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000); say(`CSV with ${shown.length} entries saved.`);
    } else if (b.dataset.rowLink) copy(`${location.origin}${location.pathname}#${b.dataset.rowLink}`, 'Link to this entry copied.');
  });
  box.querySelectorAll('[data-js]').forEach(e => { e.hidden = false; });
  apply();
  // a link to one entry: make sure it is visible and marked
  const mark = () => { const id = decodeURIComponent(location.hash.slice(1)); box.querySelectorAll('tr.hit').forEach(t => t.classList.remove('hit')); if (rows.has(id)) rows.get(id).classList.add('hit'); };
  addEventListener('hashchange', mark); mark();
}
