/* Clearance Check – the arithmetic behind "does it leave enough room?", compared with published widths.
   Pure functions (no DOM): the same file runs in the browser and in the Node tests.
   All lengths are inches internally; reference widths carry the id of their row in refdata.js. */
import { REFERENCE, SOURCES } from './refdata.js';

export const CM = 2.54;
const MM = (v) => v / 25.4;
export const QUICK_MAX = 1200;      // 100 ft – anything larger is a typing error
const has = (id) => { if (!REFERENCE.some(r => r.id === id)) throw new Error('unknown reference ' + id); return id; };

/* A reference width: need (in), what it is, and the reference row it comes from ('' = this site's own assumption). */
const T = (need, label, ref, own = false) => ({ need, label, ref: ref ? has(ref) : '', own });
const WALK = [
  T(28, 'Hallway minimum in a US manufactured home', 'hud-hall'),
  T(MM(750), 'Narrowest point of a corridor at a localised obstruction (England)', 'adm-hall1'),
  T(32, 'Short pinch, at most 24 in long', 'ada-pinch'),
  T(MM(900), 'Hall or landing, accessible and adaptable dwelling (England)', 'adm-hall2'),
  T(36, 'Walking surface on an accessible route', 'ada-walk')
];

export const SCENARIOS = {
  bed: {
    title: 'Bed on a wall', short: 'Bed',
    fields: [
      ['wall', 'Wall behind the headboard', 120], ['bedW', 'Bed width (frame)', 60],
      ['depth', 'Room depth from that wall', 144], ['bedL', 'Bed length (frame)', 80]
    ],
    options: [['sides', 'Sides you get in from', [['2', 'both sides'], ['1', 'one side (other side against the wall)']]]],
    examples: [
      ['Queen in 10 × 12 ft', { wall: 120, bedW: 60, depth: 144, bedL: 80, sides: '2' }],
      ['Queen in 9 × 10 ft', { wall: 108, bedW: 60, depth: 120, bedL: 80, sides: '2' }],
      ['Full in the corner, 9 × 10 ft', { wall: 108, bedW: 53, depth: 120, bedL: 75, sides: '1' }],
      ['UK double, 2.75 × 3.2 m', { wall: 2750 / 25.4, bedW: 1350 / 25.4, depth: 3200 / 25.4, bedL: 1900 / 25.4, sides: '2' }]
    ],
    planner: '/tools/clearance-planner/?layout=bedroom-12x10-queen',
    guide: ['/guides/space-between-bed-and-wall/', 'How much space between bed and wall?']
  },
  walkway: {
    title: 'Walkway between two pieces', short: 'Walkway',
    fields: [['gap', 'Gap between the two surfaces', 60]],
    options: [
      ['zoneA', 'What needs room on side A', [['0', 'nothing'], ['18', 'open drawer or sofa legroom'], ['24', 'bedside strip'], ['32', 'desk or dining chair']], true],
      ['zoneB', 'What needs room on side B', [['0', 'nothing'], ['18', 'open drawer or sofa legroom'], ['24', 'bedside strip'], ['32', 'desk or dining chair']], true]
    ],
    examples: [
      ['Desk chair opposite a wall, 60 in apart', { gap: 60, zoneA: '32', zoneB: '0' }],
      ['Sofa and TV unit, 48 in apart', { gap: 48, zoneA: '18', zoneB: '0' }],
      ['Dresser opposite the bed foot, 54 in apart', { gap: 54, zoneA: '18', zoneB: '0' }],
      ['Bare corridor, 31 in', { gap: 31, zoneA: '0', zoneB: '0' }]
    ],
    planner: '/tools/clearance-planner/',
    guide: ['/guides/walkway-space-around-furniture/', 'How much walkway space do you need?']
  },
  table: {
    title: 'Table and chairs', short: 'Table',
    fields: [['room', 'Room width across the table', 120], ['tableW', 'Table width (or diameter)', 36]],
    options: [['sides', 'Chairs on', [['2', 'both sides'], ['1', 'one side (table against the wall)']]]],
    examples: [
      ['36 in table in a 10 ft room', { room: 120, tableW: 36, sides: '2' }],
      ['30 in table against the wall, 7 ft wide', { room: 84, tableW: 30, sides: '1' }],
      ['42 in round table in 9 ft', { room: 108, tableW: 42, sides: '2' }],
      ['80 cm table in a 3 m room', { room: 3000 / 25.4, tableW: 800 / 25.4, sides: '2' }]
    ],
    planner: '/tools/clearance-planner/',
    guide: ['/guides/dining-table-small-space/', 'Dining table for a small space']
  },
  aisle: {
    title: 'Kitchen aisle', short: 'Kitchen aisle',
    fields: [['room', 'Wall to wall across the kitchen', 96], ['runA', 'Counter depth, side A', 25], ['runB', 'Counter depth, side B (0 = none)', 25]],
    options: [],
    examples: [
      ['Galley in an 8 ft room, two 25 in runs', { room: 96, runA: 25, runB: 25 }],
      ['Galley in 7 ft 4 in', { room: 88, runA: 25, runB: 25 }],
      ['Single wall, 6 ft wide kitchen', { room: 72, runA: 25, runB: 0 }],
      ['2.4 m room, two 600 mm runs', { room: 2400 / 25.4, runA: 600 / 25.4, runB: 600 / 25.4 }]
    ],
    planner: '/tools/clearance-planner/?layout=galley-kitchen-8x12',
    guide: ['/guides/small-kitchen-clearances/', 'Small kitchen clearances']
  }
};
export const SCENARIO_KEYS = Object.keys(SCENARIOS);

const THRESHOLDS = {
  bed: [
    T(24, 'Bedside strip – this site’s own planning assumption', '', true),
    T(MM(750), 'Clear access zone beside and at the foot of a bed (England, M4(2))', 'adm-bed-principal'),
    T(36, 'Walking surface, if the strip is also a route', 'ada-walk'),
    T(MM(1000), 'Clear access zone in a wheelchair user dwelling (England, M4(3))', 'adm-bed-wheel')
  ],
  walkway: WALK,
  table: [
    T(32, 'Table edge to wall, nobody passes behind the diner', 'nkba-seat-none'),
    T(36, 'Table edge to wall, people edge past', 'nkba-seat-edge'),
    T(44, 'Table edge to wall, people walk past', 'nkba-seat-walk')
  ],
  aisle: [
    T(36, 'Kitchen walkway where nobody works', 'nkba-walkway'),
    T(40, 'Pass-through kitchen, accessibility standard', 'ada-galley'),
    T(42, 'Work aisle for one cook', 'nkba-aisle'),
    T(MM(1200), 'Clear space in front of kitchen units (England, M4(2))', 'adm-kitchen'),
    T(48, 'Work aisle for multiple cooks', 'nkba-aisle')
  ]
};
export const thresholdsOf = (key) => THRESHOLDS[key] || [];

/* ---------- formatting ---------- */
export function fmt(inch, unit = 'in') {
  if (!Number.isFinite(inch)) return '–';
  if (unit === 'cm') return `${+(inch * CM).toFixed(1)} cm`;
  return `${+inch.toFixed(1)} in`;
}

/* ---------- validation ---------- */
const num = (v) => (typeof v === 'number' ? v : (String(v ?? '').trim() === '' ? NaN : Number(v)));
// Returns { ok, values } or { ok:false, errors:[field labels] }. Values are inches.
export function cleanInput(key, raw) {
  // own keys only: '__proto__' or 'constructor' must not resolve to something inherited
  const sc = Object.prototype.hasOwnProperty.call(SCENARIOS, key) ? SCENARIOS[key] : null;
  if (!sc) return { ok: false, errors: ['scenario'] };
  const values = {}, errors = [];
  for (const [name, label] of sc.fields) {
    const v = num(raw?.[name]);
    const zeroOk = name === 'runB';
    if (!Number.isFinite(v) || v > QUICK_MAX || (zeroOk ? v < 0 : v <= 0)) errors.push(label); else values[name] = v;
  }
  for (const [name, label, choices] of sc.options) {
    const v = String(raw?.[name] ?? choices[0][0]);
    if (!choices.some(c => c[0] === v)) errors.push(label); else values[name] = v;
  }
  return errors.length ? { ok: false, errors } : { ok: true, values };
}

/* ---------- the checks ---------- */
// A measure is one clear width that results from the inputs; steps is the working, in inches.
function measuresOf(key, v) {
  if (key === 'bed') {
    const two = v.sides === '2', rest = v.wall - v.bedW, side = two ? rest / 2 : rest, foot = v.depth - v.bedL;
    return {
      steps: [
        { text: 'Wall − bed width', a: v.wall, op: '−', b: v.bedW, r: rest },
        ...(two ? [{ text: 'Shared between two sides', a: rest, op: '÷', b: 2, r: side, plain: true }] : []),
        { text: 'Room depth − bed length', a: v.depth, op: '−', b: v.bedL, r: foot }
      ],
      measures: [{ id: 'side', label: two ? 'Beside the bed, each side' : 'Beside the bed, open side', value: side }, { id: 'foot', label: 'At the foot of the bed', value: foot }],
      // the widest piece that still leaves `need` on every side that is used
      limit: (need, tight) => (tight === 'foot' ? { label: 'Longest bed for this room depth', value: v.depth - need } : { label: 'Widest bed for this wall', value: v.wall - (two ? 2 : 1) * need }),
      bar: { total: v.wall, parts: two ? [['clear', side], ['piece', v.bedW, 'bed'], ['clear', side]] : [['piece', v.bedW, 'bed'], ['clear', side]] }
    };
  }
  if (key === 'walkway') {
    const a = Number(v.zoneA), b = Number(v.zoneB), clear = v.gap - a - b;
    return {
      steps: [{ text: 'Gap − use zone A − use zone B', a: v.gap, op: '−', b: a, c: b, r: clear }],
      measures: [{ id: 'clear', label: 'Walkway that is left', value: clear }],
      limit: (need) => ({ label: 'Gap needed', value: need + a + b }),
      bar: { total: v.gap, parts: [...(a ? [['zone', a, 'zone A']] : []), ['clear', clear], ...(b ? [['zone', b, 'zone B']] : [])] }
    };
  }
  if (key === 'table') {
    const two = v.sides === '2', rest = v.room - v.tableW, behind = two ? rest / 2 : rest;
    return {
      steps: [
        { text: 'Room width − table width', a: v.room, op: '−', b: v.tableW, r: rest },
        ...(two ? [{ text: 'Shared between two sides', a: rest, op: '÷', b: 2, r: behind, plain: true }] : [])
      ],
      measures: [{ id: 'behind', label: two ? 'Table edge to wall, each side' : 'Table edge to the far wall', value: behind }],
      limit: (need) => ({ label: 'Widest table', value: v.room - (two ? 2 : 1) * need }),
      bar: { total: v.room, parts: two ? [['clear', behind], ['piece', v.tableW, 'table'], ['clear', behind]] : [['piece', v.tableW, 'table'], ['clear', behind]] }
    };
  }
  if (key === 'aisle') {
    const aisle = v.room - v.runA - v.runB;
    return {
      steps: [{ text: 'Wall to wall − counter A − counter B', a: v.room, op: '−', b: v.runA, c: v.runB, r: aisle }],
      measures: [{ id: 'aisle', label: 'Aisle between the counter fronts', value: aisle }],
      limit: (need) => ({ label: 'Room width needed', value: need + v.runA + v.runB }),
      bar: { total: v.room, parts: [['piece', v.runA, 'counter'], ['clear', aisle], ...(v.runB ? [['piece', v.runB, 'counter']] : [])] }
    };
  }
  return null;
}

const EPS = 1e-9;
/* Runs one scenario. Returns { ok:false, errors } or
   { ok:true, key, values, steps, measures, checks, tightest, level, summary, next, bar }.
   level: 'bad' = the pieces do not fit at all or the tightest width is below every reference;
          'tight' = some references met; 'good' = all met. */
export function quickCheck(key, raw) {
  const c = cleanInput(key, raw);
  if (!c.ok) return c;
  const v = c.values, m = measuresOf(key, v), th = THRESHOLDS[key];
  const tightest = m.measures.reduce((a, b) => (b.value < a.value ? b : a));
  const checks = th.map(t => {
    const margin = tightest.value - t.need;
    return { ...t, measure: tightest.id, margin, pass: margin >= -EPS, limit: m.limit(t.need, tightest.id) };
  });
  const met = checks.filter(x => x.pass).length;
  const level = tightest.value <= EPS ? 'bad' : met === 0 ? 'bad' : met === checks.length ? 'good' : 'tight';
  const next = checks.find(x => !x.pass) || null;
  const best = [...checks].reverse().find(x => x.pass) || null;
  const res = { ok: true, key, values: v, steps: m.steps, measures: m.measures, checks, tightest, level, best, next, bar: m.bar };
  res.summary = summaryOf(res);
  return res;
}

/* One-line verdict in the chosen unit. */
export function summaryOf(res, unit = 'in') {
  const f = (x) => fmt(x, unit), t = res.tightest, n = res.checks.length, met = res.checks.filter(x => x.pass).length;
  if (t.value < -EPS) return `Does not fit: the pieces are ${f(-t.value)} wider than the space.`;
  if (t.value <= EPS) return 'Fits with nothing to spare – no clear width is left.';
  if (!res.best) return `${f(t.value)} clear – below every reference width in the list.`;
  if (!res.next) return `${f(t.value)} clear – meets all ${n} reference widths.`;
  return `${f(t.value)} clear – meets ${met} of ${n} reference widths; ${f(-res.next.margin)} short of the next.`;
}

/* ---------- plain-text result (copy button) ---------- */
export function resultText(res, unit = 'in') {
  if (!res.ok) return '';
  const f = (x) => fmt(x, unit), sc = SCENARIOS[res.key];
  const lines = [`Clearance Check – ${sc.title}`, summaryOf(res, unit), ''];
  for (const s of res.steps) lines.push(`${s.text}: ${f(s.a)} ${s.op} ${s.plain ? s.b : f(s.b)}${s.c != null ? ` ${s.op} ${f(s.c)}` : ''} = ${f(s.r)}`);
  lines.push('');
  for (const m of res.measures) lines.push(`${m.label}: ${f(m.value)}`);
  lines.push('');
  for (const c of res.checks) {
    const src = c.ref ? (() => { const r = REFERENCE.find(x => x.id === c.ref); return `${SOURCES[r.src].short} ${r.sec}`; })() : 'site assumption';
    lines.push(`${c.pass ? 'meets ' : 'below '} ${f(c.need)} – ${c.label} (${src})${c.pass ? '' : `, short by ${f(-c.margin)}`}`);
  }
  lines.push('', 'Arithmetic only: rectangles on a flat floor, no building-code or accessibility review. smallspacecompass.com/tools/clearance-check/');
  return lines.join('\n');
}

/* ---------- share link: values travel in the fragment (#…), which browsers do not send to the web server ---------- */
export function encodeQuick(key, values, unit = 'in') {
  const sc = Object.prototype.hasOwnProperty.call(SCENARIOS, key) ? SCENARIOS[key] : null; if (!sc) return '';
  const p = new URLSearchParams();
  p.set('c', key); p.set('u', unit === 'cm' ? 'cm' : 'in');
  for (const [name] of sc.fields) if (Number.isFinite(values[name])) p.set(name, String(+values[name].toFixed(3)));
  for (const [name] of sc.options) if (values[name] != null) p.set(name, String(values[name]));
  return p.toString();
}
// Accepts only known scenarios, known field names, finite numbers in range and listed option values.
export function decodeQuick(fragment) {
  const s = String(fragment ?? '').replace(/^#/, '');
  if (!s || s.length > 400) return null;
  let p; try { p = new URLSearchParams(s); } catch (e) { return null; }
  const key = p.get('c');
  if (!Object.prototype.hasOwnProperty.call(SCENARIOS, key)) return null;
  const sc = SCENARIOS[key], raw = {};
  for (const [name] of sc.fields) { const t = p.get(name); if (t !== null && /^-?\d{1,5}(\.\d{1,4})?$/.test(t)) raw[name] = Number(t); }
  for (const [name, , choices] of sc.options) { const t = p.get(name); if (choices.some(c => c[0] === t)) raw[name] = t; }
  const c = cleanInput(key, raw);
  if (!c.ok) return null;
  return { key, unit: p.get('u') === 'cm' ? 'cm' : 'in', values: c.values };
}
