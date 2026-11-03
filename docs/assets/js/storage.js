/* Storage Wall Audit: wall elevation, units, volume by reach band; plus equal-compartment divider. */
import { storageBands, cuIn2cuFt, cuIn2L, divideOpening, fmtLen, CM, REACH_LOW, REACH_HIGH } from './geometry.js';
import { elevationSVG, esc } from './render.js';
import { storageFieldError, validStorage } from './validate.js';

const app = document.querySelector('[data-storage]');
const $ = (s) => app.querySelector(s);
const STORE = 'ssc-storage-v1';
const DEFAULT = { wall: { W: 120, H: 96 }, units: [
  { id: 'u1', label: 'Bookcase', x: 0, w: 31, bottom: 0, top: 79, depth: 11, shelves: [15, 30, 45, 60] },
  { id: 'u2', label: 'Shoe bench', x: 36, w: 36, bottom: 0, top: 18, depth: 14, shelves: [8] },
  { id: 'u3', label: 'Wall shelf', x: 40, w: 30, bottom: 66, top: 76, depth: 10, shelves: [] },
  { id: 'u4', label: 'Cabinet', x: 80, w: 36, bottom: 0, top: 84, depth: 16, shelves: [16, 32, 48, 64] }] };
let S, units = 'in', sel = 'u1', msg = '';
const toU = (v) => units === 'cm' ? +(v * CM).toFixed(1) : +(+v).toFixed(2);
const fromU = (v) => units === 'cm' ? v / CM : v;
try { S = JSON.parse(localStorage.getItem(STORE)) } catch (e) { S = null; }
if (!validStorage(S)) S = JSON.parse(JSON.stringify(DEFAULT));

function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ignore */ } }
const vol = (ci) => units === 'cm' ? `${Math.round(cuIn2L(ci))} L` : `${cuIn2cuFt(ci).toFixed(1)} cu ft`;
function render() {
  $('[data-wall]').innerHTML = elevationSVG(S.wall, S.units, { units, interactive: true, title: 'Storage wall elevation with the 15–48 in reach band' });
  $('[data-wall]').querySelector(`.unit[data-id="${sel}"]`)?.classList.add('sel');
  const b = storageBands(S.units), tot = b.low + b.reach + b.high || 1;
  $('[data-bands]').innerHTML = `<table class="data"><thead><tr><th>Band</th><th>Volume</th><th>Share</th></tr></thead><tbody>
<tr><td>Above ${fmtLen(REACH_HIGH, units)} – step stool</td><td class="num">${vol(b.high)}</td><td class="num">${Math.round(b.high / tot * 100)}%</td></tr>
<tr><td>${fmtLen(REACH_LOW, units)}–${fmtLen(REACH_HIGH, units)} – everyday height band</td><td class="num">${vol(b.reach)}</td><td class="num">${Math.round(b.reach / tot * 100)}%</td></tr>
<tr><td>Below ${fmtLen(REACH_LOW, units)} – bend or kneel</td><td class="num">${vol(b.low)}</td><td class="num">${Math.round(b.low / tot * 100)}%</td></tr>
<tr><th scope="row">Total</th><td class="num"><b>${vol(b.low + b.reach + b.high)}</b></td><td></td></tr></tbody></table>
<p class="note-small">Gross volume sorted by height only. Shelf depth, obstacles in front of a unit and reach to the back of deep shelves are not checked (ADA §308.2.2/§308.3.2 lower the high reach over an obstruction to 44 or 46 in).</p>`;
  const it = S.units.find(u => u.id === sel);
  $('[data-unit]').innerHTML = it ? `<h3>Selected: ${esc(it.label)}</h3>${msg ? `<p class="status bad" role="alert">${esc(msg)}</p>` : ''}<div class="fields">
<label class="f">Label<input type="text" data-k="label" value="${esc(it.label)}"></label>
<label class="f">From left&nbsp;(${units})<input type="number" step="0.5" data-k="x" value="${toU(it.x)}"></label>
<label class="f">Width&nbsp;(${units})<input type="number" step="0.5" min="1" data-k="w" value="${toU(it.w)}"></label>
<label class="f">Bottom&nbsp;(${units})<input type="number" step="0.5" min="0" data-k="bottom" value="${toU(it.bottom)}"></label>
<label class="f">Top&nbsp;(${units})<input type="number" step="0.5" min="1" data-k="top" value="${toU(it.top)}"></label>
<label class="f">Depth&nbsp;(${units})<input type="number" step="0.5" min="1" data-k="depth" value="${toU(it.depth)}"></label>
<label class="f" style="grid-column:1/-1">Shelf heights above floor (${units}, comma separated)<input type="text" data-k="shelves" value="${it.shelves.map(toU).join(', ')}"></label></div>
<div class="row"><button class="btn small ghost" type="button" data-act="del">Remove</button></div>` : '<p class="note-small">Select a unit in the drawing.</p>';
  $('[data-wall-w]').value = toU(S.wall.W); $('[data-wall-h]').value = toU(S.wall.H);
  app.querySelectorAll('[data-unit-label]').forEach(e => e.textContent = units);
  divider();
}
function divider() {
  const o = fromU(parseFloat($('[name=opening]').value)), n = parseInt($('[name=parts]').value, 10), t = fromU(parseFloat($('[name=thick]').value));
  const box = $('[data-div]');
  if (!(o > 0) || !(Number.isInteger(n) && n >= 1 && n <= 20) || !(t >= 0)) { box.innerHTML = '<p class="status bad" role="alert">Enter an opening above 0, 1–20 compartments and a divider thickness of 0 or more.</p>'; return; }
  const r = divideOpening(o, n, t, 0);
  if (!r) { box.innerHTML = '<p class="status bad">The dividers take up more than the opening.</p>'; return; }
  box.innerHTML = `<p class="status good" role="status"><span class="big">${fmtLen(r.each, units, 2)}</span> clear per compartment</p>
<p class="note-small">Mark divider left edges at: ${r.cuts.map(c => fmtLen(c, units, 2)).join(' · ') || '—'} from the left inside face.</p>`;
}
app.addEventListener('change', (e) => {
  const t = e.target, it = S.units.find(u => u.id === sel);
  msg = '';
  if (t.matches('[data-wall-w],[data-wall-h]')) { const v = fromU(parseFloat(t.value)); if (v > 12 && v < 600) S.wall[t.matches('[data-wall-w]') ? 'W' : 'H'] = v; else msg = 'Wall width and ceiling height must be between 12 and 600 in.'; }
  else if (it && t.dataset.k) {
    const k = t.dataset.k;
    if (k === 'label') it.label = t.value.slice(0, 30) || it.label;
    else if (k === 'shelves') it.shelves = t.value.split(/[,;\s]+/).map(parseFloat).filter(Number.isFinite).map(fromU).filter(h => h > it.bottom && h < it.top).sort((a, b) => a - b);
    else {
      // every physical value is checked here as well – the HTML min attribute does not stop typed values
      const v = fromU(Number(String(t.value).trim() === '' ? NaN : t.value)), err = storageFieldError(k, v);
      const names = { x: 'From left', w: 'Width', bottom: 'Bottom', top: 'Top', depth: 'Depth' };
      if (err) msg = `${names[k] || k}: ${err} The previous value is kept.`;
      else if (k === 'top' && v <= it.bottom) msg = 'Top must be above the bottom. The previous value is kept.';
      else if (k === 'bottom' && v >= it.top) msg = 'Bottom must be below the top. The previous value is kept.';
      else { it[k] = v; if (k === 'top' || k === 'bottom') it.shelves = it.shelves.filter(h => h > it.bottom && h < it.top); }
    }
  } else return;
  save(); render();
});
app.addEventListener('input', (e) => { if (e.target.closest('[data-divider]')) divider(); });
app.addEventListener('click', (e) => {
  const u = e.target.closest('.unit[data-id]'); if (u) { sel = u.dataset.id; render(); return; }
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.act === 'add') { const id = 'u' + Date.now().toString(36); S.units.push({ id, label: 'Shelf unit', x: 0, w: 24, bottom: 0, top: 72, depth: 12, shelves: [18, 36, 54] }); sel = id; save(); render(); }
  if (b.dataset.act === 'del') { S.units = S.units.filter(x => x.id !== sel); sel = S.units[0]?.id; save(); render(); }
  if (b.dataset.act === 'reset') { S = JSON.parse(JSON.stringify(DEFAULT)); sel = 'u1'; save(); render(); }
  if (b.dataset.units && b.dataset.units !== units) {
    const old = units; units = b.dataset.units; app.querySelectorAll('[data-units]').forEach(x => x.setAttribute('aria-pressed', x === b));
    app.querySelectorAll('[data-divider] input[type=number]').forEach(i => { if (i.name === 'parts') return; const v = parseFloat(i.value); i.value = old === 'in' ? +(v * CM).toFixed(1) : +(v / CM).toFixed(2); });
    render();
  }
});
app.addEventListener('keydown', (e) => { const u = e.target.closest?.('.unit[data-id]'); if (u && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sel = u.dataset.id; render(); $('[data-unit] input')?.focus(); } });
render();
