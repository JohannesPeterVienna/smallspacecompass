/* Clearance Planner + Day/Night Floor Swap (data-mode="swap"). Everything stays in the browser. */
import { analyzePlan, findConflicts, fmtLen, CM, ADA_ROUTE } from './geometry.js';
import { planSVG, esc } from './render.js';
import { PRESETS, presetByKey } from './catalog.js';
import { layoutBySlug, LAYOUTS } from './layouts.js';

const app = document.querySelector('[data-planner]');
const MODE = app.dataset.mode === 'swap' ? 'swap' : 'plan';
const STORE = MODE === 'swap' ? 'ssc-swap-v1' : 'ssc-planner-v1';
const $ = (s, r = app) => r.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const ROT = { N: 'E', E: 'S', S: 'W', W: 'N' };

const DEFAULT = MODE === 'swap' ? layoutBySlug['studio-15x15-wall-bed'] : layoutBySlug['studio-20x15-queen-corner'];
let plan, units = 'in', sel = null, snaps = { A: null, B: null }, results = {};

function load() {
  const q = new URLSearchParams(location.search).get('layout');
  if (q && layoutBySlug[q]) return clone(layoutBySlug[q]);
  try { const s = localStorage.getItem(STORE); if (s) { const p = JSON.parse(s); if (valid(p)) return p; } } catch (e) { /* storage blocked */ }
  return clone(DEFAULT);
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(plan)); } catch (e) { /* ignore */ } }
function valid(p) {
  return p && p.room && p.room.W > 0 && p.room.D > 0 && Array.isArray(p.items) && p.items.every(i => i && typeof i.w === 'number' && typeof i.d === 'number' && typeof i.x === 'number' && typeof i.y === 'number');
}
const states = () => MODE === 'swap' ? ['day', 'night'] : [undefined];
const toU = (inch) => units === 'cm' ? +(inch * CM).toFixed(1) : +inch.toFixed(1);
const fromU = (v) => units === 'cm' ? v / CM : v;

/* ---------- rendering ---------- */
function render(full = true) {
  for (const st of states()) {
    const a = full ? analyzePlan(plan, { state: st, cell: 1 }) : { conflicts: findConflicts(plan, st), routes: results[st]?.routes || [] };
    if (!full && results[st]) a.routes = results[st].routes;
    if (full) results[st] = a;
    const stage = $(`[data-stage="${st || 'plan'}"]`);
    stage.innerHTML = planSVG(plan, full ? a : { ...a, routes: [] }, { units, state: st, interactive: true, title: `${st ? st[0].toUpperCase() + st.slice(1) + ' state: ' : ''}floor plan, ${fmtLen(plan.room.W, units)} by ${fmtLen(plan.room.D, units)}` });
    if (sel) stage.querySelector(`.item[data-id="${CSS.escape(sel)}"]`)?.classList.add('sel');
  }
  if (full) report();
  editor();
}
function report() {
  const box = $('[data-report]');
  const parts = [];
  for (const st of states()) {
    const a = results[st];
    const hard = a.conflicts.filter(c => c.severity !== 'warn'), warn = a.conflicts.filter(c => c.severity === 'warn');
    const narrow = a.routes.filter(r => r.found && r.width != null).reduce((m, r) => Math.min(m, r.width), Infinity);
    const blocked = a.routes.filter(r => !r.found);
    const bad = hard.length || blocked.length || narrow < ADA_ROUTE - 0.05;
    const ft = (v) => units === 'cm' ? (v * CM * CM / 10000).toFixed(1) + ' m²' : (v / 144).toFixed(1) + ' sq ft';
    parts.push(`<div class="status ${bad ? 'bad' : 'good'}" role="status">${st ? `<b>${st === 'day' ? 'Day' : 'Night'} state</b><br>` : ''}
<span class="big">${Number.isFinite(narrow) ? fmtLen(narrow, units) : '—'}</span> narrowest walkway from the entry<br>
<span class="note-small">${Number.isFinite(narrow) ? (narrow >= ADA_ROUTE - 0.05 ? 'At least 36 in (915 mm), the ADA §403.5.1 walking-surface width.' : 'Below 36 in (915 mm), the ADA §403.5.1 walking-surface width.') : 'No measured route yet – add a door and a target (bed, desk) or a window.'}</span>
<ul class="list-plain" style="margin-top:.6rem">${a.routes.map(r => `<li><span class="dot ${r.found ? (r.ok ? 'ok' : 'bad') : 'bad'}"></span>Entry → ${esc(r.label)}: ${r.found ? (r.width == null ? 'open floor' : fmtLen(r.width, units)) : 'no way through'}</li>`).join('')}
${hard.map(c => `<li><span class="dot bad"></span>${esc(c.msg)}</li>`).join('')}${warn.map(c => `<li><span class="dot warn"></span>${esc(c.msg)}</li>`).join('')}</ul>
<p class="note-small" style="margin:.6rem 0 0">Floor ${ft(a.area)} · furniture ${ft(a.footprint)} · use zones ${ft(a.zones)} · free ${ft(a.free)} (${Math.round(a.freePct * 100)}%)</p></div>`);
  }
  box.innerHTML = parts.join('');
}
function editor() {
  const ed = $('[data-editor]'), it = plan.items.find(i => i.id === sel);
  if (!it) { ed.innerHTML = '<p class="note-small">Select a piece in the plan (click or Tab) to edit it. Arrow keys move it by 1 in, Shift+arrow by 6 in, R rotates, Delete removes.</p>'; return; }
  const u = units;
  ed.innerHTML = `<h3>Selected: ${esc(it.label)}</h3>
<div class="fields"><label class="f">Label<input type="text" data-k="label" value="${esc(it.label)}"></label>
<label class="f">Width (${u})<input type="number" min="1" step="0.5" data-k="w" value="${toU(it.w)}"></label>
<label class="f">Depth (${u})<input type="number" min="1" step="0.5" data-k="d" value="${toU(it.d)}"></label>
<label class="f">From left (${u})<input type="number" step="0.5" data-k="x" value="${toU(it.x)}"></label>
<label class="f">From top (${u})<input type="number" step="0.5" data-k="y" value="${toU(it.y)}"></label>
${(it.zones || []).map((z, i) => `<label class="f">${esc(z.kind)} zone (${u})<input type="number" min="0" step="1" data-z="${i}" value="${toU(z.depth)}"></label>`).join('')}
${MODE === 'swap' ? `<label class="f">Present<select data-k="only"><option value="">day + night</option><option value="day"${it.only === 'day' ? ' selected' : ''}>day only (folded at night)</option><option value="night"${it.only === 'night' ? ' selected' : ''}>night only</option></select></label>
${it.ext ? `<label class="f">Unfolds by (${u})<input type="number" min="0" step="1" data-ext="depth" value="${toU(it.ext.depth)}"></label>` : ''}` : ''}</div>
<label class="row note-small"><input type="checkbox" data-k="target"${it.target ? ' checked' : ''}> Measure the walkway to this piece</label>
<div class="row"><button class="btn small ghost" type="button" data-act="rotate">Rotate 90°</button><button class="btn small ghost" type="button" data-act="dup">Duplicate</button><button class="btn small ghost" type="button" data-act="del">Remove</button></div>`;
}
function roomFields() {
  $('[data-room-w]').value = toU(plan.room.W); $('[data-room-d]').value = toU(plan.room.D);
  app.querySelectorAll('[data-unit-label]').forEach(e => e.textContent = units);
  doorsList();
}
function doorsList() {
  const list = $('[data-doors]');
  const rows = [...(plan.doors || []).map((d, i) => ({ d, i, kind: 'door' })), ...(plan.windows || []).map((d, i) => ({ d, i, kind: 'window' }))];
  list.innerHTML = rows.map(({ d, i, kind }) => `<fieldset class="item-editor" data-${kind}="${i}"><legend class="note-small">${kind === 'door' ? (d.entry ? 'Entry door' : 'Door') : 'Window'} ${i + 1}</legend><div class="fields">
<label class="f">Wall<select data-f="wall">${['N', 'E', 'S', 'W'].map(w => `<option value="${w}"${d.wall === w ? ' selected' : ''}>${{ N: 'top', E: 'right', S: 'bottom', W: 'left' }[w]}</option>`).join('')}</select></label>
<label class="f">Offset (${units})<input type="number" step="0.5" min="0" data-f="offset" value="${toU(d.offset)}"></label>
<label class="f">Width (${units})<input type="number" step="0.5" min="12" data-f="width" value="${toU(d.width)}"></label>
${kind === 'door' ? `<label class="f">Swing<select data-f="swing"><option value="in"${d.swing === 'in' ? ' selected' : ''}>into room</option><option value="out"${d.swing === 'out' ? ' selected' : ''}>out of room</option><option value="none"${d.swing === 'none' ? ' selected' : ''}>opening / sliding</option></select></label>
<label class="f">Hinge<select data-f="hinge"><option value="start"${d.hinge !== 'end' ? ' selected' : ''}>left/top end</option><option value="end"${d.hinge === 'end' ? ' selected' : ''}>right/bottom end</option></select></label>` : ''}
</div><button class="btn small ghost" type="button" data-remove>Remove</button></fieldset>`).join('');
}

/* ---------- editing ---------- */
const uid = () => 'i' + Math.random().toString(36).slice(2, 8);
function change(full = true) { save(); render(full); }
function rotate(it) {
  const cx = it.x + it.w / 2, cy = it.y + it.d / 2;
  [it.w, it.d] = [it.d, it.w]; it.x = Math.round(cx - it.w / 2); it.y = Math.round(cy - it.d / 2);
  (it.zones || []).forEach(z => z.side = ROT[z.side]); if (it.ext) it.ext.side = ROT[it.ext.side];
}
function clampItem(it) {
  it.x = Math.max(0, Math.min(plan.room.W - it.w, it.x)); it.y = Math.max(0, Math.min(plan.room.D - it.d, it.y));
}
app.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('[data-room-w],[data-room-d]')) {
    const v = fromU(parseFloat(t.value)); if (!(v >= 24 && v <= 1200)) { roomFields(); return; }
    plan.room[t.matches('[data-room-w]') ? 'W' : 'D'] = v; change(); return;
  }
  const it = plan.items.find(i => i.id === sel);
  if (it && t.dataset.k) {
    const k = t.dataset.k;
    if (k === 'label') it.label = t.value.slice(0, 40) || it.label;
    else if (k === 'target') it.target = t.checked;
    else if (k === 'only') { if (t.value) it.only = t.value; else delete it.only; }
    else { const v = fromU(parseFloat(t.value)); if (Number.isFinite(v)) it[k] = Math.max(k === 'w' || k === 'd' ? 1 : -1e4, v); }
    change(); return;
  }
  if (it && t.dataset.z != null) { const v = fromU(parseFloat(t.value)); if (v >= 0) it.zones[+t.dataset.z].depth = v; change(); return; }
  if (it && t.dataset.ext) { const v = fromU(parseFloat(t.value)); if (v >= 0) it.ext.depth = v; change(); return; }
  const fs = t.closest('fieldset[data-door],fieldset[data-window]');
  if (fs && t.dataset.f) {
    const arr = fs.dataset.door != null ? plan.doors : plan.windows, o = arr[+(fs.dataset.door ?? fs.dataset.window)];
    const f = t.dataset.f; o[f] = f === 'offset' || f === 'width' ? fromU(parseFloat(t.value)) || o[f] : t.value;
    change(); return;
  }
});
app.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const it = plan.items.find(i => i.id === sel);
  const act = b.dataset.act;
  if (act === 'rotate' && it) { rotate(it); clampItem(it); change(); }
  else if (act === 'del' && it) { plan.items = plan.items.filter(i => i !== it); sel = null; change(); }
  else if (act === 'dup' && it) { const c = clone(it); c.id = uid(); c.x += 6; c.y += 6; clampItem(c); plan.items.push(c); sel = c.id; change(); }
  else if (act === 'add') {
    const p = presetByKey[$('[data-preset]').value]; if (!p) return;
    const { key, group, ...rest } = clone(p); const n = { id: uid(), ...rest, x: 0, y: 0 };
    n.x = Math.round((plan.room.W - n.w) / 2); n.y = Math.round((plan.room.D - n.d) / 2); clampItem(n);
    plan.items.push(n); sel = n.id; change();
  }
  else if (act === 'add-door') { (plan.doors ||= []).push({ id: uid(), label: 'door', wall: 'E', offset: 12, width: 30, hinge: 'start', swing: 'in', entry: !plan.doors.length }); change(); roomFields(); }
  else if (act === 'add-window') { (plan.windows ||= []).push({ id: uid(), label: 'Window', wall: 'N', offset: 24, width: 48 }); change(); roomFields(); }
  else if (b.hasAttribute('data-remove')) {
    const fs = b.closest('fieldset');
    if (fs.dataset.door != null) { plan.doors.splice(+fs.dataset.door, 1); if (plan.doors.length && !plan.doors.some(d => d.entry)) plan.doors[0].entry = true; }
    else plan.windows.splice(+fs.dataset.window, 1);
    change(); roomFields();
  }
  else if (b.dataset.units) { units = b.dataset.units; app.querySelectorAll('[data-units]').forEach(x => x.setAttribute('aria-pressed', x === b)); roomFields(); render(true); }
  else if (act === 'reset') { plan = clone(DEFAULT); sel = null; change(); roomFields(); }
  else if (act === 'export-json') download(JSON.stringify({ format: 'smallspacecompass-plan', version: 1, ...plan }, null, 2), 'plan.json', 'application/json');
  else if (act === 'export-svg') {
    const svgs = [...app.querySelectorAll('[data-stage] svg')].map(s => s.outerHTML.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" `));
    const css = `<style>${[...document.styleSheets].flatMap(ss => { try { return [...ss.cssRules].map(r => r.cssText).filter(t => t.startsWith('svg')); } catch (x) { return []; } }).join('')}text{font-family:monospace}</style>`;
    download(svgs[0].replace(/(<svg[^>]*>)/, `$1${css}`), 'plan.svg', 'image/svg+xml');
  }
  else if (act === 'import') $('[data-file]').click();
  else if (act === 'snap-a' || act === 'snap-b') { const k = act === 'snap-a' ? 'A' : 'B'; snaps[k] = { plan: clone(plan), r: summary() }; compare(); }
  else if (act === 'load-a' && snaps.A) { plan = clone(snaps.A.plan); change(); roomFields(); }
  else if (act === 'load-b' && snaps.B) { plan = clone(snaps.B.plan); change(); roomFields(); }
});
$('[data-file]').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { const p = JSON.parse(await f.text()); if (!valid(p)) throw new Error('not a plan'); plan = { room: p.room, doors: p.doors || [], windows: p.windows || [], items: p.items }; sel = null; change(); roomFields(); }
  catch (err) { alert('This file is not a Small Space Compass plan (JSON).'); }
  e.target.value = '';
});
$('[data-load]')?.addEventListener('change', (e) => { const L = layoutBySlug[e.target.value]; if (L) { plan = clone(L); sel = null; change(); roomFields(); } });
function download(text, name, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function summary() {
  const a = results[states()[states().length - 1]];
  const narrow = a.routes.filter(r => r.found && r.width != null).reduce((m, r) => Math.min(m, r.width), Infinity);
  return { free: a.free, pct: a.freePct, narrow, conflicts: a.conflicts.filter(c => c.severity !== 'warn').length, blocked: a.routes.filter(r => !r.found).length };
}
function compare() {
  const box = $('[data-compare]'); if (!box) return;
  const col = (s) => s ? [`${(s.r.free / 144).toFixed(1)} sq ft (${Math.round(s.r.pct * 100)}%)`, Number.isFinite(s.r.narrow) ? fmtLen(s.r.narrow, units) : '—', String(s.r.conflicts), String(s.r.blocked)] : ['–', '–', '–', '–'];
  const A = col(snaps.A), B = col(snaps.B);
  box.innerHTML = `<table class="data"><thead><tr><th></th><th>A</th><th>B</th></tr></thead><tbody>${['Free floor', 'Narrowest walkway', 'Conflicts', 'Blocked routes'].map((l, i) => `<tr><th scope="row">${l}</th><td class="num">${A[i]}</td><td class="num">${B[i]}</td></tr>`).join('')}</tbody></table>`;
}

/* ---------- pointer + keyboard ---------- */
let drag = null;
app.addEventListener('pointerdown', (e) => {
  const g = e.target.closest('.item[data-id]'); if (!g) return;
  const stage = g.closest('[data-stage]'), it = plan.items.find(i => i.id === g.dataset.id); if (!it) return;
  sel = it.id; const pt = toSvg(stage.querySelector('svg'), e);
  drag = { it, stage, dx: pt.x - it.x, dy: pt.y - it.y, moved: false };
  e.preventDefault(); render(false);
});
window.addEventListener('pointermove', (e) => {
  if (!drag) return; const pt = toSvg(drag.stage.querySelector('svg'), e);
  const nx = Math.round(pt.x - drag.dx), ny = Math.round(pt.y - drag.dy);
  if (nx === drag.it.x && ny === drag.it.y) return;
  drag.it.x = nx; drag.it.y = ny; clampItem(drag.it); drag.moved = true; render(false);
});
const endDrag = () => { if (!drag) return; drag = null; save(); render(true); focusSel(); };
window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);
function toSvg(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function focusSel() { app.querySelector(`[data-stage] .item[data-id="${CSS.escape(sel)}"]`)?.focus({ preventScroll: true }); }
app.addEventListener('focusin', (e) => { const g = e.target.closest?.('.item[data-id]'); if (g && sel !== g.dataset.id) { sel = g.dataset.id; app.querySelectorAll('.item.sel').forEach(x => x.classList.remove('sel')); app.querySelectorAll(`.item[data-id="${CSS.escape(sel)}"]`).forEach(x => x.classList.add('sel')); editor(); } });
app.addEventListener('keydown', (e) => {
  const g = e.target.closest?.('.item[data-id]'); if (!g) return;
  const it = plan.items.find(i => i.id === g.dataset.id); if (!it) return;
  const s = e.shiftKey ? 6 : 1, m = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
  if (m) { it.x += m[0]; it.y += m[1]; clampItem(it); }
  else if (e.key === 'r' || e.key === 'R') { rotate(it); clampItem(it); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { plan.items = plan.items.filter(i => i !== it); sel = null; }
  else return;
  e.preventDefault(); sel = it && plan.items.includes(it) ? it.id : null; change(); if (sel) focusSel();
});

/* ---------- init ---------- */
const sel0 = $('[data-preset]');
sel0.innerHTML = Object.entries(PRESETS.reduce((g, p) => ((g[p.group] ||= []).push(p), g), {}))
  .map(([g, ps]) => `<optgroup label="${g}">${ps.map(p => `<option value="${p.key}">${esc(p.label)} – ${p.w}×${p.d} in</option>`).join('')}</optgroup>`).join('');
const ld = $('[data-load]');
if (ld) ld.innerHTML = '<option value="">Load a measured layout…</option>' + LAYOUTS.filter(L => MODE === 'swap' ? L.states : true).map(L => `<option value="${L.slug}">${esc(L.title)}</option>`).join('');
plan = load(); plan.doors ||= []; plan.windows ||= [];
roomFields(); render(true); compare();
app.classList.add('ready');
