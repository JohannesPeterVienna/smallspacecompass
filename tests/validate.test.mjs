// Counterexamples from the independent Codex review (Nov 2026) – each one failed before the fix.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../docs/assets/js/geometry.js';
import * as V from '../docs/assets/js/validate.js';
import { LAYOUTS } from '../docs/assets/js/layouts.js';

test('SSC01: an upright 30×31×68 in item does not pass a 36×60 in door (height may not lie horizontal)', () => {
  const r = G.deliveryCheck({ W: 30, D: 31, H: 68, upright: true }, [{ kind: 'door', width: 36, height: 60 }]);
  assert.equal(r.ok, false, `got ok with "${r.results[0].best.label}"`);
  assert.ok(r.results[0].options.every(o => o.label.endsWith('height vertical')), 'only orientations with the height vertical are tried');
  // the same item without the upright rule may be tipped through
  assert.equal(G.deliveryCheck({ W: 30, D: 31, H: 68 }, [{ kind: 'door', width: 36, height: 60 }]).ok, true);
  // and kept upright it passes a normal 36×80 in door
  const ok = G.deliveryCheck({ W: 30, D: 31, H: 68, upright: true }, [{ kind: 'door', width: 36, height: 80 }]);
  assert.equal(ok.ok, true); assert.ok(ok.results[0].best.label.endsWith('height vertical'));
});

test('SSC01: upright items are not tilted in the door plane or around a corner', () => {
  // a thin 81 in high panel fits a 36×80 door only when tilted in the door plane – not allowed while upright
  assert.equal(G.rectFitsRect(4, 81, 36, 80), true, 'tilted in the door plane it would fit');
  const panel = G.deliveryCheck({ W: 30, D: 4, H: 81, upright: true }, [{ kind: 'door', width: 36, height: 80 }]);
  assert.equal(panel.ok, false, `got ok with "${panel.results[0].best.label}"`);
  // a tall wardrobe in a hall with 60 in headroom cannot pass upright
  const c = G.deliveryCheck({ W: 40, D: 24, H: 78, upright: true }, [{ kind: 'corner', a: 36, b: 36, height: 60 }]);
  assert.equal(c.ok, false);
  assert.ok(c.results[0].options.every(o => o.phi === 0 || o.phi === undefined));
});

test('SSC02: the counterexample with doors:"not-an-array" is rejected before it can replace the plan', () => {
  const bad = { room: { W: 120, D: 120 }, items: [], doors: 'not-an-array', windows: [] };
  const v = V.validatePlan(bad);
  assert.equal(v.ok, false); assert.match(v.error, /doors/);
  const p = V.preparePlan(bad);
  assert.equal(p.ok, false);
  // before the fix this plan passed validation and analyzePlan threw
  assert.throws(() => G.analyzePlan(bad));
});

test('SSC02: schema with bounds, numeric ranges and enums', () => {
  const ok = { room: { W: 120, D: 120 }, items: [{ id: 'a', label: 'A', x: 0, y: 0, w: 30, d: 30 }], doors: [{ id: 'd', wall: 'S', offset: 10, width: 32, hinge: 'start', swing: 'in', entry: true }], windows: [] };
  assert.equal(V.validatePlan(ok).ok, true);
  const mut = (f) => { const p = JSON.parse(JSON.stringify(ok)); f(p); return V.validatePlan(p); };
  const cases = [
    [p => { p.room.W = -5; }, /room\.W/], [p => { p.room.D = 99999; }, /room\.D/], [p => { p.room = null; }, /room/],
    [p => { p.items = {}; }, /items/], [p => { p.items[0].w = 0; }, /items\[0\]\.w/], [p => { p.items[0].x = 'left'; }, /items\[0\]\.x/],
    [p => { p.items[0].d = Infinity; }, /items\[0\]\.d/], [p => { p.items.push({ ...p.items[0] }); }, /used twice/],
    [p => { p.items[0].zones = [{ side: 'Q', depth: 10, kind: 'chair' }]; }, /zones\[0\]\.side/],
    [p => { p.items[0].zones = 'chair'; }, /zones/], [p => { p.items[0].only = 'noon'; }, /only/],
    [p => { p.items[0].ext = { state: 'night', side: 'S', depth: -1 }; }, /ext\.depth/],
    [p => { p.doors[0].wall = 'X'; }, /doors\[0\]\.wall/], [p => { p.doors[0].swing = 'sideways'; }, /swing/],
    [p => { p.doors[0].offset = 100; }, /doors\[0\]\.offset/], [p => { p.doors[0].width = 'wide'; }, /doors\[0\]\.width/],
    [p => { p.doors = [null]; }, /doors\[0\]/], [p => { p.windows = 'none'; }, /windows/],
  ];
  for (const [f, re] of cases) { const r = mut(f); assert.equal(r.ok, false, String(f)); assert.match(r.error, re, String(f)); }
  assert.equal(V.validatePlan(null).ok, false); assert.equal(V.validatePlan('x').ok, false);
});

test('SSC02: every measured layout passes the schema and analyses identically after cleaning', () => {
  for (const L of LAYOUTS) {
    const r = V.preparePlan(JSON.parse(JSON.stringify(L)), L.states || [undefined], 2);
    assert.equal(r.ok, true, `${L.slug}: ${r.error}`);
  }
});

test('SSC03: 84 in shown in cm and saved is read back as 84 in, not 213.4 in', () => {
  // the tool keeps 84 in canonically; switching to cm only changes the display
  assert.equal(V.toDisplay(84, 'cm'), '213.4');
  const saved = V.encodeDelivery({ unit: 'cm', lengths: { W: 84, D: 35 }, checks: { useDoor: true } });
  const back = V.decodeDelivery(saved, null);
  assert.equal(back.unit, 'cm'); assert.equal(back.lengths.W, 84); assert.equal(back.checks.useDoor, true);
  // a value typed in cm is converted once, at full precision
  const typed = V.fromDisplay('213.4', 'cm');
  assert.ok(Math.abs(typed - 84.0157) < 1e-3);
  assert.equal(V.toDisplay(typed, 'cm'), '213.4');
  assert.equal(V.fromDisplay('', 'cm'), null); assert.ok(Number.isNaN(V.fromDisplay('abc', 'in')));
});

test('SSC03: old v1 data is migrated safely (as inches, junk dropped)', () => {
  const v1 = JSON.stringify([['W', '84'], ['D', 'oops'], ['H', '-3'], ['diag', ''], ['upright', true], ['useDoor', 'yes'], ['evil', 5]]);
  const r = V.decodeDelivery(null, v1);
  assert.equal(r.unit, 'in'); assert.equal(r.lengths.W, 84); assert.ok(!('D' in r.lengths)); assert.ok(!('H' in r.lengths));
  assert.equal(r.lengths.diag, null); assert.equal(r.checks.upright, true); assert.ok(!('useDoor' in r.checks)); assert.ok(!('evil' in r.lengths));
  assert.equal(V.decodeDelivery('{broken', 'also broken'), null);
});

test('Storage wall: negative or zero physical values are rejected in JS', () => {
  assert.notEqual(V.storageFieldError('w', -24), '');
  assert.notEqual(V.storageFieldError('depth', 0), '');
  assert.notEqual(V.storageFieldError('bottom', -1), '');
  assert.equal(V.storageFieldError('w', 24), '');
  const unit = { id: 'u', label: 'U', x: 0, w: -24, bottom: 0, top: 72, depth: 12, shelves: [] };
  assert.equal(V.validStorage({ wall: { W: 120, H: 96 }, units: [unit] }), false);
  assert.equal(V.validStorage({ wall: { W: 120, H: 96 }, units: [{ ...unit, w: 24 }] }), true);
});
