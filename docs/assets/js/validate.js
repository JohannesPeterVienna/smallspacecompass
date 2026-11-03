/* Small Space Compass – input and storage validation for the tools.
   Pure functions only (no DOM), so the same file runs in the browser and in Node tests.
   All lengths are inches. */
import { analyzePlan, CM } from './geometry.js';

export const LIMITS = { roomMin: 24, roomMax: 1200, itemMax: 1200, zoneMax: 240, posMin: -1200, posMax: 2400, items: 200, openings: 40, zones: 12, label: 80 };
const SIDES = ['N', 'E', 'S', 'W'], STATES = ['day', 'night'];
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const num = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
class Bad extends Error {}
const need = (cond, msg) => { if (!cond) throw new Bad(msg); };
const str = (v, path, max = LIMITS.label, allowEmpty = false) => { need(typeof v === 'string' && (allowEmpty || v.trim() !== '') && v.length <= max, `${path} must be text (1–${max} characters)`); return v; };
const optBool = (o, k, path, out) => { if (o[k] === undefined) return; need(typeof o[k] === 'boolean', `${path}.${k} must be true or false`); out[k] = o[k]; };
const optEnum = (o, k, list, path, out) => { if (o[k] === undefined || o[k] === null || o[k] === '') return; need(list.includes(o[k]), `${path}.${k} must be one of ${list.join(', ')}`); out[k] = o[k]; };

function zone(z, path) {
  need(isObj(z), `${path} must be an object`);
  const out = {};
  need(SIDES.includes(z.side), `${path}.side must be one of N, E, S, W`); out.side = z.side;
  need(num(z.depth, 0, LIMITS.zoneMax), `${path}.depth must be a number from 0 to ${LIMITS.zoneMax} in`); out.depth = z.depth;
  out.kind = z.kind === undefined ? 'zone' : str(z.kind, `${path}.kind`, 40);
  optBool(z, 'walk', path, out); optEnum(z, 'state', STATES, path, out);
  for (const k of ['at', 'len']) if (z[k] !== undefined && z[k] !== null) { need(num(z[k], 0, LIMITS.itemMax), `${path}.${k} must be a number from 0 to ${LIMITS.itemMax}`); out[k] = z[k]; }
  if (z.ignore !== undefined) out.ignore = str(z.ignore, `${path}.ignore`, 40);
  return out;
}
function item(it, path, ids) {
  need(isObj(it), `${path} must be an object`);
  const out = {};
  out.id = str(it.id, `${path}.id`, 40); need(!ids.has(out.id), `${path}.id "${out.id}" is used twice`); ids.add(out.id);
  out.label = str(it.label, `${path}.label`);
  for (const k of ['w', 'd']) { need(num(it[k], 0, LIMITS.itemMax) && it[k] > 0, `${path}.${k} must be a number above 0 and at most ${LIMITS.itemMax} in`); out[k] = it[k]; }
  for (const k of ['x', 'y']) { need(num(it[k], LIMITS.posMin, LIMITS.posMax), `${path}.${k} must be a number from ${LIMITS.posMin} to ${LIMITS.posMax} in`); out[k] = it[k]; }
  if (it.zones !== undefined) {
    need(Array.isArray(it.zones) && it.zones.length <= LIMITS.zones, `${path}.zones must be a list of at most ${LIMITS.zones} zones`);
    out.zones = it.zones.map((z, i) => zone(z, `${path}.zones[${i}]`));
  }
  if (it.ext !== undefined && it.ext !== null) {
    const e = it.ext, p = `${path}.ext`;
    need(isObj(e), `${p} must be an object`);
    need(STATES.includes(e.state), `${p}.state must be day or night`);
    need(SIDES.includes(e.side), `${p}.side must be one of N, E, S, W`);
    need(num(e.depth, 0, LIMITS.zoneMax), `${p}.depth must be a number from 0 to ${LIMITS.zoneMax} in`);
    out.ext = { state: e.state, side: e.side, depth: e.depth };
  }
  optEnum(it, 'only', STATES, path, out); optBool(it, 'target', path, out); optBool(it, 'floor', path, out);
  if (it.stack !== undefined) out.stack = str(it.stack, `${path}.stack`, 40);
  if (it.zoneIgnore !== undefined) { need(Array.isArray(it.zoneIgnore) && it.zoneIgnore.length <= LIMITS.items, `${path}.zoneIgnore must be a list of ids`); out.zoneIgnore = it.zoneIgnore.map((s, i) => str(s, `${path}.zoneIgnore[${i}]`, 40)); }
  return out;
}
function opening(o, path, isDoor, W, D) {
  need(isObj(o), `${path} must be an object`);
  const out = {};
  out.id = o.id === undefined ? undefined : str(o.id, `${path}.id`, 40);
  if (out.id === undefined) delete out.id;
  if (o.label !== undefined) out.label = str(o.label, `${path}.label`);
  need(SIDES.includes(o.wall), `${path}.wall must be one of N, E, S, W`); out.wall = o.wall;
  const len = o.wall === 'N' || o.wall === 'S' ? W : D;
  need(num(o.width, 1, len), `${path}.width must be a number above 0 and no wider than the wall (${len} in)`); out.width = o.width;
  need(num(o.offset, 0, len - o.width), `${path}.offset must be a number from 0 to ${+(len - o.width).toFixed(2)} in so the opening stays on the wall`); out.offset = o.offset;
  if (isDoor) {
    optEnum(o, 'hinge', ['start', 'end'], path, out); optEnum(o, 'swing', ['in', 'out', 'none'], path, out); optBool(o, 'entry', path, out);
    out.hinge ||= 'start'; out.swing ||= 'in';
  } else optBool(o, 'target', path, out);
  return out;
}

/* Full schema check of a plan. Returns { ok: true, plan } with a clean copy (known fields only)
   or { ok: false, error } with a message that names the failing field. Never throws. */
export function validatePlan(p) {
  try {
    need(isObj(p), 'the file is not a plan object');
    need(isObj(p.room), 'room is missing');
    const W = p.room.W, D = p.room.D;
    need(num(W, LIMITS.roomMin, LIMITS.roomMax), `room.W must be a number from ${LIMITS.roomMin} to ${LIMITS.roomMax} in`);
    need(num(D, LIMITS.roomMin, LIMITS.roomMax), `room.D must be a number from ${LIMITS.roomMin} to ${LIMITS.roomMax} in`);
    need(Array.isArray(p.items) && p.items.length <= LIMITS.items, `items must be a list of at most ${LIMITS.items} pieces`);
    for (const k of ['doors', 'windows']) need(p[k] === undefined || (Array.isArray(p[k]) && p[k].length <= LIMITS.openings), `${k} must be a list of at most ${LIMITS.openings} entries`);
    const ids = new Set();
    const plan = { room: { W, D } };
    plan.items = p.items.map((it, i) => item(it, `items[${i}]`, ids));
    plan.doors = (p.doors || []).map((o, i) => opening(o, `doors[${i}]`, true, W, D));
    plan.windows = (p.windows || []).map((o, i) => opening(o, `windows[${i}]`, false, W, D));
    for (const k of ['slug', 'title', 'short', 'kind']) if (typeof p[k] === 'string' && p[k].length <= 200) plan[k] = p[k];
    if (Array.isArray(p.states) && p.states.every(s => STATES.includes(s))) plan.states = [...p.states];
    if (Array.isArray(p.acceptPinch) && p.acceptPinch.every(s => typeof s === 'string')) plan.acceptPinch = [...p.acceptPinch];
    return { ok: true, plan };
  } catch (e) {
    return { ok: false, error: e instanceof Bad ? e.message : 'the plan could not be read' };
  }
}

/* Validate a candidate in isolation and run the full analysis on it for every state the tool shows.
   Only if both succeed is the candidate safe to adopt (replace the current plan and save it). */
export function preparePlan(candidate, states = [undefined], cell = 1) {
  const v = validatePlan(candidate);
  if (!v.ok) return v;
  const results = {};
  try {
    for (const st of states) results[st] = analyzePlan(v.plan, { state: st, cell });
  } catch (e) {
    return { ok: false, error: 'the plan could not be analysed' };
  }
  return { ok: true, plan: v.plan, results };
}

/* ---------- Will It Fit? state ---------- */
// Stored canonically: every length in inches at full precision, plus the display unit.
export const DELIVERY_STORE = 'ssc-delivery-v2', DELIVERY_STORE_V1 = 'ssc-delivery-v1';
export const DELIVERY_LENGTHS = ['W', 'D', 'H', 'diag', 'doorW', 'doorH', 'hallA', 'hallB', 'hallH', 'stairW', 'stairH', 'door2W', 'door2H'];
export const DELIVERY_CHECKS = ['upright', 'useDoor', 'useCorner', 'useLanding', 'useDoor2'];
const lenOk = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 10000);
export function encodeDelivery(state) {
  return JSON.stringify({ v: 2, unit: state.unit === 'cm' ? 'cm' : 'in', lengths: state.lengths, checks: state.checks });
}
// Returns { unit, lengths, checks } or null. v1 data (field values without a unit) was always read back as inches
// on reload, so it is migrated as inches; anything that is not a non-negative number is dropped.
export function decodeDelivery(v2raw, v1raw) {
  const out = { unit: 'in', lengths: {}, checks: {} };
  try {
    const s = v2raw ? JSON.parse(v2raw) : null;
    if (isObj(s) && s.v === 2) {
      out.unit = s.unit === 'cm' ? 'cm' : 'in';
      if (isObj(s.lengths)) for (const k of DELIVERY_LENGTHS) if (k in s.lengths && lenOk(s.lengths[k])) out.lengths[k] = s.lengths[k];
      if (isObj(s.checks)) for (const k of DELIVERY_CHECKS) if (typeof s.checks[k] === 'boolean') out.checks[k] = s.checks[k];
      return out;
    }
  } catch (e) { /* fall through to v1 */ }
  try {
    const s = v1raw ? JSON.parse(v1raw) : null;
    if (!Array.isArray(s)) return null;
    for (const pair of s) {
      if (!Array.isArray(pair) || pair.length !== 2) continue;
      const [n, v] = pair;
      if (DELIVERY_LENGTHS.includes(n)) {
        if (v === '' || v === null) out.lengths[n] = null;
        else { const x = typeof v === 'number' ? v : parseFloat(v); if (lenOk(x)) out.lengths[n] = x; }
      } else if (DELIVERY_CHECKS.includes(n) && typeof v === 'boolean') out.checks[n] = v;
    }
    return out;
  } catch (e) { return null; }
}
export const toDisplay = (inch, unit) => !(typeof inch === 'number' && Number.isFinite(inch)) ? '' : String(unit === 'cm' ? +(inch * CM).toFixed(1) : +inch.toFixed(2));
export const fromDisplay = (text, unit) => {
  const t = String(text ?? '').trim();
  if (t === '') return null;
  const v = Number(t);
  if (!Number.isFinite(v)) return NaN;
  return unit === 'cm' ? v / CM : v;
};

/* ---------- Storage Wall ---------- */
// Rules for one unit field; returns an error message or ''.
export function storageFieldError(k, v) {
  if (!(typeof v === 'number' && Number.isFinite(v))) return 'Enter a number.';
  if ((k === 'w' || k === 'depth' || k === 'top') && v <= 0) return 'Must be more than 0.';
  if ((k === 'x' || k === 'bottom') && v < 0) return 'Cannot be negative.';
  if (v > 1200) return 'Too large (max 1200 in).';
  return '';
}
export function validStorageUnit(u) {
  return isObj(u) && typeof u.id === 'string' && u.id && typeof u.label === 'string'
    && ['x', 'w', 'bottom', 'top', 'depth'].every(k => !storageFieldError(k, u[k]))
    && u.top > u.bottom && Array.isArray(u.shelves) && u.shelves.every(h => typeof h === 'number' && Number.isFinite(h) && h > u.bottom && h < u.top);
}
export function validStorage(S) {
  return isObj(S) && isObj(S.wall) && num(S.wall.W, 12, 600) && num(S.wall.H, 12, 600) && Array.isArray(S.units) && S.units.length <= 100 && S.units.every(validStorageUnit);
}
