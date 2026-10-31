/* SVG drawing for plans and elevations. Returns markup strings so the same code
   renders static figures at build time and live drawings in the tools. */
import { doorGeom, itemRect, zoneRects, itemActive, isObstacle, fmtLen, fmtFtIn, REACH_LOW, REACH_HIGH } from './geometry.js';

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n = (v) => +v.toFixed(2);
let uid = 0;

function dimLine(x1, y1, x2, y2, text, off, cls = 'dim') {
  // straight dimension with ticks, offset perpendicular by `off`
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const a = [x1 + nx * off, y1 + ny * off], b = [x2 + nx * off, y2 + ny * off];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, vert = Math.abs(dx) < Math.abs(dy);
  const t = 3;
  return `<g class="${cls}"><line x1="${n(x1)}" y1="${n(y1)}" x2="${n(a[0])}" y2="${n(a[1])}" class="ext"/><line x1="${n(x2)}" y1="${n(y2)}" x2="${n(b[0])}" y2="${n(b[1])}" class="ext"/>` +
    `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}"/>` +
    `<line x1="${n(a[0] - t * (dx / L + nx) / 1.4)}" y1="${n(a[1] - t * (dy / L + ny) / 1.4)}" x2="${n(a[0] + t * (dx / L + nx) / 1.4)}" y2="${n(a[1] + t * (dy / L + ny) / 1.4)}" class="tick"/>` +
    `<line x1="${n(b[0] - t * (dx / L + nx) / 1.4)}" y1="${n(b[1] - t * (dy / L + ny) / 1.4)}" x2="${n(b[0] + t * (dx / L + nx) / 1.4)}" y2="${n(b[1] + t * (dy / L + ny) / 1.4)}" class="tick"/>` +
    `<text x="${n(mx)}" y="${n(my)}" ${vert ? `transform="rotate(-90 ${n(mx)} ${n(my)})"` : ''} dy="-1.6" text-anchor="middle">${esc(text)}</text></g>`;
}

export function planSVG(plan, analysis, opt = {}) {
  const { W, D } = plan.room, units = opt.units || 'in', state = opt.state, pad = opt.pad ?? 26;
  const id = 'p' + (++uid);
  const vb = [-pad, -pad, W + 2 * pad, D + 2 * pad];
  const fs = Math.max(4.2, Math.min(W, D) / 26);
  const out = [];
  out.push(`<svg class="plan" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(n).join(' ')}" role="img" aria-labelledby="${id}t"${opt.interactive ? ' data-plan=""' : ''} style="--fs:${n(fs)}px">`);
  out.push(`<title id="${id}t">${esc(opt.title || plan.title || 'Measured floor plan')}</title>`);
  out.push(`<defs><pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" class="grid"/></pattern>` +
    `<pattern id="${id}h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" class="hatch"/></pattern></defs>`);
  out.push(`<rect x="0" y="0" width="${W}" height="${D}" fill="url(#${id}g)" class="floor"/>`);
  const items = plan.items.filter(i => itemActive(i, state));
  // rugs first
  for (const it of items.filter(i => !isObstacle(i))) {
    const r = itemRect(it, state);
    out.push(`<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.d)}" class="rug"/>`);
  }
  // zones
  for (const it of items) for (const z of zoneRects(it, state))
    out.push(`<rect x="${n(z.x)}" y="${n(z.y)}" width="${n(z.w)}" height="${n(z.d)}" class="zone" fill="url(#${id}h)"><title>${esc(it.label)} – ${esc(z.kind)} zone</title></rect>`);
  // route
  if (analysis && analysis.routes) for (const r of analysis.routes) if (r.found && r.path && r.path.length > 1) {
    out.push(`<polyline class="route${r.ok ? '' : ' tight'}" points="${r.path.filter((_, i, a) => i % 2 === 0 || i === a.length - 1).map(p => n(p[0]) + ',' + n(p[1])).join(' ')}"/>`);
  }
  // furniture
  const bad = new Set((analysis?.conflicts || []).filter(c => c.severity !== 'warn').flatMap(c => [c.a, c.b]));
  for (const it of items.filter(isObstacle)) {
    const r = itemRect(it, state), cx = r.x + r.w / 2, cy = r.y + r.d / 2;
    const f = Math.min(fs, r.w / Math.max(4, it.label.length) * 1.55, r.d / 2.4);
    out.push(`<g class="item${bad.has(it.id) ? ' conflict' : ''}${it.ext && it.ext.state === state ? ' open' : ''}" data-id="${esc(it.id)}"${opt.interactive ? ' tabindex="0" role="button"' : ''} aria-label="${esc(it.label)}, ${esc(fmtLen(it.w, units))} by ${esc(fmtLen(it.d, units))}">` +
      `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.d)}"/>` +
      (f >= 2.6 ? `<text x="${n(cx)}" y="${n(cy)}" style="font-size:${n(f)}px" text-anchor="middle" dominant-baseline="middle">${esc(it.label)}</text>` : '') + `</g>`);
  }
  // walls
  const wt = 4;
  out.push(`<rect x="${-wt / 2}" y="${-wt / 2}" width="${W + wt}" height="${D + wt}" class="wall"/>`);
  for (const w of plan.windows || []) {
    const t = w.wall === 'N' ? [w.offset, -wt / 2, w.width, wt] : w.wall === 'S' ? [w.offset, D - wt / 2, w.width, wt] : w.wall === 'W' ? [-wt / 2, w.offset, wt, w.width] : [W - wt / 2, w.offset, wt, w.width];
    out.push(`<rect x="${n(t[0])}" y="${n(t[1])}" width="${n(t[2])}" height="${n(t[3])}" class="window"/>`);
  }
  for (const d of plan.doors || []) {
    const g = doorGeom(d, W, D);
    const x0 = Math.min(g.a[0], g.b[0]) - (d.wall === 'W' || d.wall === 'E' ? wt / 2 : 0), y0 = Math.min(g.a[1], g.b[1]) - (d.wall === 'N' || d.wall === 'S' ? wt / 2 : 0);
    out.push(`<rect x="${n(x0)}" y="${n(y0)}" width="${n(d.wall === 'N' || d.wall === 'S' ? d.width : wt)}" height="${n(d.wall === 'N' || d.wall === 'S' ? wt : d.width)}" class="opening"/>`);
    if (d.swing !== 'none') {
      const h = g.hinge, end = [h[0] + g.dir[0] * g.r, h[1] + g.dir[1] * g.r], far = [h[0] + g.u[0] * g.r, h[1] + g.u[1] * g.r];
      const cross = g.u[0] * g.dir[1] - g.u[1] * g.dir[0];
      out.push(`<g class="door${d.swing === 'out' ? ' out' : ''}"><line x1="${n(h[0])}" y1="${n(h[1])}" x2="${n(end[0])}" y2="${n(end[1])}" class="leaf"/>` +
        `<path d="M${n(end[0])} ${n(end[1])}A${n(g.r)} ${n(g.r)} 0 0 ${cross > 0 ? 0 : 1} ${n(far[0])} ${n(far[1])}" class="arc"/></g>`);
    }
  }
  // pinch markers
  if (analysis && analysis.routes && !opt.noPinch) {
    const seen = new Set();
    for (const r of analysis.routes) if (r.found && r.pinchLine) {
      const p = r.pinchLine, key = [p.x1, p.y1, p.x2, p.y2].map(v => Math.round(v)).join();
      if (seen.has(key)) continue; seen.add(key);
      const mx = (p.x1 + p.x2) / 2, my = (p.y1 + p.y2) / 2;
      out.push(`<g class="pinch${r.ok ? '' : ' tight'}"><line x1="${n(p.x1)}" y1="${n(p.y1)}" x2="${n(p.x2)}" y2="${n(p.y2)}"/><circle cx="${n(mx)}" cy="${n(my)}" r="${n(fs * 0.45)}"/>` +
        `<text x="${n(mx + fs * 0.7)}" y="${n(my - fs * 0.5)}">${esc(fmtLen(p.width, units))}</text></g>`);
    }
  }
  // overall dims
  if (opt.dims !== false) {
    out.push(dimLine(0, 0, W, 0, units === 'cm' ? fmtLen(W, 'cm') : `${fmtFtIn(W)} (${fmtLen(W)})`, -14));
    out.push(dimLine(0, D, 0, 0, units === 'cm' ? fmtLen(D, 'cm') : `${fmtFtIn(D)} (${fmtLen(D)})`, -14));
  }
  for (const dm of opt.extraDims || []) out.push(dimLine(dm[0], dm[1], dm[2], dm[3], dm[4], dm[5] ?? 6, 'dim note'));
  out.push('</svg>');
  return out.join('');
}

/* wall elevation for storage: units {id,label,x,w,bottom,top,depth,shelves:[heights]} */
export function elevationSVG(wall, units, opt = {}) {
  const { W, H } = wall, pad = 24, u = opt.units || 'in', id = 'e' + (++uid);
  const fs = Math.max(4, W / 34);
  const o = [`<svg class="elev" xmlns="http://www.w3.org/2000/svg" viewBox="${-pad - 10} ${-pad} ${W + 2 * pad + 10} ${H + 2 * pad}" role="img" aria-labelledby="${id}t" style="--fs:${n(fs)}px">`,
    `<title id="${id}t">${esc(opt.title || 'Wall elevation with reach bands')}</title>`];
  const y = (h) => H - h;
  o.push(`<rect x="0" y="0" width="${W}" height="${H}" class="wallface"/>`);
  o.push(`<rect x="0" y="${y(REACH_HIGH)}" width="${W}" height="${REACH_HIGH - REACH_LOW}" class="band reach"/>`);
  o.push(`<line x1="0" x2="${W}" y1="${y(REACH_HIGH)}" y2="${y(REACH_HIGH)}" class="bandline"/><line x1="0" x2="${W}" y1="${y(REACH_LOW)}" y2="${y(REACH_LOW)}" class="bandline"/>`);
  o.push(`<text x="${-4}" y="${y(REACH_HIGH) + 1}" class="bandlabel" text-anchor="end">${esc(fmtLen(REACH_HIGH, u))}</text><text x="${-4}" y="${y(REACH_LOW) + 1}" class="bandlabel" text-anchor="end">${esc(fmtLen(REACH_LOW, u))}</text>`);
  for (const s of units) {
    o.push(`<g class="unit" data-id="${esc(s.id)}"${opt.interactive ? ' tabindex="0" role="button"' : ''} aria-label="${esc(s.label)}"><rect x="${n(s.x)}" y="${n(y(s.top))}" width="${n(s.w)}" height="${n(s.top - s.bottom)}"/>`);
    for (const sh of s.shelves || []) o.push(`<line x1="${n(s.x)}" x2="${n(s.x + s.w)}" y1="${n(y(sh))}" y2="${n(y(sh))}" class="shelf"/>`);
    for (const c of s.cuts || []) o.push(`<line x1="${n(s.x + c)}" x2="${n(s.x + c)}" y1="${n(y(s.top))}" y2="${n(y(s.bottom))}" class="shelf"/>`);
    const f = Math.min(fs, s.w / Math.max(4, s.label.length) * 1.6);
    o.push(`<text x="${n(s.x + s.w / 2)}" y="${n(y(s.top) - 2)}" text-anchor="middle" style="font-size:${n(f)}px">${esc(s.label)}</text></g>`);
  }
  o.push(`<line x1="${-pad}" x2="${W + pad}" y1="${H}" y2="${H}" class="floorline"/>`);
  o.push(dimLine(0, H, W, H, `${fmtLen(W, u)} wall`, 12));
  o.push(dimLine(W, H, W, 0, `${fmtLen(H, u)}`, -12));
  o.push('</svg>');
  return o.join('');
}

export { esc, dimLine };
