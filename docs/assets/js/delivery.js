/* Will It Fit? Delivery Check */
import { deliveryCheck, fmtLen, CM } from './geometry.js';
import { esc, dimLine } from './render.js';

const app = document.querySelector('[data-delivery]');
const $ = (s) => app.querySelector(s);
const PRESET = {
  sofa: { W: 84, D: 37, H: 34, diag: 31, label: 'Sofa (3-seat)' },
  loveseat: { W: 62, D: 35, H: 33, diag: 30, label: 'Loveseat' },
  queenmattress: { W: 80, D: 60, H: 12, label: 'Queen mattress' },
  kingbox: { W: 80, D: 38, H: 9, label: 'Split-king box spring' },
  wardrobe: { W: 40, D: 24, H: 78, upright: true, label: 'Wardrobe (kept upright)' },
  fridge: { W: 30, D: 31, H: 68, upright: true, label: 'Fridge (kept upright)' }
};
const STORE = 'ssc-delivery-v1';
let units = 'in';
const toU = (v) => units === 'cm' ? +(v * CM).toFixed(1) : v;
const fromU = (v) => units === 'cm' ? v / CM : v;

function readState() {
  const g = (k) => fromU(parseFloat($(`[name=${k}]`).value));
  const item = { W: g('W'), D: g('D'), H: g('H'), diag: g('diag') || 0, upright: $('[name=upright]').checked };
  const cps = [];
  if ($('[name=useDoor]').checked) cps.push({ kind: 'door', name: 'Entry door', width: g('doorW'), height: g('doorH') });
  if ($('[name=useCorner]').checked) cps.push({ kind: 'corner', name: 'Hallway corner (90°)', a: g('hallA'), b: g('hallB'), height: g('hallH') });
  if ($('[name=useLanding]').checked) cps.push({ kind: 'landing', name: 'Stair landing turn', width: g('stairW'), height: g('stairH') });
  if ($('[name=useDoor2]').checked) cps.push({ kind: 'door', name: 'Room door', width: g('door2W'), height: g('door2H') });
  return { item, cps };
}
function sketch(r, item) {
  const { cp, best } = r;
  if (!best) return '';
  if (cp.kind === 'door') {
    // elevation of the doorway with the item's cross-section
    const W = cp.width, H = cp.height, pad = 20, sc = 1;
    let shape;
    if (best.profile) {
      const pw = Math.min(item.diag, W), ph = Math.min(Math.max(item.H, item.D), H);
      shape = `<rect x="${(W - pw) / 2}" y="${H - ph}" width="${pw}" height="${ph}" class="xs"/><text x="${W / 2}" y="${H - ph / 2}" text-anchor="middle" style="font-size:5px">diagonal ${fmtLen(item.diag, units)}</text>`;
    } else {
      const w = best.w, t = best.t;
      const fitsStraight = Math.min(w, t) <= W && Math.max(w, t) <= H;
      const bw = Math.min(w, t), bh = Math.max(w, t);
      shape = fitsStraight ? `<rect x="${(W - bw) / 2}" y="${H - bh}" width="${bw}" height="${bh}" class="xs"/>`
        : `<rect x="${(W - bw) / 2}" y="${H - bh}" width="${bw}" height="${bh}" class="xs" transform="rotate(${Math.min(40, Math.atan2(bw - W, bh) * 57)} ${W / 2} ${H / 2})"/>`;
    }
    return `<svg class="fit" viewBox="${-pad - 16} ${-pad} ${W + 2 * pad + 32} ${H + 2 * pad}" role="img" aria-label="Doorway elevation with the item's cross-section" style="--fs:5px">
<rect x="-12" y="-8" width="${W + 24}" height="${H + 8}" class="jamb"/><rect x="0" y="0" width="${W}" height="${H}" class="hole"/>${shape}
${dimLine(0, H, W, H, fmtLen(W, units), 10)}${dimLine(W, H, W, 0, fmtLen(H, units), -10)}</svg>`;
  }
  // plan of the corner with the item at its critical angle
  const a = cp.kind === 'landing' ? cp.width : cp.a, b = cp.kind === 'landing' ? cp.width : cp.b;
  const ext = Math.max(a, b) * 2.6, pad = 14;
  const th = best.theta || Math.PI / 4, Lp = best.L * Math.cos(best.phi || 0) + best.t * Math.sin(best.phi || 0), w = best.w;
  // corridor 1 runs along x (width a, y in [0,a]), corridor 2 runs up along y at x in [ext-b, ext]
  const ix = ext - b, iy = 0; // inner corner at (ix, a)
  const cx = ix, cy = a;
  const ux = Math.cos(th), uy = -Math.sin(th);
  // place item so its inner long edge touches inner corner
  const nx = -uy, ny = ux; // normal pointing towards outer wall
  const mid = [cx + nx * (w / 2) * -1, cy + ny * (w / 2) * -1];
  const corners = [[-Lp / 2, -w / 2], [Lp / 2, -w / 2], [Lp / 2, w / 2], [-Lp / 2, w / 2]].map(([p, q]) => [mid[0] + ux * p - nx * q, mid[1] + uy * p - ny * q]);
  const poly = corners.map(c => c.map(v => v.toFixed(1)).join(',')).join(' ');
  return `<svg class="fit" viewBox="${-pad} ${-ext + a - pad} ${ext + 2 * pad} ${ext + 2 * pad}" role="img" aria-label="Plan of the corner with the item at its tightest angle" style="--fs:${Math.max(4, ext / 30)}px">
<path d="M0 0H${ext}V${-ext + a}" class="wallline"/><path d="M0 ${a}H${ix}V${-ext + a}" class="wallline"/>
<polygon points="${poly}" class="xs ${r.ok ? '' : 'bad'}"/>
${dimLine(0, a, 0, 0, fmtLen(a, units), -8)}${dimLine(ix, -ext + a + 10, ext, -ext + a + 10, fmtLen(b, units), 8)}</svg>`;
}
function run() {
  const { item, cps } = readState();
  try { localStorage.setItem(STORE, JSON.stringify([...app.querySelectorAll('input')].map(i => [i.name, i.type === 'checkbox' ? i.checked : i.value]))); } catch (e) { /* ignore */ }
  const out = $('[data-result]');
  if (![item.W, item.D, item.H].every(v => v > 0) || !cps.length) { out.innerHTML = '<p class="status">Enter the three outside dimensions of the item and at least one checkpoint.</p>'; return; }
  const res = deliveryCheck(item, cps);
  const deg = (r) => Math.round(r * 180 / Math.PI);
  out.innerHTML = `<div class="status ${res.ok ? 'good' : 'bad'}" role="status"><span class="big">${res.ok ? 'Fits along the whole route' : 'Does not fit at ' + res.results.filter(r => !r.ok).map(r => esc(r.cp.name)).join(', ')}</span>
<p class="note-small" style="margin:.4rem 0 0">Geometric check of a rigid box with your outside dimensions. Allow for packaging, handles and the person carrying it.</p></div>
${res.results.map(r => {
    const b = r.best;
    let how = '';
    if (r.cp.kind === 'door') how = b.profile ? `Tip it onto its back or end and roll it through using the diagonal depth (${fmtLen(item.diag, units)}).` : `Carry it ${esc(b.label)}. Cross-section ${fmtLen(Math.min(b.w, b.t), units)} × ${fmtLen(Math.max(b.w, b.t), units)}${b.ok ? ` – ${fmtLen(Math.max(0, r.cp.width - Math.min(b.w, b.t)), units)} spare in width.` : '.'}`;
    else how = b.ok ? `Carry it ${esc(b.label)}${b.phi > 0.02 ? `, tilted up about ${deg(b.phi)}°` : ' flat'}; the tightest angle in the turn is about ${deg(b.theta)}°. Longest length that passes at this width: ${fmtLen(b.limit, units)}.` : `Longest length that can turn here with ${fmtLen(b.w, units)} width: ${fmtLen(Math.max(0, b.limit || 0), units)} flat; even tilted within the ${fmtLen(r.cp.height, units)} ceiling it is ${fmtLen(-b.margin, units)} too long.`;
    return `<section class="panel" style="margin-top:1rem"><h3><span class="dot ${r.ok ? 'ok' : 'bad'}"></span> ${esc(r.cp.name)}: ${r.ok ? 'passes' : 'blocked'}</h3><p style="margin:0">${how}</p>${sketch(r, item)}</section>`;
  }).join('')}`;
}
function restore() {
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (Array.isArray(s)) for (const [n, v] of s) { const i = $(`[name="${n}"]`); if (i) { if (i.type === 'checkbox') i.checked = v; else i.value = v; } } } catch (e) { /* ignore */ }
}
app.addEventListener('input', run);
app.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.preset) {
    const p = PRESET[b.dataset.preset];
    for (const k of ['W', 'D', 'H']) $(`[name=${k}]`).value = toU(p[k]);
    $('[name=diag]').value = p.diag ? toU(p.diag) : ''; $('[name=upright]').checked = !!p.upright; run();
  }
  if (b.dataset.units && b.dataset.units !== units) {
    const old = units; units = b.dataset.units;
    app.querySelectorAll('[data-units]').forEach(x => x.setAttribute('aria-pressed', x === b));
    app.querySelectorAll('input[type=number]').forEach(i => { if (i.value !== '') { const v = parseFloat(i.value); i.value = old === 'in' ? +(v * CM).toFixed(1) : +(v / CM).toFixed(1); } });
    app.querySelectorAll('[data-unit-label]').forEach(e => e.textContent = units);
    run();
  }
});
restore(); run();
