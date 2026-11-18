// Clearance Check: arithmetic, comparison with the reference rows, share-link round trip, hostile input.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, SCENARIO_KEYS, quickCheck, summaryOf, resultText, encodeQuick, decodeQuick, thresholdsOf, cleanInput, fmt } from '../docs/assets/js/quickfit.js';
import { refById } from '../docs/assets/js/refdata.js';
import { deliveryToFragment, deliveryFromFragment, DELIVERY_LENGTHS } from '../docs/assets/js/validate.js';

const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, `${m || ''}: ${a} vs ${b}`);

test('thresholds are ascending and each one cites an existing reference row with the same width', () => {
  for (const k of SCENARIO_KEYS) {
    const th = thresholdsOf(k);
    assert.ok(th.length >= 3, k);
    for (let i = 1; i < th.length; i++) assert.ok(th[i].need >= th[i - 1].need, `${k}: not ascending`);
    for (const t of th) {
      if (!t.ref) { assert.ok(t.own, `${k}: threshold without source must be marked as the site's own`); continue; }
      const r = refById[t.ref]; assert.ok(r, t.ref);
      // the needed width must literally appear in that row (in inches or millimetres)
      const inText = `${r.imp} ${r.met} ${r.note}`;
      const asIn = String(+t.need.toFixed(1)), asMm = String(Math.round(t.need * 25.4));
      assert.ok(inText.includes(`${asIn} in`) || inText.includes(`${asMm} mm`), `${k}: ${t.need} not in row ${t.ref} (${inText})`);
    }
  }
});

test('bed: both sides share the remainder; the tighter of side and foot is compared', () => {
  const r = quickCheck('bed', { wall: 120, bedW: 60, depth: 144, bedL: 80, sides: '2' });
  assert.ok(r.ok);
  near(r.measures[0].value, 30); near(r.measures[1].value, 64);
  assert.equal(r.tightest.id, 'side');
  assert.deepEqual(r.checks.map(c => c.pass), [true, true, false, false]);
  near(r.next.margin, -6);
  assert.equal(r.level, 'tight');
  near(r.checks[2].limit.value, 48, 'widest bed that keeps 36 in on both sides');
  const one = quickCheck('bed', { wall: 108, bedW: 53, depth: 120, bedL: 75, sides: '1' });
  near(one.measures[0].value, 55); near(one.measures[1].value, 45); assert.equal(one.tightest.id, 'foot');
  assert.equal(one.checks[0].limit.label, 'Longest bed for this room depth');
  near(one.checks[2].limit.value, 84);
});

test('bed: 750 mm is compared exactly, not as 29.5 in', () => {
  const just = quickCheck('bed', { wall: (1500 + 1350) / 25.4, bedW: 1350 / 25.4, depth: 200, bedL: 75, sides: '2' });
  near(just.measures[0].value, 750 / 25.4);
  assert.equal(just.checks[1].pass, true, 'exactly 750 mm meets 750 mm');
  const under = quickCheck('bed', { wall: (1499 + 1350) / 25.4, bedW: 1350 / 25.4, depth: 200, bedL: 75, sides: '2' });
  assert.equal(under.checks[1].pass, false);
});

test('walkway, table and aisle sums', () => {
  const w = quickCheck('walkway', { gap: 60, zoneA: '32', zoneB: '0' });
  near(w.tightest.value, 28); assert.deepEqual(w.checks.map(c => c.pass), [true, false, false, false, false]);
  near(w.checks[4].limit.value, 68, 'gap needed for 36 in next to a chair zone');
  const t = quickCheck('table', { room: 120, tableW: 36, sides: '2' });
  near(t.tightest.value, 42); assert.deepEqual(t.checks.map(c => c.pass), [true, true, false]);
  near(t.checks[2].limit.value, 32);
  const t1 = quickCheck('table', { room: 84, tableW: 30, sides: '1' });
  near(t1.tightest.value, 54); assert.equal(t1.level, 'good');
  const a = quickCheck('aisle', { room: 96, runA: 25, runB: 25 });
  near(a.tightest.value, 46); assert.deepEqual(a.checks.map(c => c.pass), [true, true, true, false, false]);
  const single = quickCheck('aisle', { room: 72, runA: 25, runB: 0 });
  near(single.tightest.value, 47);
});

test('pieces wider than the space: level bad, clear message, no NaN', () => {
  const r = quickCheck('table', { room: 60, tableW: 70, sides: '2' });
  assert.equal(r.level, 'bad'); assert.match(r.summary, /Does not fit/);
  const z = quickCheck('walkway', { gap: 32, zoneA: '32', zoneB: '0' });
  assert.equal(z.level, 'bad'); assert.match(z.summary, /nothing to spare/);
  assert.doesNotMatch(resultText(r) + resultText(z), /NaN|undefined|Infinity/);
});

test('nonsense input is refused field by field', () => {
  for (const bad of ['', 'abc', '-5', '0', '1e999', '99999', null, undefined, {}, '<img src=x>']) {
    const r = quickCheck('bed', { wall: bad, bedW: 60, depth: 144, bedL: 80, sides: '2' });
    assert.equal(r.ok, false, String(bad)); assert.deepEqual(r.errors, ['Wall behind the headboard']);
  }
  assert.equal(quickCheck('bed', { wall: 120, bedW: 60, depth: 144, bedL: 80, sides: '3' }).ok, false);
  assert.equal(quickCheck('nope', {}).ok, false);
  assert.equal(quickCheck('__proto__', {}).ok, false);
  assert.equal(cleanInput('aisle', { room: 96, runA: 25, runB: 0 }).ok, true, 'second counter may be 0');
  assert.equal(cleanInput('aisle', { room: 96, runA: 0, runB: 0 }).ok, false);
});

test('every example of every scenario runs and its numbers are finite', () => {
  for (const k of SCENARIO_KEYS) for (const [name, v] of SCENARIOS[k].examples) {
    const r = quickCheck(k, v); assert.ok(r.ok, `${k}: ${name}`);
    for (const m of r.measures) assert.ok(Number.isFinite(m.value));
    assert.doesNotMatch(resultText(r, 'cm'), /NaN|undefined/);
  }
});

test('units: summary and text switch to centimetres', () => {
  const r = quickCheck('aisle', { room: 96, runA: 25, runB: 25 });
  assert.match(summaryOf(r, 'in'), /^46 in clear/); assert.match(summaryOf(r, 'cm'), /^116\.8 cm clear/);
  assert.equal(fmt(29.527559, 'cm'), '75 cm'); assert.equal(fmt(NaN), '–');
  assert.match(resultText(r, 'cm'), /243\.8 cm − 63\.5 cm − 63\.5 cm = 116\.8 cm/);
});

test('share link round trip', () => {
  for (const k of SCENARIO_KEYS) for (const [, v] of SCENARIOS[k].examples) {
    const c = cleanInput(k, v), back = decodeQuick('#' + encodeQuick(k, c.values, 'cm'));
    assert.equal(back.key, k); assert.equal(back.unit, 'cm');
    for (const [n, val] of Object.entries(c.values)) typeof val === 'number' ? assert.ok(Math.abs(back.values[n] - val) < 0.001) : assert.equal(back.values[n], val);
  }
});

test('share link: hostile or foreign fragments are ignored', () => {
  for (const f of ['', '#', '#faq', '#c=bed', '#c=bed&wall=<script>alert(1)</script>&bedW=60&depth=1&bedL=1', '#c=bed&wall=1e9&bedW=60&depth=144&bedL=80',
    '#c=constructor&wall=1', '#c=__proto__', '#' + 'a'.repeat(5000), '#c=bed&wall=%00&bedW=60']) {
    assert.equal(decodeQuick(f), null, f.slice(0, 60));
  }
  // an option value that is not on the list falls back to the first listed choice – never passed through
  assert.equal(decodeQuick('#c=bed&wall=120&bedW=60&depth=144&bedL=80&sides=javascript:alert(1)').values.sides, '2');
  assert.equal(decodeQuick('#c=walkway&gap=60&zoneA=999&zoneB=<i>').values.zoneA, '0');
  const ok = decodeQuick('#c=bed&u=xx&wall=120&bedW=60&depth=144&bedL=80&evil=<b>');
  assert.equal(ok.unit, 'in'); assert.deepEqual(Object.keys(ok.values).sort(), ['bedL', 'bedW', 'depth', 'sides', 'wall']);
});

test('delivery share link: round trip, optional diagonal, hostile input', () => {
  const lengths = Object.fromEntries(DELIVERY_LENGTHS.map((k, i) => [k, 30 + i * 1.25])); lengths.diag = null;
  const checks = { upright: true, useDoor: true, useCorner: false, useLanding: true, useDoor2: false };
  const back = deliveryFromFragment('#' + deliveryToFragment({ unit: 'cm', lengths, checks }));
  assert.equal(back.unit, 'cm'); assert.deepEqual(back.checks, checks); assert.equal(back.lengths.diag, null);
  for (const k of DELIVERY_LENGTHS) if (k !== 'diag') assert.equal(back.lengths[k], lengths[k]);
  for (const f of ['', '#faq', '#method', '#W=84', '#W=84&D=35&H=<svg onload=alert(1)>', '#W=84&D=35&H=-3', '#W=1e5&D=35&H=34', '#' + 'W=1&'.repeat(400)]) assert.equal(deliveryFromFragment(f), null, f.slice(0, 50));
  const partial = deliveryFromFragment('#W=84&D=35&H=34&doorW=abc&useDoor=yes&hallA=999999');
  assert.deepEqual(Object.keys(partial.lengths).sort(), ['D', 'H', 'W', 'diag']); assert.deepEqual(partial.checks, {});
});
