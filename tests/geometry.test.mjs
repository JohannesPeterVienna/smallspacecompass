import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../docs/assets/js/geometry.js';

test('rectangle overlap and touching edges', () => {
  assert.ok(G.rectsOverlap(G.rect(0, 0, 10, 10), G.rect(5, 5, 10, 10)));
  assert.ok(!G.rectsOverlap(G.rect(0, 0, 10, 10), G.rect(10, 0, 10, 10)), 'shared edge is not a collision');
  assert.equal(G.overlapArea(G.rect(0, 0, 10, 10), G.rect(5, 5, 10, 10)), 25);
});

test('door swing sector: inside, outside and corner cases', () => {
  const door = { id: 'd', wall: 'S', offset: 10, width: 32, hinge: 'start', swing: 'in' };
  const s = G.swingSector(door, 120, 144);
  assert.deepEqual([s.cx, s.cy], [10, 144]);
  assert.ok(G.pointInSector(20, 130, s));
  assert.ok(!G.pointInSector(40, 110, s), 'outside radius');
  assert.ok(!G.pointInSector(5, 130, s), 'behind hinge');
  assert.ok(G.sectorIntersectsRect(s, G.rect(30, 120, 20, 10)), 'rect clipping the arc');
  assert.ok(!G.sectorIntersectsRect(s, G.rect(33, 100, 20, 10)), 'rect beyond the corner of the bounding square, outside the arc');
  assert.ok(!G.sectorIntersectsRect(s, G.rect(0, 100, 9, 44)), 'rect on hinge side');
  assert.equal(G.swingSector({ ...door, swing: 'out' }, 120, 144), null);
});

test('conflicts: overlap, door swing, chair pull-out zone', () => {
  const plan = { room: { W: 120, D: 120 }, doors: [{ id: 'd', label: 'door', wall: 'S', offset: 4, width: 32, hinge: 'start', swing: 'in' }],
    items: [
      { id: 'desk', label: 'Desk', x: 0, y: 0, w: 48, d: 24, zones: [{ side: 'S', depth: 36, kind: 'chair' }] },
      { id: 'box', label: 'Box', x: 10, y: 40, w: 10, d: 10 },
      { id: 'shelf', label: 'Shelf', x: 6, y: 100, w: 12, d: 12 },
      { id: 'a', label: 'A', x: 80, y: 0, w: 30, d: 30 }, { id: 'b', label: 'B', x: 100, y: 20, w: 20, d: 20 }] };
  const c = G.findConflicts(plan);
  assert.ok(c.some(x => x.type === 'zone' && x.a === 'desk' && x.b === 'box'));
  assert.ok(c.some(x => x.type === 'door' && x.a === 'shelf'));
  assert.ok(c.some(x => x.type === 'overlap'));
});

test('walkway: corridor between two blocks is measured as the narrowest point', () => {
  // 120 x 120 room, door centred on south wall, two blocks leave a 30 in gap; target bed at north
  const mk = (gap) => ({ room: { W: 120, D: 120 }, doors: [{ id: 'd', wall: 'S', offset: 44, width: 32, hinge: 'start', swing: 'none', entry: true }],
    items: [
      { id: 'L', label: 'L', x: 0, y: 50, w: 60 - gap / 2, d: 20 },
      { id: 'R', label: 'R', x: 60 + gap / 2, y: 50, w: 60 - gap / 2, d: 20 },
      { id: 'bed', label: 'Bed', x: 30, y: 0, w: 60, d: 30, target: true }] });
  for (const gap of [30, 36, 40]) {
    const a = G.analyzePlan(mk(gap));
    const r = a.routes.find(r => r.target === 'bed');
    assert.ok(r.found, 'route found');
    assert.ok(Math.abs(r.width - gap) < 0.6, `gap ${gap} measured ${r.width}`);
    assert.equal(r.ok, gap >= 36);
    assert.ok(r.pinch.y > 48 && r.pinch.y < 72, 'pinch located in the gap');
  }
});

test('walkway: blocked route is reported as not found', () => {
  const plan = { room: { W: 100, D: 100 }, doors: [{ id: 'd', wall: 'S', offset: 34, width: 32, swing: 'none' }],
    items: [{ id: 'wall', label: 'Wardrobe', x: 0, y: 50, w: 100, d: 24 }, { id: 'bed', label: 'Bed', x: 20, y: 0, w: 60, d: 30, target: true }] };
  const r = G.analyzePlan(plan).routes[0];
  assert.equal(r.found, false);
});

test('area balance adds up to room area', () => {
  const plan = { room: { W: 120, D: 144 }, doors: [], items: [{ id: 'bed', label: 'Bed', x: 0, y: 0, w: 60, d: 80, zones: [{ side: 'E', depth: 24, kind: 'access' }] }] };
  const a = G.analyzePlan(plan, { cell: 1 });
  assert.ok(Math.abs(a.footprint - 4800) < 1);
  assert.ok(Math.abs(a.zones - 1920) < 1);
  assert.ok(Math.abs(a.footprint + a.zones + a.free - a.area) < 1);
});

test('day/night states: extension only in its state', () => {
  const plan = { room: { W: 100, D: 120 }, doors: [], items: [
    { id: 'wb', label: 'Wall bed', x: 0, y: 0, w: 64, d: 18, ext: { state: 'night', side: 'S', depth: 70 } },
    { id: 'tbl', label: 'Table', x: 10, y: 60, w: 30, d: 30, only: 'day' }] };
  assert.equal(G.findConflicts(plan, 'day').length, 0);
  assert.equal(G.findConflicts(plan, 'night').length, 0, 'table is folded away at night');
  plan.items[1].only = undefined;
  assert.ok(G.findConflicts(plan, 'night').some(c => c.type === 'overlap'));
});

test('Carver rectangle-in-rectangle with rotation', () => {
  assert.ok(G.rectFitsRect(30, 80, 32, 80));
  assert.ok(!G.rectFitsRect(40, 40, 32, 80));
  assert.ok(G.rectFitsRect(84, 2, 32, 80), 'thin panel fits diagonally');
  assert.ok(!G.rectFitsRect(84, 4, 32, 80), '4 in thick panel does not (hand check: needs 33.8 in)');
  assert.ok(!G.rectFitsRect(90, 10, 32, 80));
  assert.ok(!G.rectFitsRect(36, 36, 35, 35), 'square cannot shrink by rotation');
});

test('corner: thin stick matches the closed-form (a^2/3+b^2/3)^3/2', () => {
  const a = 36, b = 36, exact = (a ** (2 / 3) + b ** (2 / 3)) ** 1.5;
  const { L } = G.cornerMaxLength(a, b, 0);
  assert.ok(Math.abs(L - exact) < 0.05, `${L} vs ${exact}`);
  assert.equal(G.cornerMaxLength(30, 30, 31).L, 0);
  assert.equal(G.cornerMaxLength(36, 36, 34).L, 36, 'a 34 x 36 footprint slides through the corner square without turning');
});

test('delivery: tilting helps around a corner, door profile rule', () => {
  const sofa = { W: 84, D: 36, H: 34, diag: 30 };
  const flat = G.cornerPass(84, 34, 36, 36, 36, 1); // no headroom to tilt
  const tilt = G.cornerPass(84, 34, 36, 36, 36, 96);
  assert.ok(tilt.margin > flat.margin || !flat.pass);
  const r = G.deliveryCheck(sofa, [{ kind: 'door', width: 32, height: 80 }]);
  assert.ok(r.ok, 'sofa with 30 in diagonal depth fits a 32 in door');
  const r2 = G.deliveryCheck({ W: 84, D: 40, H: 38, diag: 36 }, [{ kind: 'door', width: 30, height: 80 }]);
  assert.ok(!r2.ok);
  const box = G.deliveryCheck({ W: 80, D: 60, H: 10 }, [{ kind: 'corner', a: 36, b: 36, height: 96 }]);
  assert.ok(box.results[0].best.label.includes('vertical'));
});

test('storage bands split by ADA reach range 15–48 in', () => {
  const b = G.storageBands([{ x: 0, w: 12, bottom: 0, top: 60, depth: 12 }]);
  assert.equal(b.low, 15 * 144); assert.equal(b.reach, 33 * 144); assert.equal(b.high, 12 * 144);
  assert.ok(Math.abs(G.cuIn2cuFt(1728) - 1) < 1e-9);
  const d = G.divideOpening(30, 3, 0.75); assert.ok(Math.abs(d.each - 9.5) < 1e-9);
});
