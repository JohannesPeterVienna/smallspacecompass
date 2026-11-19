/* Clearance Check UI (home page and /tools/clearance-check/). Logic lives in quickfit.js. */
import { SCENARIOS, SCENARIO_KEYS, quickCheck, summaryOf, resultText, encodeQuick, decodeQuick, fmt, fmtMin, CM } from './quickfit.js';
import { refById, SOURCES } from './refdata.js';

const app = document.querySelector('[data-quick]');
if (app) start();

function start() {
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s) => app.querySelector(s);
  const TOOL_PATH = '/tools/clearance-check/';
  let key = 'bed', unit = 'in', V = {}, last = null;
  const show = (inch) => (Number.isFinite(inch) ? String(unit === 'cm' ? +(inch * CM).toFixed(1) : +inch.toFixed(2)) : '');
  const read = (text) => { const t = String(text ?? '').trim(); if (t === '') return NaN; const v = Number(t); return Number.isFinite(v) ? (unit === 'cm' ? v / CM : v) : NaN; };
  const defaults = (k) => ({ ...Object.fromEntries(SCENARIOS[k].fields.map(f => [f[0], f[2]])), ...Object.fromEntries(SCENARIOS[k].options.map(o => [o[0], o[2][0][0]])) });

  function form() {
    const sc = SCENARIOS[key];
    // the controls are rebuilt below: remember which one has the keyboard focus and give it back afterwards
    const a = document.activeElement, d = a && app.contains(a) ? a.dataset : null;
    const back = !d ? '' : d.scen ? `[data-scen="${key}"]` : d.unit ? `[data-unit="${unit}"]` : d.ex ? `[data-ex="${Number(d.ex) || 0}"]` : a.name && /^[A-Za-z]+$/.test(a.name) ? `[name="${a.name}"]` : '';
    $('[data-q-scen]').innerHTML = SCENARIO_KEYS.map(k => `<button type="button" data-scen="${k}" aria-pressed="${k === key}">${esc(SCENARIOS[k].short)}</button>`).join('');
    $('[data-q-units]').innerHTML = ['in', 'cm'].map(u => `<button type="button" data-unit="${u}" aria-pressed="${u === unit}">${u}</button>`).join('');
    $('[data-q-ex]').innerHTML = sc.examples.map((e, i) => `<button class="btn small ghost" type="button" data-ex="${i}">${esc(e[0])}</button>`).join('');
    $('[data-q-fields]').innerHTML = sc.fields.map(([n, label]) => `<label class="f"><span class="lb">${esc(label)}&nbsp;(${unit})</span><input type="number" inputmode="decimal" step="any" min="0" name="${n}" value="${show(V[n])}"></label>`).join('')
      + sc.options.map(([n, label, choices, isLen]) => `<label class="f"><span class="lb">${esc(label)}</span><select name="${n}">${choices.map(([val, text]) => `<option value="${val}"${String(V[n]) === val ? ' selected' : ''}>${esc(text)}${isLen && Number(val) > 0 ? ` (${fmt(Number(val), unit)})` : ''}</option>`).join('')}</select></label>`).join('');
    if (back) $(back)?.focus();
  }

  function bar(b) {
    // one horizontal strip, drawn to scale: what stands there and what stays clear
    const W = 300, sum = b.parts.reduce((s, p) => s + Math.max(0, p[1]), 0), span = Math.max(b.total, sum) || 1, k = W / span;
    let x = 10, out = '';
    for (const [kind, len, name] of b.parts) {
      const w = Math.max(0, len) * k; if (w <= 0) continue;
      out += `<rect x="${x.toFixed(1)}" y="14" width="${w.toFixed(1)}" height="30" class="q-${kind}"/>`;
      if (w > 40) out += `<text x="${(x + w / 2).toFixed(1)}" y="33" text-anchor="middle">${esc(kind === 'clear' ? fmt(len, unit) : name || '')}</text>`;
      x += w;
    }
    const over = sum - b.total > 1e-6;
    return `<svg class="q-bar" viewBox="0 0 320 62" role="img" aria-label="Section to scale: pieces, use zones and the clear width that is left"><line x1="10" y1="8" x2="10" y2="50" class="q-wall"/><line x1="${(10 + b.total * k).toFixed(1)}" y1="8" x2="${(10 + b.total * k).toFixed(1)}" y2="50" class="q-wall"/>${out}<text x="10" y="59">${over ? 'pieces are wider than the space' : 'wall to wall ' + esc(fmt(b.total, unit))}</text></svg>`;
  }

  function run() {
    const sc = SCENARIOS[key], out = $('[data-q-out]'), res = quickCheck(key, V);
    last = res.ok ? res : null;
    app.querySelectorAll('[data-q-act]').forEach(b => { b.disabled = !res.ok; });
    if (!res.ok) { out.innerHTML = `<p class="status bad" role="alert">Enter a number above 0 (at most ${fmt(1200, unit)}) for: ${res.errors.map(esc).join(', ')}.</p>`; return; }
    const f = (x) => fmt(x, unit);
    const steps = res.steps.map(s => `<li><span>${esc(s.text)}</span><span class="mono">${f(s.a)} ${s.op} ${s.plain ? s.b : f(s.b)}${s.c != null ? ` ${s.op} ${f(s.c)}` : ''} = <b>${f(s.r)}</b></span></li>`).join('');
    const rows = res.checks.map(c => {
      const r = c.ref ? refById[c.ref] : null;
      const src = r ? `<a href="/reference/#${r.id}">${esc(SOURCES[r.src].short)} ${esc(r.sec)}</a>` : 'site assumption, not a standard';
      return `<tr><td class="num"><span class="dot ${c.pass ? 'ok' : 'bad'}"></span> ${fmtMin(c.need, unit)}<br><span class="note-small">${c.pass ? 'meets' : 'below'}, ${c.pass ? '+' + f(c.margin) : '−' + f(-c.margin)}</span></td><td>${esc(c.label)}<br><span class="note-small">${src}</span></td></tr>`;
    }).join('');
    const want = res.next || res.checks[res.checks.length - 1];
    const lim = want.limit.value > 0 ? `${esc(want.limit.label)} that still leaves ${fmtMin(want.need, unit)}: <b>${f(want.limit.value)}</b>.` : `${fmtMin(want.need, unit)} cannot be reached with these measurements.`;
    const tight = res.measures.length > 1 ? ` The table uses the tighter one: ${esc(res.tightest.label.toLowerCase())}.` : '';
    out.innerHTML = `<div class="status ${res.level === 'bad' ? 'bad' : res.level === 'good' ? 'good' : ''}" role="status"><span class="big">${esc(summaryOf(res, unit))}</span></div>
${bar(res.bar)}
<h3>Working</h3><ol class="q-steps">${steps}</ol>
<p class="q-meas">${res.measures.map(m => `${esc(m.label)}: <b class="mono">${f(m.value)}</b>`).join(' · ')}.${tight}</p>
<div class="table-scroll"><table class="data"><caption class="sr">Clear width compared with published reference widths</caption><thead><tr><th>Reference width, margin</th><th>What it is, source</th></tr></thead><tbody>${rows}</tbody></table></div>
<p><b>Next step:</b> ${lim} Then draw the room with door swings in the <a href="${sc.planner}">Clearance Planner</a>, or read <a href="${sc.guide[0]}">${esc(sc.guide[1])}</a>.</p>`;
  }

  function set(k, values, u) {
    key = k; if (u) unit = u; V = { ...defaults(k), ...(values || {}) }; form(); run();
  }
  const say = (t) => { const n = $('[data-q-msg]'); n.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { n.textContent = ''; }, 4000); };
  async function copy(text, done) {
    try { await navigator.clipboard.writeText(text); say(done); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* ignore */ }
      ta.remove(); say(ok ? done : 'Copying is blocked in this browser – select the text and copy it by hand.');
    }
  }

  app.addEventListener('input', (e) => {
    const t = e.target; if (!t.name) return;
    V[t.name] = t.tagName === 'SELECT' ? t.value : read(t.value); $('[data-q-note]').textContent = ''; run();
  });
  app.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.scen || b.dataset.ex) $('[data-q-note]').textContent = '';
    if (b.dataset.scen) set(b.dataset.scen);
    else if (b.dataset.unit && b.dataset.unit !== unit) { unit = b.dataset.unit; form(); run(); }
    else if (b.dataset.ex) set(key, SCENARIOS[key].examples[+b.dataset.ex][1]);
    else if (b.dataset.qAct === 'copy' && last) copy(resultText(last, unit), 'Result copied.');
    else if (b.dataset.qAct === 'link' && last) copy(`${location.origin}${TOOL_PATH}#${encodeQuick(key, last.values, unit)}`, 'Link copied. It contains the numbers you entered.');
    else if (b.dataset.qAct === 'print') window.print();
  });

  // a shared link carries its numbers in the fragment; take them over, then clean the address bar
  const shared = decodeQuick(location.hash);
  if (shared) {
    set(shared.key, shared.broken ? null : shared.values, shared.unit);
    // say so when the link carried something this check does not know – never apply or drop it silently
    const note = shared.broken ? 'The link was incomplete or contained numbers this check cannot use. The example values are shown instead.'
      : shared.ignored.length ? `The link contained an option this check does not know (${shared.ignored.join(', ')}). The default is shown instead.` : '';
    if (note) $('[data-q-note]').innerHTML = `<p class="status bad" role="alert">${esc(note)}</p>`;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  } else set('bed');
}
