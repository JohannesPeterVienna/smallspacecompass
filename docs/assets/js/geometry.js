/* Small Space Compass – clearance geometry.
   All lengths are inches internally. Origin top-left of the room, x → east, y → south.
   Pure functions only, so the same file runs in the browser and in Node tests. */

export const CM = 2.54;
export const ADA_ROUTE = 36;           // ADA 2010 §403.5.1 walking-surface clear width
const EPS = 1e-6;

export const fmtLen = (inch, units = 'in', digits) => {
  if (units === 'cm') return `${(inch * CM).toFixed(digits ?? 0)} cm`;
  const d = digits ?? (Math.abs(inch - Math.round(inch)) < 0.05 ? 0 : 1);
  return `${inch.toFixed(d)} in`;
};
export const fmtFtIn = (inch) => {
  const ft = Math.floor((inch + 0.01) / 12), rest = Math.round(inch - ft * 12);
  return rest === 12 ? `${ft + 1}′0″` : `${ft}′${rest}″`;
};

/* ---------- rectangles ---------- */
export const rect = (x, y, w, d) => ({ x, y, w, d });
export function overlapArea(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y);
  return ox > EPS && oy > EPS ? ox * oy : 0;
}
export const rectsOverlap = (a, b, tol = 0.01) => {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y);
  return ox > tol && oy > tol;
};
export const rectInside = (r, W, D, tol = 0.01) =>
  r.x >= -tol && r.y >= -tol && r.x + r.w <= W + tol && r.y + r.d <= D + tol;
export function pointRectDist(px, py, r) {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.d));
  return Math.hypot(dx, dy);
}

/* side helpers: N/E/S/W in room coordinates */
export function sideStrip(r, side, depth) {
  switch (side) {
    case 'N': return rect(r.x, r.y - depth, r.w, depth);
    case 'S': return rect(r.x, r.y + r.d, r.w, depth);
    case 'W': return rect(r.x - depth, r.y, depth, r.d);
    case 'E': return rect(r.x + r.w, r.y, depth, r.d);
  }
  throw new Error('bad side ' + side);
}
function unionRect(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return rect(x, y, Math.max(a.x + a.w, b.x + b.w) - x, Math.max(a.y + a.d, b.y + b.d) - y);
}

/* ---------- items ---------- */
// item: {id,label,type,x,y,w,d, zones:[{side,depth,kind}], ext:{state,side,depth}, only:'day'|'night', floor:false (rug) }
export function itemActive(item, state) { return !item.only || !state || item.only === state; }
export function itemRect(item, state) {
  let r = rect(item.x, item.y, item.w, item.d);
  if (item.ext && state && item.ext.state === state) r = unionRect(r, sideStrip(r, item.ext.side, item.ext.depth));
  return r;
}
export function zoneRects(item, state) {
  const base = itemRect(item, state);
  return (item.zones || []).filter(z => !z.state || z.state === state)
    .map(z => {
      const r = sideStrip(base, z.side, z.depth);
      // optional part of a side: z.at = offset from the item's start along that side, z.len = length
      if (z.at != null || z.len != null) {
        const along = z.side === 'N' || z.side === 'S' ? ['x', 'w'] : ['y', 'd'];
        const at = z.at || 0, len = z.len ?? (r[along[1]] - at);
        r[along[0]] = base[along[0]] + at; r[along[1]] = len;
      }
      return { ...r, kind: z.kind || 'use', walk: !!z.walk, owner: item.id };
    });
}
/* Clear distance from one face of an item to the nearest wall or solid item straight in front of that face.
   Used to state measured gaps in captions from the same geometry that draws the plan. */
export function sideClearance(plan, id, side, state) {
  const it = plan.items.find(i => i.id === id), r = itemRect(it, state), { W, D } = plan.room;
  const others = plan.items.filter(o => o.id !== id && o.stack !== id && it.stack !== o.id && itemActive(o, state) && isObstacle(o)).map(o => itemRect(o, state));
  const spanX = (o) => o.x < r.x + r.w - EPS && o.x + o.w > r.x + EPS, spanY = (o) => o.y < r.y + r.d - EPS && o.y + o.d > r.y + EPS;
  let best;
  if (side === 'S') { best = D - r.y - r.d; for (const o of others) if (spanX(o) && o.y >= r.y + r.d - EPS) best = Math.min(best, o.y - r.y - r.d); }
  else if (side === 'N') { best = r.y; for (const o of others) if (spanX(o) && o.y + o.d <= r.y + EPS) best = Math.min(best, r.y - o.y - o.d); }
  else if (side === 'E') { best = W - r.x - r.w; for (const o of others) if (spanY(o) && o.x >= r.x + r.w - EPS) best = Math.min(best, o.x - r.x - r.w); }
  else { best = r.x; for (const o of others) if (spanY(o) && o.x + o.w <= r.x + EPS) best = Math.min(best, r.x - o.x - o.w); }
  return best;
}
export const isObstacle = (item) => item.floor !== true;

/* ---------- doors ---------- */
// door: {id, wall:'N'|'E'|'S'|'W', offset, width, hinge:'start'|'end', swing:'in'|'out'|'none'}
export function doorGeom(door, W, D) {
  const { wall, offset: o, width: w } = door;
  let a, b, n; // jamb points a(start) → b(end) along wall, n = inward normal
  if (wall === 'N') { a = [o, 0]; b = [o + w, 0]; n = [0, 1]; }
  else if (wall === 'S') { a = [o, D]; b = [o + w, D]; n = [0, -1]; }
  else if (wall === 'W') { a = [0, o]; b = [0, o + w]; n = [1, 0]; }
  else { a = [W, o]; b = [W, o + w]; n = [-1, 0]; }
  const hinge = door.hinge === 'end' ? b : a, other = door.hinge === 'end' ? a : b;
  const u = [Math.sign(other[0] - hinge[0]), Math.sign(other[1] - hinge[1])];
  const dir = door.swing === 'out' ? [-n[0], -n[1]] : n;
  return { a, b, n, hinge, u, dir, r: w, center: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
}
// quarter disc = {cx, cy, r, u, dir}; both axis aligned unit vectors.
export function swingSector(door, W, D) {
  if (door.swing === 'none' || door.swing === 'out') return null;
  const g = doorGeom(door, W, D);
  return { cx: g.hinge[0], cy: g.hinge[1], r: g.r, u: g.u, v: g.dir };
}
export function pointInSector(px, py, s) {
  const dx = px - s.cx, dy = py - s.cy;
  return dx * s.u[0] + dy * s.u[1] >= -EPS && dx * s.v[0] + dy * s.v[1] >= -EPS && dx * dx + dy * dy <= s.r * s.r + EPS;
}
// exact: clip rect to the quadrant spanned by u and v, then test the clipped rect against the disc.
export function sectorIntersectsRect(s, r, tol = 0.01) {
  let x0 = r.x, x1 = r.x + r.w, y0 = r.y, y1 = r.y + r.d;
  const ax = s.u[0] || s.v[0], ay = s.u[1] || s.v[1];   // quadrant signs
  if (ax > 0) x0 = Math.max(x0, s.cx); else x1 = Math.min(x1, s.cx);
  if (ay > 0) y0 = Math.max(y0, s.cy); else y1 = Math.min(y1, s.cy);
  if (x1 - x0 <= tol || y1 - y0 <= tol) return false;
  return pointRectDist(s.cx, s.cy, rect(x0, y0, x1 - x0, y1 - y0)) < s.r - tol;
}

/* ---------- conflicts ---------- */
export function findConflicts(plan, state) {
  const { W, D } = plan.room, out = [];
  const items = plan.items.filter(i => itemActive(i, state));
  const solids = items.filter(isObstacle);
  const sectors = (plan.doors || []).map(d => ({ d, s: swingSector(d, W, D) })).filter(o => o.s);
  for (const it of items) {
    const r = itemRect(it, state);
    if (!rectInside(r, W, D)) out.push({ type: 'outside', a: it.id, msg: `${it.label} extends beyond the walls` });
  }
  for (let i = 0; i < solids.length; i++) for (let j = i + 1; j < solids.length; j++) {
    const A = solids[i], B = solids[j];
    if (A.stack === B.id || B.stack === A.id) continue;
    if (rectsOverlap(itemRect(A, state), itemRect(B, state))) out.push({ type: 'overlap', a: A.id, b: B.id, msg: `${A.label} overlaps ${B.label}` });
  }
  for (const { d, s } of sectors) for (const it of solids) {
    if (sectorIntersectsRect(s, itemRect(it, state))) out.push({ type: 'door', a: it.id, b: d.id, msg: `${it.label} is inside the swing of ${d.label || 'the door'}` });
  }
  const zones = items.flatMap(it => zoneRects(it, state).map(z => ({ z, it })));
  for (const { z, it } of zones) {
    for (const o of solids) {
      if (o.id === it.id || o.id === z.ignore) continue;
      if ((it.zoneIgnore || []).includes(o.id)) continue;
      if (rectsOverlap(z, itemRect(o, state))) out.push({ type: 'zone', a: it.id, b: o.id, msg: `${o.label} blocks the ${z.kind} zone of ${it.label}` });
    }
    if (!rectInside(z, W, D)) out.push({ type: 'zone-wall', a: it.id, msg: `The ${z.kind} zone of ${it.label} runs into a wall` });
    for (const { d, s } of sectors) if (sectorIntersectsRect(s, z)) out.push({ type: 'zone-door', severity: 'warn', a: it.id, b: d.id, msg: `The ${z.kind} zone of ${it.label} overlaps the swing of ${d.label || 'the door'}` });
  }
  return out;
}

/* ---------- grid + distance field ---------- */
export function buildGrid(plan, { state, zonesBlock = true, cell, exclude = null } = {}) {
  const { W, D } = plan.room;
  const doors = plan.doors || [];
  const B = Math.max(12, ...doors.map(d => d.width + 4));
  const c = cell || Math.max(0.5, Math.sqrt(((W + 2 * B) * (D + 2 * B)) / 160000));
  const gw = Math.ceil((W + 2 * B) / c), gh = Math.ceil((D + 2 * B) / c);
  const blocked = new Uint8Array(gw * gh);
  const inRoom = new Uint8Array(gw * gh);
  const vest = doors.map(d => {
    const g = doorGeom(d, W, D);
    const x0 = Math.min(g.a[0], g.b[0]), y0 = Math.min(g.a[1], g.b[1]);
    if (d.wall === 'N') return rect(x0, -B, d.width, B);
    if (d.wall === 'S') return rect(x0, D, d.width, B);
    if (d.wall === 'W') return rect(-B, y0, B, d.width);
    return rect(W, y0, B, d.width);
  });
  const items = plan.items.filter(i => itemActive(i, state) && i.id !== exclude);
  const obs = items.filter(isObstacle).map(i => itemRect(i, state));
  if (zonesBlock) for (const i of items) obs.push(...zoneRects(i, state).filter(z => !z.walk));
  for (let j = 0; j < gh; j++) {
    const y = (j + 0.5) * c - B;
    for (let i = 0; i < gw; i++) {
      const x = (i + 0.5) * c - B, k = j * gw + i;
      const inside = x > 0 && x < W && y > 0 && y < D;
      if (!inside) {
        blocked[k] = vest.some(v => x > v.x && x < v.x + v.w && y > v.y && y < v.y + v.d) ? 0 : 1;
        continue;
      }
      inRoom[k] = 1;
      for (const r of obs) if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.d) { blocked[k] = 1; break; }
    }
  }
  return { gw, gh, c, B, blocked, inRoom, W, D, obs };
}

// Felzenszwalb–Huttenlocher exact squared Euclidean distance transform (in cells²).
function edt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s;
    while (true) {
      const p = v[k];
      s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
      if (s <= z[k]) { k--; if (k < 0) { k = 0; break; } } else break;
    }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; d[q] = (q - p) * (q - p) + f[p]; }
}
export function distanceField(grid) {
  const { gw, gh, blocked } = grid, INF = 1e12;
  const out = new Float64Array(gw * gh);
  const n = Math.max(gw, gh), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  for (let i = 0; i < gw; i++) {
    for (let j = 0; j < gh; j++) f[j] = blocked[j * gw + i] ? 0 : INF;
    edt1d(f, gh, d, v, z);
    for (let j = 0; j < gh; j++) out[j * gw + i] = d[j];
  }
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) f[i] = out[j * gw + i];
    edt1d(f, gw, d, v, z);
    for (let i = 0; i < gw; i++) out[j * gw + i] = d[i];
  }
  // clearance radius in inches (distance from cell centre to obstacle edge)
  for (let k = 0; k < out.length; k++) out[k] = blocked[k] ? 0 : Math.max(0, (Math.sqrt(out[k]) - 0.5) * grid.c);
  return out;
}

/* binary max-heap keyed by value */
class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const K = this.k, V = this.v; let i = K.length; K.push(key); V.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (V[p] >= V[i]) break; [K[p], K[i]] = [K[i], K[p]]; [V[p], V[i]] = [V[i], V[p]]; i = p; }
  }
  pop() {
    const K = this.k, V = this.v, top = K[0], tv = V[0], lk = K.pop(), lv = V.pop();
    if (K.length) {
      K[0] = lk; V[0] = lv; let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < K.length && V[l] > V[m]) m = l; if (r < K.length && V[r] > V[m]) m = r;
        if (m === i) break; [K[m], K[i]] = [K[i], K[m]]; [V[m], V[i]] = [V[i], V[m]]; i = m; }
    }
    return [top, tv];
  }
}
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];

/* widest route: maximise the narrowest clearance, then take the shortest path at that width */
export function widestRoute(grid, clr, startXY, goalRect, { ignoreNear = null, reach = 4, approach = 0 } = {}) {
  const { gw, gh, c, B, blocked, inRoom } = grid;
  const toIdx = (x, y) => Math.floor((y + B) / c) * gw + Math.floor((x + B) / c);
  const eff = (k) => {
    const x = (k % gw + 0.5) * c - B, y = ((k / gw | 0) + 0.5) * c - B;
    if (approach && pointRectDist(x, y, goalRect) <= approach) return Infinity;
    if (!ignoreNear) return clr[k];
    return Math.hypot(x - ignoreNear.x, y - ignoreNear.y) <= ignoreNear.r || !inRoom[k] ? Infinity : clr[k];
  };
  const isGoal = (k) => {
    if (!inRoom[k] || blocked[k]) return false;
    const x = (k % gw + 0.5) * c - B, y = ((k / gw | 0) + 0.5) * c - B;
    return pointRectDist(x, y, goalRect) <= reach;
  };
  const s = toIdx(startXY[0], startXY[1]);
  if (blocked[s]) return null;
  const best = new Float64Array(gw * gh).fill(-1);
  const h = new Heap(); best[s] = eff(s); h.push(s, best[s]);
  let goalBest = -1, goalCell = -1;
  while (h.size) {
    const [k, b] = h.pop();
    if (b < best[k]) continue;
    if (isGoal(k)) { goalBest = b; goalCell = k; break; }
    const i = k % gw, j = k / gw | 0;
    for (const [di, dj] of NB) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= gw || nj >= gh) continue;
      const nk = nj * gw + ni; if (blocked[nk]) continue;
      if (di && dj && (blocked[j * gw + ni] || blocked[nj * gw + i])) continue;
      const nb = Math.min(b, eff(nk));
      if (nb > best[nk]) { best[nk] = nb; h.push(nk, nb); }
    }
  }
  if (goalCell < 0) return { found: false, width: 0 };
  // shortest path among cells whose effective clearance ≥ goalBest (A* with octile heuristic)
  const thr = goalBest - 1e-9, gx = goalRect.x + goalRect.w / 2, gy = goalRect.y + goalRect.d / 2;
  const dist = new Float64Array(gw * gh).fill(Infinity), prev = new Int32Array(gw * gh).fill(-1);
  const open = new Heap(); dist[s] = 0; open.push(s, 0);
  const hcost = (k) => { const x = (k % gw + 0.5) * c - B, y = ((k / gw | 0) + 0.5) * c - B; return pointRectDist(x, y, goalRect) / c * 0.999; };
  let end = -1;
  while (open.size) {
    const [k, negf] = open.pop(), g = dist[k];
    if (-negf > g + hcost(k) + 1e-9) continue;
    if (isGoal(k)) { end = k; break; }
    const i = k % gw, j = k / gw | 0;
    for (const [di, dj, w] of NB) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= gw || nj >= gh) continue;
      const nk = nj * gw + ni; if (blocked[nk] || eff(nk) < thr) continue;
      if (di && dj && (blocked[j * gw + ni] || blocked[nj * gw + i])) continue;
      const ng = g + w; if (ng < dist[nk]) { dist[nk] = ng; prev[nk] = k; open.push(nk, -(ng + hcost(nk))); }
    }
  }
  if (end < 0) end = goalCell;
  const path = []; let pinch = null, pv = Infinity;
  for (let k = end; k >= 0; k = prev[k]) {
    const x = (k % gw + 0.5) * c - B, y = ((k / gw | 0) + 0.5) * c - B;
    path.push([x, y]);
    const e = eff(k); if (e < pv) { pv = e; pinch = { x, y, k }; }
    if (k === s) break;
  }
  path.reverse();
  const length = dist[end] < Infinity ? dist[end] * c : path.length * c;
  return { found: true, radius: goalBest, width: Number.isFinite(goalBest) ? 2 * goalBest + c : Infinity, path, pinch, length, gx, gy };
}

/* exact width at a pinch: nearest obstacle point, then a ray across the gap */
function nearestOn(px, py, rects, W, D) {
  let best = { d: Infinity, x: 0, y: 0 };
  const walls = [rect(-1e3, -1e3, W + 2e3, 1e3), rect(-1e3, D, W + 2e3, 1e3), rect(-1e3, 0, 1e3, D), rect(W, 0, 1e3, D)];
  for (const r of [...rects, ...walls]) {
    const qx = Math.min(Math.max(px, r.x), r.x + r.w), qy = Math.min(Math.max(py, r.y), r.y + r.d);
    const d = Math.hypot(px - qx, py - qy); if (d < best.d) best = { d, x: qx, y: qy };
  }
  return best;
}
function rayHit(ox, oy, dx, dy, rects, W, D) {
  let tmin = Infinity;
  const walls = [rect(-1e3, -1e3, W + 2e3, 1e3), rect(-1e3, D, W + 2e3, 1e3), rect(-1e3, 0, 1e3, D), rect(W, 0, 1e3, D)];
  for (const r of [...rects, ...walls]) {
    let t0 = 1e-6, t1 = Infinity;
    for (const [o, d, lo, hi] of [[ox, dx, r.x, r.x + r.w], [oy, dy, r.y, r.y + r.d]]) {
      if (Math.abs(d) < 1e-12) { if (o <= lo || o >= hi) { t0 = Infinity; } continue; }
      let a = (lo - o) / d, b = (hi - o) / d; if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    }
    if (t0 <= t1 && t0 < tmin) tmin = t0;
  }
  return tmin;
}
export function measurePinch(grid, pinch) {
  if (!pinch) return null;
  const n = nearestOn(pinch.x, pinch.y, grid.obs, grid.W, grid.D);
  let dx = pinch.x - n.x, dy = pinch.y - n.y; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  // snap to axis when the gap is axis aligned (furniture is rectilinear)
  if (Math.abs(dx) > 0.92) { dx = Math.sign(dx); dy = 0; } else if (Math.abs(dy) > 0.92) { dy = Math.sign(dy); dx = 0; }
  const t = rayHit(n.x, n.y, dx, dy, grid.obs, grid.W, grid.D);
  if (!Number.isFinite(t)) return null;
  return { x1: n.x, y1: n.y, x2: n.x + dx * t, y2: n.y + dy * t, width: t };
}

/* ---------- whole-plan analysis ---------- */
export function targetsOf(plan, state) {
  const t = [];
  for (const it of plan.items) if (it.target && itemActive(it, state)) t.push({ id: it.id, label: it.label, rect: itemRect(it, state) });
  for (const w of plan.windows || []) if (w.target !== false) {
    const { W, D } = plan.room; let r;
    if (w.wall === 'N') r = rect(w.offset, 0, w.width, 0.01); else if (w.wall === 'S') r = rect(w.offset, D - 0.01, w.width, 0.01);
    else if (w.wall === 'W') r = rect(0, w.offset, 0.01, w.width); else r = rect(W - 0.01, w.offset, 0.01, w.width);
    t.push({ id: w.id, label: w.label || 'Window', rect: r, window: true });
  }
  return t;
}
export function analyzePlan(plan, { state, zonesBlock = true, cell, threshold = ADA_ROUTE } = {}) {
  const { W, D } = plan.room;
  const conflicts = findConflicts(plan, state);
  const grid = buildGrid(plan, { state, zonesBlock, cell });
  const clr = distanceField(grid);
  const items = plan.items.filter(i => itemActive(i, state));
  let free = 0, foot = 0, zone = 0;
  const zr = items.flatMap(i => zoneRects(i, state)), fr = items.filter(isObstacle).map(i => itemRect(i, state));
  const g2 = grid.c * grid.c;
  for (let k = 0; k < grid.blocked.length; k++) {
    if (!grid.inRoom[k]) continue;
    const x = (k % grid.gw + 0.5) * grid.c - grid.B, y = ((k / grid.gw | 0) + 0.5) * grid.c - grid.B;
    const inF = fr.some(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.d);
    if (inF) foot += g2; else if (zr.some(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.d)) zone += g2; else free += g2;
  }
  const door = (plan.doors || []).find(d => d.entry) || (plan.doors || [])[0];
  const routes = [];
  if (door) {
    const g = doorGeom(door, W, D);
    const start = [g.center[0] + g.n[0] * 2, g.center[1] + g.n[1] * 2];
    const ignoreNear = { x: g.center[0], y: g.center[1], r: Math.max(door.width / 2 + 3, 30) };
    for (const t of targetsOf(plan, state)) {
      // the target itself (and its own use zone) is where you are going, so it is not an obstacle on the way
      const tg = t.window ? grid : buildGrid(plan, { state, zonesBlock, cell: grid.c, exclude: t.id });
      const tc = t.window ? clr : distanceField(tg);
      const reach = t.window ? 18 : 4;
      const r = widestRoute(tg, tc, start, t.rect, { ignoreNear, reach, approach: t.window ? 24 : reach + 2 * grid.c });
      if (!r || !r.found) { routes.push({ target: t.id, label: t.label, found: false, width: 0, ok: false }); continue; }
      let width = r.width, pinchLine = null;
      if (Number.isFinite(width)) {
        const m = measurePinch(tg, r.pinch);
        if (m && Math.abs(m.width - width) <= grid.c * 2 + 0.5) { width = m.width; pinchLine = m; }
      }
      if (!Number.isFinite(width)) width = null;
      routes.push({ target: t.id, label: t.label, found: true, width, pinch: width === null ? null : r.pinch, pinchLine, path: r.path, length: r.length, ok: width === null || width >= threshold - 0.05 });
    }
  }
  const area = W * D;
  return { state, area, footprint: foot, zones: zone, free, freePct: free / area, conflicts, routes, cell: grid.c };
}

/* ---------- delivery geometry ---------- */
// Does a p×q rectangle fit inside an A×B rectangle (rotation allowed)? Carver (1956) condition.
export function rectFitsRect(p, q, A, B) {
  if (p < q) [p, q] = [q, p];
  if (A < B) [A, B] = [B, A];
  if (p <= A + EPS && q <= B + EPS) return true;
  if (q > B + EPS || p - q < EPS) return false;
  const need = (2 * p * q * A + (p * p - q * q) * Math.sqrt(p * p + q * q - A * A)) / (p * p + q * q);
  return B >= need - 1e-9;
}
// Longest rectangle of width w that can be carried flat around a right-angled corner between
// corridors of widths a and b: L(θ) = a·secθ + b·cscθ − w(tanθ + cotθ), minimised over θ.
export function cornerMaxLength(a, b, w, steps = 1800) {
  if (w >= Math.min(a, b) - EPS) return { L: 0, theta: 0 };
  let best = Infinity, th = 0;
  for (let i = 1; i < steps; i++) {
    const t = (i / steps) * Math.PI / 2, s = Math.sin(t), c = Math.cos(t);
    const L = a / c + b / s - w * (s / c + c / s);
    if (L < best) { best = L; th = t; }
  }
  // without rotating at all: enter with width across hall a, leave with the length across hall b
  if (w <= a + EPS && b > best) return { L: b, theta: Math.PI / 2, square: true };
  return { L: best, theta: th };
}
// Tilting the long axis up shortens the plan length: Lp = L cosφ + t sinφ, needs L sinφ + t cosφ ≤ H.
// noTilt: the item must stay upright, so the long axis may not be tilted up (φ = 0 only).
export function cornerPass(L, w, t, a, b, H, steps = 900, noTilt = false) {
  const lim = cornerMaxLength(a, b, w);
  if (lim.L === 0) return { pass: false, reason: 'width', need: w, lim };
  if (noTilt) {
    if (t > H + EPS) return { pass: false, reason: 'height', margin: H - t, phi: 0, lim };
    const m = lim.L - L;
    return { pass: m >= -EPS, margin: m, phi: 0, lim };
  }
  let bestMargin = -Infinity, bestPhi = 0;
  for (let i = 0; i <= steps; i++) {
    const phi = (i / steps) * Math.PI / 2;
    const vert = L * Math.sin(phi) + t * Math.cos(phi);
    if (vert > H + EPS) continue;
    const Lp = L * Math.cos(phi) + t * Math.sin(phi);
    const m = lim.L - Lp;
    if (m > bestMargin) { bestMargin = m; bestPhi = phi; }
    if (m >= 0 && i === 0) break; // flat works: prefer flat
  }
  return { pass: bestMargin >= -EPS, margin: bestMargin, phi: bestPhi, lim };
}
const ORIENT = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
// item {W (width/length), D (depth), H (height), diag (optional sofa diagonal depth), upright:boolean}
// checkpoint {kind:'door', width, height} | {kind:'corner', a, b, height} | {kind:'landing', width, height}
export function deliveryCheck(item, checkpoints) {
  const dims = [item.W, item.D, item.H], names = ['width', 'depth', 'height'];
  const results = checkpoints.map(cp => {
    const opts = [];
    for (const [li, wi, ti] of ORIENT) {
      // upright: the original height axis must stay vertical – only rotations about the vertical axis
      // (no tipping, no tilting in the door plane, no tilting the long axis up in a corner)
      if (item.upright && ti !== 2) continue;
      const L = dims[li], w = dims[wi], t = dims[ti];
      const label = `${names[li]} leading, ${names[ti]} vertical`;
      if (cp.kind === 'door') {
        if (item.upright) {
          const ok = w <= cp.width + EPS && t <= cp.height + EPS;
          opts.push({ ok, L, w, t, label, upright: true, margin: Math.min(cp.width - w, cp.height - t) });
        } else {
          const ok = rectFitsRect(w, t, cp.width, cp.height);
          opts.push({ ok, L, w, t, label, margin: Math.min(cp.width - Math.min(w, t), cp.height - Math.max(w, t)) });
        }
      } else {
        const a = cp.kind === 'landing' ? cp.width : cp.a, b = cp.kind === 'landing' ? cp.width : cp.b;
        const r = cornerPass(L, w, t, a, b, cp.height, 900, !!item.upright);
        opts.push({ ok: r.pass, L, w, t, label, margin: r.margin, phi: r.phi, theta: r.lim.theta, limit: r.lim.L });
      }
    }
    if (cp.kind === 'door' && item.diag && !item.upright) {
      // sofa profile rule: on its back/end, the L-shaped profile clears if the diagonal depth fits the opening
      const ok = item.diag <= cp.width + EPS && Math.min(item.H, item.D) <= cp.height + EPS;
      opts.push({ ok, label: 'tipped through using the diagonal depth', profile: true, margin: cp.width - item.diag });
    }
    opts.sort((x, y) => (y.ok - x.ok) || ((y.margin ?? -1e9) - (x.margin ?? -1e9)));
    return { cp, ok: opts.some(o => o.ok), best: opts[0], options: opts };
  });
  return { ok: results.every(r => r.ok), results };
}

/* ---------- storage wall ---------- */
export const REACH_LOW = 15, REACH_HIGH = 48; // ADA 2010 §308.2.1 / §308.3.1 unobstructed reach
// unit {x, w, bottom, top, depth, shelves} in inches; returns cubic inches per band
export function storageBands(units) {
  const bands = { low: 0, reach: 0, high: 0 };
  for (const u of units) {
    const span = (lo, hi) => Math.max(0, Math.min(u.top, hi) - Math.max(u.bottom, lo));
    const area = u.w * u.depth;
    bands.low += span(0, REACH_LOW) * area;
    bands.reach += span(REACH_LOW, REACH_HIGH) * area;
    bands.high += span(REACH_HIGH, 1e6) * area;
  }
  return bands;
}
export const cuIn2cuFt = (v) => v / 1728;
export const cuIn2L = (v) => v * 0.016387064;
// equal compartments in an opening (from the former Shelf Measure tool)
export function divideOpening(opening, n, divider, edge = 0) {
  const clear = opening - 2 * edge - (n - 1) * divider;
  if (n < 1 || clear <= 0) return null;
  const each = clear / n, cuts = [];
  for (let i = 1; i < n; i++) cuts.push(edge + i * each + (i - 1) * divider);
  return { each, cuts };
}
