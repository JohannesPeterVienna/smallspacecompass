// Every published plan example – guide figures and the Layout Library – is recomputed here.
// A plan may only be published if nothing solid stands in any clearance zone it draws (chair, drawer,
// door, code clear floor, centerline clearance, standing space), nothing leaves the room, no door swing
// is blocked, and every route it reports reaches its target at the ADA 36 in reference width.
// Counter-examples must be flagged ({ counter: true }) and must actually contain the conflict they illustrate.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FIGURES } from '../build/figs.mjs';
import { ARTICLES } from '../src/content/index.mjs';
import '../src/content/layout-notes.mjs';
import { BATH_PLANS } from '../src/content/articles-3.mjs';
import { LAYOUTS } from '../docs/assets/js/layouts.js';
import { analyzePlan, findConflicts, sideClearance, ADA_ROUTE } from '../docs/assets/js/geometry.js';

const hard = (c) => c.filter(x => x.severity !== 'warn');
const label = (f) => f.caption.replace(/<[^>]+>/g, '').slice(0, 80);

test('guide figures were registered', () => {
  assert.ok(ARTICLES.length >= 18);
  assert.ok(FIGURES.length >= 30, `only ${FIGURES.length} figures registered`);
});

test('every guide figure: no blocked clearance zone, overlap or door conflict', () => {
  for (const f of FIGURES) {
    const c = hard(findConflicts(f.plan, f.state));
    if (f.counter) assert.ok(c.length > 0, `counter-example shows no conflict: ${label(f)}`);
    else assert.deepEqual(c.map(x => x.msg), [], `figure: ${label(f)}`);
  }
});

test('every guide figure: walking routes to furniture are at least 36 in, or the figure is a counter-example', () => {
  for (const f of FIGURES) {
    if (f.counter) continue;
    const a = analyzePlan(f.plan, { state: f.state });
    for (const r of a.routes.filter(r => !/window/i.test(r.label))) {
      assert.ok(r.found, `no route to ${r.label}: ${label(f)}`);
      assert.ok(r.ok, `route to ${r.label} only ${r.width?.toFixed(1)} in: ${label(f)}`);
    }
  }
});

test('every Layout Library plan, in every state: no conflicts and disclosed pinches only', () => {
  for (const L of LAYOUTS) for (const st of L.states || [undefined]) {
    assert.deepEqual(hard(findConflicts(L, st)).map(x => x.msg), [], `${L.slug} ${st || ''}`);
    for (const r of analyzePlan(L, { state: st }).routes) {
      assert.ok(r.found, `${L.slug}: no route to ${r.label}`);
      if (!(L.acceptPinch || []).includes(r.target)) assert.ok(r.ok, `${L.slug} ${st || ''}: route to ${r.label} only ${r.width?.toFixed(1)} in (< ${ADA_ROUTE})`);
    }
  }
});

test('bathroom plans meet the code minimums they state (NKBA guidelines 4, 5, 20)', () => {
  const { BATH58, BATH55, BATH_CODE: C, BATH_REC: R } = BATH_PLANS;
  const half = (p, id, face) => { const f = p.items.find(i => i.id === id); return (face === 'N' || face === 'S' ? f.w : f.d) / 2; };
  const lat = { N: ['W', 'E'], S: ['W', 'E'], E: ['N', 'S'], W: ['N', 'S'] };
  for (const [p, id, face, cl] of [[BATH58, 'wc', 'E', C.wcCL], [BATH58, 'vn', 'S', C.lavCL], [BATH55, 'wc', 'N', C.wcCL], [BATH55, 'bs', 'W', C.lavCL]]) {
    assert.ok(sideClearance(p, id, face) >= C.front, `${id}: front ${sideClearance(p, id, face)} < ${C.front}`);
    for (const s of lat[face]) assert.ok(sideClearance(p, id, s) + half(p, id, face) >= cl - 1e-9, `${id}: centerline to ${s} below ${cl}`);
  }
  assert.ok(sideClearance(BATH55, 'sh', 'W') >= C.shower);
  // the 5 × 8 ft plan is described as meeting the recommended values
  assert.ok(Math.min(sideClearance(BATH58, 'wc', 'N'), sideClearance(BATH58, 'wc', 'S')) + 10 >= R.wcCL);
  assert.ok(sideClearance(BATH58, 'wc', 'E') >= R.front && sideClearance(BATH58, 'vn', 'S') >= R.front);
  assert.ok(sideClearance(BATH58, 'vn', 'E') + 12 >= R.lavCL);
});

test('sideClearance measures to walls and to the nearest solid in front', () => {
  const p = { room: { W: 100, D: 100 }, items: [{ id: 'a', x: 10, y: 10, w: 20, d: 20 }, { id: 'b', x: 25, y: 50, w: 10, d: 10 }, { id: 'rug', x: 0, y: 35, w: 100, d: 5, floor: true }] };
  assert.equal(sideClearance(p, 'a', 'S'), 20);
  assert.equal(sideClearance(p, 'a', 'N'), 10);
  assert.equal(sideClearance(p, 'a', 'E'), 70);
});
