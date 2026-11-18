// Reference table: data integrity, conversions, filter and CSV neutralisation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { REFERENCE, SOURCES, TOPICS, RETRIEVED, refById, refUrl, filterRows, referenceCsv } from '../docs/assets/js/refdata.js';
import { csvCell, csvLine } from '../docs/assets/js/csv.js';

test('every row is complete, unique and points to a known source', () => {
  assert.ok(REFERENCE.length >= 80);
  assert.equal(new Set(REFERENCE.map(r => r.id)).size, REFERENCE.length, 'duplicate id');
  for (const r of REFERENCE) {
    assert.match(r.id, /^[a-z0-9-]+$/, r.id);
    for (const k of ['topic', 'what', 'imp', 'met', 'sec']) assert.ok(String(r[k]).trim().length > 1, `${r.id}: ${k} empty`);
    assert.ok(SOURCES[r.src], `${r.id}: unknown source ${r.src}`);
    assert.ok(['', 'imp', 'met'].includes(r.conv), `${r.id}: conv`);
    assert.match(refUrl(r), /^https:\/\//);
    assert.equal(refById[r.id], r);
  }
  assert.ok(TOPICS.length >= 8);
  assert.match(RETRIEVED, /^\d{4}-\d{2}-\d{2}$/);
});

test('sources: https link, publisher, kind and a scope statement', () => {
  for (const [k, s] of Object.entries(SOURCES)) {
    assert.match(s.url, /^https:\/\//, k);
    for (const f of ['short', 'name', 'publisher', 'kind', 'scope']) assert.ok(s[f].length > 3, `${k}: ${f}`);
    assert.ok(['US', 'UK'].includes(s.region), k);
    assert.ok(REFERENCE.some(r => r.src === k), `${k} has no rows`);
  }
});

test('the conversion column is marked exactly where the document gives one unit only', () => {
  // HUD writes inches and feet only, the English documents millimetres and metres only
  for (const r of REFERENCE) {
    if (r.src === 'hud') assert.equal(r.conv, 'met', r.id);
    if (r.src === 'adm' || r.src === 'ndss') assert.equal(r.conv, 'imp', r.id);
    if (r.src === 'ada' || r.src === 'nkbaK' || r.src === 'nkbaB') assert.equal(r.conv, '', r.id);
  }
});

test('single-value rows: inches and millimetres agree (documents round to 5 mm at most)', () => {
  let checked = 0;
  for (const r of REFERENCE) {
    const i = r.imp.match(/^(\d+(?:\.\d+)?) in$/), m = r.met.match(/^(\d+) mm$/);
    if (!i || !m) continue;
    checked++;
    assert.ok(Math.abs(Number(i[1]) * 25.4 - Number(m[1])) <= 3.2, `${r.id}: ${r.imp} vs ${r.met}`);
  }
  assert.ok(checked >= 20, `only ${checked} rows checked`);
});

test('spot values against the documents', () => {
  assert.equal(refById['ada-walk'].imp, '36 in'); assert.equal(refById['ada-walk'].met, '915 mm');
  assert.equal(refById['hud-hall'].imp, '28 in'); assert.equal(refById['hud-hall'].met, '711 mm');
  assert.equal(refById['adm-bed-route'].met, '750 mm'); assert.equal(refById['adm-bed-route'].imp, '29.5 in');
  assert.equal(refById['adm-hall2'].imp, '35.4 in');
  assert.equal(refById['nkba-seat-walk'].imp, '44 in');
  assert.match(refById['ndss-single'].imp, /^80\.7 sq ft, at least 84\.6 in wide$/);
  assert.match(refById['hud-bedroom'].met, /^4\.6 m²; 6\.5 m²$/);
});

test('ADA links carry the section anchor', () => {
  assert.equal(refUrl(refById['ada-walk']), 'https://www.access-board.gov/ada/#ada-403_5_1');
  assert.equal(refUrl(refById['adm-hall2']), SOURCES.adm.url);
});

test('filter: words are ANDed, case-insensitive; topic, source and region narrow', () => {
  assert.equal(filterRows(REFERENCE, {}).length, REFERENCE.length);
  const bed = filterRows(REFERENCE, { q: 'BED 750' });
  assert.ok(bed.length >= 3 && bed.every(r => /750/.test(r.met)));
  assert.ok(filterRows(REFERENCE, { topic: 'Kitchens' }).every(r => r.topic === 'Kitchens'));
  assert.ok(filterRows(REFERENCE, { src: 'hud' }).every(r => r.src === 'hud'));
  assert.ok(filterRows(REFERENCE, { region: 'UK' }).every(r => ['adm', 'ndss'].includes(r.src)));
  assert.equal(filterRows(REFERENCE, { q: 'zzzz-no-such-thing' }).length, 0);
  assert.equal(filterRows(REFERENCE, { q: '<script>alert(1)</script>' }).length, 0);
  assert.equal(filterRows(REFERENCE, { q: '   ' }).length, REFERENCE.length);
});

test('CSV cells: formulas are neutralised, quotes and line breaks quoted', () => {
  assert.equal(csvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvCell('+1'), "'+1"); assert.equal(csvCell('-2'), "'-2"); assert.equal(csvCell('@x'), "'@x");
  assert.equal(csvCell('\tx'), "'\tx");
  assert.equal(csvCell('a,b'), '"a,b"'); assert.equal(csvCell('say "hi"'), '"say ""hi"""'); assert.equal(csvCell('a\nb'), '"a\nb"');
  assert.equal(csvCell('=1,2'), '"\'=1,2"');
  assert.equal(csvCell(null), ''); assert.equal(csvCell(12.5), '12.5');
  assert.equal(csvLine(['a', '=b', 'c,d']), 'a,\'=b,"c,d"');
});

test('reference CSV: header plus one line per row, no cell starts a formula', () => {
  const csv = referenceCsv(REFERENCE), lines = csv.trimEnd().split('\r\n');
  assert.equal(lines.length, REFERENCE.length + 1);
  assert.ok(lines[0].startsWith('Topic,Measurement,Imperial,Metric'));
  for (const l of lines) assert.doesNotMatch(l, /(^|,)"?[=+\-@]/, l.slice(0, 80));
  assert.ok(csv.includes(RETRIEVED));
});
