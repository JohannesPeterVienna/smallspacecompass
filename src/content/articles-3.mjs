import { figPlan, figLayout, figRaw, figElev, room, door, rule, table, a, S, ADA, NKBA_K, NKBA_B, CASPER, SILENT, bs, chair, dimLine, qlink, dlink, tryIt, ref } from './common.mjs';
import { sideClearance, analyzePlan } from '../../docs/assets/js/geometry.js';
import { layoutBySlug } from '../../docs/assets/js/layouts.js';
const it = (id, label, x, y, w, d, extra = {}) => ({ id, label, x, y, w, d, ...extra });

/* ---------- bathroom plans: one geometry source for drawing, clearance zones and stated measurements ----------
   Code values as cited in the NKBA Bathroom Planning Guidelines (IRC 2015): guideline 4 (21 in in front of
   toilet/lavatory/tub, 24 in in front of a shower entry), guideline 5 (lavatory centerline 15 in to a wall),
   guideline 20 (toilet centerline 15 in to any fixture, wall or obstacle). NKBA recommendations: 30 / 20 / 18 in. */
const BATH_CODE = { front: 21, shower: 24, wcCL: 15, lavCL: 15 };
const BATH_REC = { front: 30, wcCL: 18, lavCL: 20 };
const LAT = { N: ['W', 'E'], S: ['W', 'E'], E: ['N', 'S'], W: ['N', 'S'] };
// fixture facing `face`; side zones reach exactly to the code minimum measured from the centerline
function fixture(id, label, x, y, w, d, face, cl) {
  const half = (face === 'N' || face === 'S' ? w : d) / 2;
  return it(id, label, x, y, w, d, { zones: [{ side: face, depth: BATH_CODE.front, kind: 'code clear floor (21 in)' },
    ...LAT[face].map(side => ({ side, depth: cl - half, kind: 'centerline clearance (' + cl + ' in)' }))] });
}
function bathFacts(plan, id, face) {
  const f = plan.items.find(i => i.id === id), half = (face === 'N' || face === 'S' ? f.w : f.d) / 2;
  return { front: sideClearance(plan, id, face), cl: LAT[face].map(s => sideClearance(plan, id, s) + half) };
}
const inch = (v) => `${Math.round(v * 10) / 10} in`;
// 5 × 8 ft: vanity on the short wall, toilet on the long wall, full-width shower at the far end
const BATH58 = room(60, 96, [
  fixture('wc', 'Toilet', 0, 22, 28, 20, 'E', BATH_CODE.wcCL),
  fixture('vn', 'Vanity', 28, 0, 24, 21, 'S', BATH_CODE.lavCL),
  it('sh', 'Shower 60 × 36', 0, 60, 60, 36, { zones: [{ side: 'N', depth: BATH_CODE.shower, at: 28, len: 32, kind: 'shower entry (24 in)' }] })],
  [door('E', 24, 28, 'start', 'out', { entry: true })]);
const B58 = { wc: bathFacts(BATH58, 'wc', 'E'), vn: bathFacts(BATH58, 'vn', 'S') };
// 5 × 5 ft: code-minimum layout – 30 × 30 in shower, toilet at exactly 15 in, small wall-hung basin
const BATH55 = room(60, 60, [
  fixture('wc', 'Toilet', 5, 32, 20, 28, 'N', BATH_CODE.wcCL),
  fixture('bs', 'Basin 18 × 14', 46, 36, 14, 18, 'W', BATH_CODE.lavCL),
  it('sh', 'Shower 30 × 30', 30, 0, 30, 30, { zones: [{ side: 'W', depth: BATH_CODE.shower, kind: 'shower entry (24 in)' }] })],
  [door('W', 2, 26, 'start', 'none', { entry: true })]);
const B55 = { wc: bathFacts(BATH55, 'wc', 'N'), bs: bathFacts(BATH55, 'bs', 'W'), sh: sideClearance(BATH55, 'sh', 'W') };
// dining: the table is placed once; caption figures come from the same plan
const DINE = room(120, 120, [it('t', 'Table for 4', 36, 45, 48, 30, { zones: [{ side: 'N', depth: 32, kind: 'chair' }, { side: 'S', depth: 32, kind: 'chair' }] })], [door('S', 6, 30)], [{ id: 'w', wall: 'E', offset: 30, width: 48 }]);
const DINE_GAP = [sideClearance(DINE, 't', 'N'), sideClearance(DINE, 't', 'S')];
export const BATH_PLANS = { BATH58, BATH55, B58, B55, BATH_CODE, BATH_REC };

const SOFA_BED_PLAN = { room: { W: 180, D: 180 }, doors: [door('S', 140, 32, 'end')], windows: [{ id: 'w', wall: 'E', offset: 40, width: 60 }], items: [it('sb', 'Sofa bed', 0, 0, 78, 36, { target: true, ext: { state: 'night', side: 'S', depth: 54 }, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] }), it('t', 'Table for 2', 112, 0, 30, 30, { target: true, zones: chair('S') }), it('sh', 'Bookshelf', 168, 110, 12, 31)] };
// free floor of the two fold-away plans, computed once and used in the table and the FAQ (never typed in)
const freePct = (plan, state) => Math.round(analyzePlan(plan, { state }).freePct * 100);
export const FOLD_FREE = { wbDay: freePct(layoutBySlug['studio-15x15-wall-bed'], 'day'), wbNight: freePct(layoutBySlug['studio-15x15-wall-bed'], 'night'), sbDay: freePct(SOFA_BED_PLAN, 'day'), sbNight: freePct(SOFA_BED_PLAN, 'night') };

export const A3 = [
  {
    slug: 'dining-table-small-space', updated: true, group: 'Living and dining', kicker: 'Dining', short: 'Dining table for a small space',
    title: 'Dining Table for a Small Space: Size and Chair Clearance (Measured)',
    h1: 'Dining table for a small space: size and chair clearance',
    description: 'How big a dining table fits a small room: 24 in per place setting, 32–44 in behind each chair depending on traffic, and measured plans for round, square and drop-leaf tables.',
    lede: 'The table is the small part. Each chair needs about 32 in from the table edge to sit down, more if people walk behind it. Work out the chair zones first and the table size follows.',
    related: ['small-kitchen-clearances', 'walkway-space-around-furniture', 'murphy-bed-room-size'],
    tool: `the table presets in the ${a('/tools/clearance-planner/', 'Clearance Planner')} carry chair zones on both sides.`,
    body: `<h2 id="numbers">The numbers</h2>
<p>The best published reference for seating clearances in homes is the ${a(NKBA_K, 'NKBA Kitchen Planning Guidelines')}. They are written for kitchen tables and counters, and they apply equally to a dining table in a living room:</p>
${table(['Distance', 'Recommended', 'NKBA guideline'], [
  ['Table edge to wall, nobody passes', '32 in (813 mm)', '8'],
  ['Table edge to wall, people edge past', '36 in (914 mm)', '8a'],
  ['Table edge to wall, people walk past', '44 in (1118 mm)', '8b'],
  ['Width per seated diner', '24 in (610 mm)', '9'],
  ['Knee space depth at a 30 in high table', '18 in (457 mm)', '9a']])}
${rule('32 in', 'Table edge to wall where nobody passes', 'NKBA Kitchen Planning Guideline 8')}
<h2 id="size">From chairs to room size</h2>
<p>Add the chair zones to the table on every side where someone sits. A table against the wall on one side saves a whole zone.</p>
${table(['Table', 'Seats', 'Table size', 'Room needed (32 in zones)'], [
  ['Square for 2, against a wall', '2', '30 × 30 in', '30 × 94 in'],
  ['Square for 4', '4', '36 × 36 in', '100 × 100 in'],
  ['Rectangle for 4, long side to wall', '3–4', '48 × 30 in', '48 × 62 in (+ ends)'],
  ['Rectangle for 4, free-standing', '4', '48 × 30 in', '48 × 94 in'],
  ['Round for 4', '4', '36–42 in diameter', '≈ 100–106 in square'],
  ['Drop-leaf, leaves down', '2', '36 × 10 in', 'against wall, chairs stored']])}
${figPlan(DINE, `Table for four in a 10 × 10 ft space: ${inch(DINE_GAP[0])} and ${inch(DINE_GAP[1])} from the long table edges to the walls – more than the 44 in NKBA guideline 8 gives for walking behind seated diners.`)}
<p>The NKBA figures of 32, 36 and 44 in are <b>total</b> distances from the table edge to the wall or obstacle; the chair is inside them, not added on top. In the plan the hatched strip shows the 32 in where the chair stands; the remaining ${inch(DINE_GAP[0] - 32)} beyond it is what makes the 44 in walk-behind clearance. In a 10 ft room with chairs on both long sides, the table may therefore be at most 120 − 2 × 44 = 32 in wide if people should walk behind the chairs, 120 − 2 × 36 = 48 in if they only need to edge past, and 120 − 2 × 32 = 56 in if nobody passes at all.</p>
<p>The ${a('/tools/clearance-planner/', 'Clearance Planner')} is stricter than the guideline: it draws the 32 in chair zone and then asks for a separate 36 in walkway outside it (68 in from the table edge). That is a comfort assumption of the planner, not an NKBA requirement; if the planner flags a route behind a table, compare the total distance with the 36 and 44 in values above.</p>
<h2 id="round">Round versus rectangular</h2>
<p>A round table has no corners at hip height, so it is easier to edge past. It also seats one more person in a pinch. The cost: a round table cannot go flat against a wall without wasting space, and the same seating needs a slightly larger footprint than a rectangle with one long side against the wall. In a small space, use round tables in the middle of a zone and rectangles along walls.</p>
<h2 id="wall">Against the wall</h2>
${figPlan(room(120, 96, [it('t', 'Table for 2', 0, 30, 30, 30, { zones: [{ side: 'E', depth: 32, kind: 'chair' }] }), it('sofa', 'Loveseat', 60, 62, 60, 34, { zones: [{ side: 'N', depth: 18, kind: 'legroom' }] })], [door('N', 70, 30, 'end')]), 'A table for two against the wall needs one chair zone instead of two – the rest of the floor stays free.')}
<p>Pushing a table against the wall turns a table for four into a table for two or three in daily use and saves one or two chair zones of 32 in. When guests come, pull it out. Benches along a wall save even more: they need no pull-out space at all, because you slide onto them.</p>
<h2 id="dropleaf">Drop-leaf and gateleg tables</h2>
<p>A drop-leaf table folded against the wall is about 10–12 in deep; opened, it projects another 20 in or so and needs chair zones on its open sides. Plan it like ${a('/guides/murphy-bed-room-size/', 'any fold-away furniture')}: check the room in both states. The ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')} has a drop-leaf preset that opens in the day and folds at night.</p>
<h2 id="schedule">Table sizes a regulator draws</h2>
<p>No standard we could read fixes dining-table sizes, with one exception: the furniture schedule in Appendix D of England’s Approved Document M lists the table a layout drawing must show for a given number of bedspaces – always 800 mm deep, with the length growing with the household (${ref('adm-f-dining', 'reference table')}). The last three columns add the NKBA distances on both long sides, i.e. the room width such a table needs:</p>
${table(['Bedspaces', 'Table (mm)', 'Table (in)', 'Room width, nobody passes (2 × 32 in)', 'edge past (2 × 36 in)', 'walk past (2 × 44 in)'],
  [[2, 800], [3, 1000], [4, 1200], [5, 1350], [6, 1500], [7, 1650]].map(([n, len]) => [String(n), `800 × ${len}`, `31.5 × ${(len / 25.4).toFixed(1)} in`, `${(800 / 25.4 + 64).toFixed(1)} in`, `${(800 / 25.4 + 72).toFixed(1)} in`, `${(800 / 25.4 + 88).toFixed(1)} in`]))}
<p>Because the depth is the same for every size, so is the room width: 95.5 in (just under 8 ft) if nobody passes behind the chairs, 103.5 in to edge past, 119.5 in (just under 10 ft) to walk past on both sides. What grows with the household is the length – from 31.5 in for two to 65 in for seven – and with it the wall the table occupies. Per person the NKBA plans 24 in of table edge (guideline 9); by that measure a 1200 mm (47.2 in) long side is 0.8 in short of two places, a 1500 mm (59.1 in) side 12.9 in short of three.</p>
${tryIt(qlink('table', { room: 120, tableW: 800 / 25.4, sides: '2' }), 'Try it: 800 mm table in a 10 ft room', '(120 − 31.5) ÷ 2 = 44.3 in on each side – just past the 44 in walk-behind figure. Enter your room and table.')}
<h2 id="steps">Choosing a table in four steps</h2>
<ol><li>Decide how many people eat at the table daily, not on the busiest day.</li>
<li>Decide which sides have traffic behind the chairs: 32, 36 or 44 in.</li>
<li>Subtract the chair zones from the space to get the maximum table size.</li>
<li>Pick a table that seats the daily number and extends or unfolds for the rest.</li></ol>
<h2 id="rug">A rug under the table: the same arithmetic</h2>
<p>If a rug goes under a dining table, the chairs should still stand on it when pulled out; otherwise the back legs catch on its edge. That makes the rug at least as wide as the table plus the chair zone on each seated side. With the 32 in zone used above – a derivation from the NKBA distance, not a published rug rule:</p>
${table(['Table, chairs on both long sides', 'Rug must be at least', 'Nominal rug sizes that are wide enough'],
  [['30 in deep', 30], ['800 mm (31.5 in) deep', 800 / 25.4], ['36 in square or round', 36], ['42 in round', 42]].map(([name, w]) => { const need = w + 64; return [name, `${need.toFixed(1)} in (${(need * 2.54).toFixed(0)} cm)`, need <= 96 ? '8 × 10 ft (96 in wide) and larger' : need <= 108 ? '9 × 12 ft (108 in wide) and larger' : 'wider than 9 ft']; }))}
<p>A 5 × 8 ft rug is 60 in wide and a 6 × 9 ft rug 72 in – both narrower than any row of the table, so with chairs on both sides they are too small in that direction. Under a table against the wall with chairs on one side only, subtract one zone: a 30 in table then needs 62 in, which a 6 × 9 ft rug covers. Nominal sizes are rounded; measure the rug you are buying.</p>`,
    faq: [
      ['How much space do you need around a dining table?', '32 in from the table edge to a wall where nobody passes, 36 in if people edge past and 44 in if they walk past (NKBA Kitchen Planning Guideline 8).'],
      ['What size table fits a 10x10 room?', 'A 36 in square or round table for four leaves 42 in from each edge to the wall: more than the 36 in NKBA guideline 8 gives for edging past a seated diner, but less than the 44 in for walking past. For a real walkway behind the chairs, push the table against a wall or choose a table no wider than 32 in.'],
      ['Is a round or square table better for a small space?', 'Round tables are easier to edge past and seat an extra person; square and rectangular tables use space better against a wall.'],
      ['How much width does each person need at a table?', '24 in per seated diner according to NKBA guideline 9.']
    ],
    sources: [S.nkbaK, S.adm]
  },
  {
    slug: 'entryway-storage-without-a-closet', updated: true, group: 'Storage', kicker: 'Storage', short: 'Entryway storage without a closet',
    title: 'Entryway Storage for Apartments Without a Closet (Measured Ideas)',
    h1: 'Entryway storage for apartments without a closet',
    description: 'How to store coats, shoes, bags and keys by the door when there is no closet – shelf and hook heights, depths that keep the door swing and walkway clear, and a measured entry plan.',
    lede: 'Many studios open straight into the room. Without a closet, the first few feet inside the door have to hold coats, shoes, bags and keys – without stealing the door swing or the walkway.',
    related: ['vertical-storage-by-reach', 'walkway-space-around-furniture', 'how-to-measure-a-room-for-furniture'],
    tool: `audit your entry wall in the ${a('/tools/storage-wall/', 'Storage Wall Audit')}; the default example is a coat and shoe wall.`,
    body: `<h2 id="door">Start with the door</h2>
<p>The entry door decides where storage can go. A 32 in door swinging into the room claims a quarter circle with a 32 in radius on the hinge side – nothing deeper than the door's own clearance can stand there. On the latch side, the space beside the door frame is where you naturally stand when you come in; that is the best place for hooks and a shoe bench. Measure:</p>
<ul><li>the wall length on the latch side, from the door frame to the next corner or obstacle;</li>
<li>the wall length on the hinge side behind the open door;</li>
<li>the walkway from the door into the room – it should stay at least 36 in wide, the clear width in ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')}.</li></ul>
${figPlan(room(120, 96, [it('bench', 'Shoe bench', 0, 82, 36, 14, { zones: [{ side: 'N', depth: 24, kind: 'sitting', walk: true }] }), it('cab', 'Shoe cabinet', 84, 84, 36, 12), it('sofa', 'Sofa', 0, 0, 78, 36, { target: true })], [door('S', 44, 32, 'end')]), 'Entry wall: shoe bench on the latch side, shallow cabinet behind the door swing; the route into the room stays clear.')}
<h2 id="heights">Heights that work</h2>
${table(['Element', 'Height above the floor', 'Where the figure comes from'], [
  ['Key hooks, mail tray, bag hooks', ref('ada-reach', '15–48 in (380–1220 mm)'), 'unobstructed reach range, ADA Standards §308.2.1'],
  ['Shelf you reach without a stool', ref('ada-shelf', '40–48 in (1015–1220 mm)'), 'shelves in dressing and locker rooms, ADA §803.5'],
  ['Bench seat', ref('ada-bench', '17–19 in (430–485 mm)'), 'benches, ADA §903.5; seat 20–24 in deep (§903.3)'],
  ['Entry door handle and lock', ref('ada-hardware', '34–48 in (865–1220 mm)'), 'door hardware, ADA §404.2.7'],
  ['Hook for a long coat', 'length of your longest coat on its hanger loop + the gap you want above the floor', 'arithmetic – measure the coat']])}
<p>The first four rows are figures from the 2010 ADA Standards, written for public buildings and used here as reference heights. The ADA’s own rule for coat hooks in dressing rooms is simply “within the reach range”, so 48 in at most (§803.5). That is too low for a long coat at home: a coat that measures 46 in from its loop hung on a 48 in hook ends 2 in above the floor, and over a shoe bench it lies on the seat. Hooks for long coats therefore go above the reach band, no higher than the shortest adult in the household can lift a coat; put a second row inside the band for bags, short jackets and children. See ${a('/guides/vertical-storage-by-reach/', 'Vertical storage by reach')} for the reasoning behind the bands.</p>
<h2 id="depth">Depth is the constraint</h2>
<p>Everything at an entry sits next to a walkway, so the depth of each piece comes straight off the route. Measure the piece you are considering – with coats on the hooks, not empty – and subtract. The table shows the deepest storage each entry width can take while 36 in (${ref('ada-walk', 'ADA §403.5.1')}) remain; for the 32 in the same section allows as a pinch over at most 24 in of length, add 4 in to the middle column:</p>
${table(['Entry width', 'Storage depth that keeps 36 in', 'Fits'], [
  ['42 in', '6 in', 'hooks only, slim key rack'],
  ['48 in', '12 in', 'hooks + tilt-out shoe cabinet'],
  ['54 in', '18 in', 'bench + hooks, or a small cabinet'],
  ['60 in +', '24 in', 'wardrobe-depth unit']])}
${tryIt(qlink('walkway', { gap: 48 - 12, zoneA: '0', zoneB: '0' }), 'Try it: 48 in entry, 12 in cabinet', '48 − 12 = 36 in. Enter your entry width minus the depth of the piece and compare it with five published widths.')}
<p>Wall-mounted pieces follow one more published limit: between 27 and 80 in above the floor, the ADA Standards allow an object to protrude at most 4 in into a circulation path (${ref('ada-protrude', '§307.2')}). At home that is a useful test for a shelf or key cabinet beside the door – anything deeper belongs where nobody walks past at shoulder height.</p>
<h2 id="ideas">Seven ideas, from shallow to deep</h2>
<ol><li><b>A rail of hooks</b> along the latch-side wall: no floor at all.</li>
<li><b>A slim shoe cabinet</b> (tilt-out drawers) behind the door's swing arc – only if the door still opens fully past it.</li>
<li><b>A shoe bench</b> with a shelf underneath: somewhere to sit, with the shoes in daily use below.</li>
<li><b>A wall shelf with hooks</b> above the bench: hats, gloves and a key tray at reach height.</li>
<li><b>Over-door hooks</b> on the inside of the entry door: a few bags or scarves, no wall needed.</li>
<li><b>A freestanding coat stand</b> in a corner: easy to move, but its base takes floor that a wall hook does not.</li>
<li><b>A shallow wardrobe</b> (16–18 in) if the entry is wide enough: closed storage for coats and a vacuum.</li></ol>
<h2 id="mistakes">Mistakes to avoid</h2>
<ul><li>Hooks so close to the door frame that coats are hit by the opening door.</li>
<li>A bench or cabinet inside the door swing – the door will stop against it.</li>
<li>A mirror at the only spot where you stand to put on shoes.</li>
<li>Deep storage on both sides of a narrow entry: the walkway becomes a squeeze.</li></ul>
<h2 id="hinge">Using the hinge side</h2>
<p>The wall behind an open door is often wasted. Measure the distance between the face of the fully open door and the wall it opens towards: that gap is the maximum depth of anything you mount there. Shallow hooks, a slim key cabinet or a fold-down shelf can use it. Anything deeper stops the door short of fully open, which reduces the clear width of the entrance – the width that every delivery has to pass, as explained in the ${a('/guides/will-my-sofa-fit-through-the-door/', 'sofa delivery guide')}.</p>
<h2 id="plan">Plan it before you drill</h2>
<p>Draw the entry wall in the ${a('/tools/storage-wall/', 'Storage Wall Audit')}: wall width, bench, cabinet and shelf heights. The tool shows how much of the storage sits within the 15–48 in band. Then draw the floor plan in the ${a('/tools/clearance-planner/', 'Clearance Planner')} with the door swing, and add the bench with a 24 in sitting zone in front – the space you need to sit and put on shoes. If the zone and the door swing overlap, the bench is in the wrong place.</p>`,
    faq: [
      ['How high should coat hooks be?', 'Higher than your longest coat is long, plus the gap you want above the floor or bench – measure the coat. A second row inside the 15–48 in reach range of the ADA Standards (§308) suits bags, short jackets and children.'],
      ['How deep should an entryway bench be?', 'As deep as the walkway allows: entry width minus 36 in. For comparison, the ADA Standards specify bench seats 20–24 in deep and 17–19 in high (§903); a shallower perch is a compromise for narrow entries.'],
      ['Where do I put shoes without a closet?', 'In a slim tilt-out cabinet or under a bench by the door, keeping only the pairs you use daily there.'],
      ['Can storage go behind the entry door?', 'Only if it is shallow enough that the door still opens fully – measure the gap between the open door and the wall.']
    ],
    sources: [S.ada4035, S.ada308, S.ada803, S.ada903]
  },
  {
    slug: 'small-bathroom-layout-dimensions', updated: true, group: 'Kitchens and bathrooms', kicker: 'Bathrooms', short: 'Small bathroom dimensions',
    title: 'Small Bathroom Layout Dimensions: Toilet, Vanity and Shower Clearances',
    h1: 'Small bathroom layout dimensions',
    description: 'Small bathroom clearances with sources: toilet centerline 15/18 in, 21/30 in in front of fixtures, basin spacing and the 30 × 30 in minimum shower (NKBA, IRC), with plans.',
    lede: 'A small bathroom is a puzzle of a few fixed distances: from the toilet centerline to the wall, in front of each fixture, between two basins, and the inside of the shower. Here they are, with their sources and measured plans.',
    related: ['small-kitchen-clearances', 'how-to-measure-a-room-for-furniture', 'walkway-space-around-furniture'],
    body: `<h2 id="source">Sources</h2>
<p>The figures come from the ${a(NKBA_B, 'NKBA Bathroom Planning Guidelines with Access Standards')}. The guidelines give a <b>recommended</b> value for good design and, where one exists, the <b>code requirement</b> that the NKBA cites from the 2015 International Residential Code (IRC) and International Plumbing Code; the access standards refer to ICC A117.1–2009. Your local code may be a later edition or differ – this page is for planning, not for approval.</p>
<h2 id="toilet">Toilet</h2>
${rule('15 in', 'Toilet centerline to wall or fixture, code minimum (381 mm)', 'IRC, cited in NKBA Bathroom Planning Guideline 20 – 18 in (457 mm) recommended')}
<p>Measure from the centerline of the toilet to the nearest wall, fixture or obstacle on either side. The code minimum cited by the NKBA is 15 in; the recommendation is 18 in. A toilet between two walls therefore needs at least 30 in, better 36 in, of wall-to-wall width.</p>
<p>A second, independent document gives the same minimum. The U.S. federal standard for manufactured homes requires every toilet compartment to be at least 30 in wide, with at least 21 in of clear space in front of the toilet (${ref('hud-wc', '24 CFR 3280.111(a)')}); where the toilet stands beside the short end of a tub, its centerline may be as close as 12 in to the tub. We read that regulation directly; the IRC figures on this page are quoted from the NKBA document.</p>
<h2 id="front">In front of fixtures</h2>
${table(['Space in front of', 'Code minimum', 'NKBA recommended'], [
  ['Toilet, lavatory, bidet, tub', '21 in (533 mm)', '30 in (762 mm)'],
  ['Shower entry', '24 in (610 mm)', '30 in (762 mm)']])}
<p>Guideline 4 recommends 30 in of clear floor space from the front edge of every fixture to any opposite fixture, wall or obstacle. The code minimums cited are 21 in in front of a lavatory, toilet, bidet and tub, and 24 in in front of a shower entry.</p>
<h2 id="basin">Basins</h2>
<ul><li><b>Single lavatory:</b> centerline at least 20 in from a side wall or tall obstacle (recommended); 15 in code minimum (guideline 5).</li>
<li><b>Double lavatory:</b> centerlines at least 36 in apart (recommended), 30 in code minimum (guideline 6).</li>
<li>For a 30 × 48 in clear floor space at the basin under the access standard, the centerline must be at least 24 in from the wall.</li></ul>
<h2 id="shower">Shower</h2>
${table(['Shower', 'Interior size', 'Source'], [
  ['Code minimum', '30 × 30 in (900 sq in) – a 30 in disc must fit', 'IRC, cited in NKBA guideline 9'],
  ['NKBA recommended', '36 × 36 in', 'guideline 9'],
  ['Transfer shower (access)', '36 × 36 in', 'access standard'],
  ['Roll-in shower (access)', 'at least 30 × 60 in, entry as wide as the shower', 'ICC A117.1, cited in NKBA guideline 9']])}
<h2 id="plans">Two small layouts, checked against the minimums</h2>
<p>Both plans are drawn from the same coordinates that produce the measurements below. The hatched strips are the code clear floor in front of each fixture and the side clearance to the code minimum from each centerline; nothing solid may stand in them. The site's test suite recalculates these strips for every plan before publishing.</p>
${figPlan(BATH58, `5 × 8 ft bathroom: vanity on the short wall, toilet on the long wall, 60 × 36 in shower across the far end. Toilet centerline ${inch(B58.wc.cl[0])} and ${inch(B58.wc.cl[1])} from the nearest obstacles, ${inch(B58.wc.front)} clear in front of the toilet, ${inch(B58.vn.front)} clear in front of the vanity.`, { noPinch: true })}
<p>The first plan is a 5 × 8 ft bathroom that meets the NKBA <b>recommended</b> values, not just the code minimums: the toilet centerline is ${inch(Math.min(...B58.wc.cl))} from the nearest wall or fixture (recommended ${BATH_REC.wcCL} in, code ${BATH_CODE.wcCL} in), there are ${inch(B58.wc.front)} of clear floor in front of the toilet and ${inch(B58.vn.front)} from the vanity front to the shower (recommended ${BATH_REC.front} in, code ${BATH_CODE.front} in), and the vanity centerline is ${inch(Math.min(...B58.vn.cl))} from the side wall (recommended ${BATH_REC.lavCL} in). The shower entry is on the right-hand part of the shower, where the floor in front is clear. The door opens outward; a pocket door works too.</p>
${figPlan(BATH55, `5 × 5 ft bathroom at code minimums: 30 × 30 in shower, toilet centerline ${inch(B55.wc.cl[0])} from the wall, ${inch(B55.bs.front)} clear in front of the basin. Sliding door.`, { noPinch: true })}
<p>The second plan shows how tight the code minimums are. It works only with a small wall-hung basin (about 18 × 14 in) and with every key distance at the code value rather than the recommendation: toilet centerline ${inch(B55.wc.cl[0])} from the side wall (recommended ${BATH_REC.wcCL} in), basin centerline ${inch(Math.min(...B55.bs.cl))} from the shower and from the wall (recommended ${BATH_REC.lavCL} in), ${inch(B55.bs.front)} between the basin front and the toilet (recommended ${BATH_REC.front} in). The toilet has ${inch(B55.wc.front)} of clear floor in front of it, the shower entry ${inch(B55.sh)} (code ${BATH_CODE.shower} in). An inward-opening door would cross the shower entry; the plan assumes a sliding door. Treat this as the lower limit, not as a comfortable bathroom.</p>
<h2 id="door">Doors</h2>
<p>The NKBA recommends a clear opening of at least 32 in for a bathroom doorway, which needs a 2 ft 10 in door, and accepts a 2 ft 0 in door where the existing structure cannot be changed (${ref('nkba-door', 'guideline 1')}). The ADA Standards also set 32 in (§404.2.3). How much narrower a legal door can be shows in the manufactured-home standard: 27 in clear for bathroom doors in multi-section homes and 23 in in single-section homes (${ref('hud-intdoor', '24 CFR 3280.111(b)')}). An outward-opening door frees the inside but must not swing into a corridor where someone walks; a pocket door frees both.</p>
<h2 id="check">Quick check</h2>
<ol><li>Toilet centerline to each side: 15 in minimum, 18 in better.</li>
<li>Front of every fixture to the opposite wall or fixture: 21 in minimum (24 in at a shower), 30 in better.</li>
<li>Shower inside: 30 × 30 in minimum, 36 × 36 in better.</li>
<li>Door swing: does it hit a fixture or a person standing at the basin?</li></ol>
<h2 id="tub">Bathtubs</h2>
<p>Tub sizes vary by model, and no document we read standardizes them. One regulator does fix the sizes to draw: the furniture schedule of England’s Approved Document M shows a bath as 700 × 1700 mm (27.6 × 66.9 in), a WC with cistern as 500 × 700 mm and a wash basin as 600 × 450 mm (${ref('adm-f-bath', 'Appendix D')}). Measure the tub you have or the one you want. The space in front of the tub follows the same rule as the other fixtures – 21 in code minimum and 30 in recommended according to the guideline cited above. A tub with a shower over it needs the shower's own minimums only if it is used as a shower; a curtain or a fixed glass panel then defines the wet area.</p>
<h2 id="storage">Storage in a small bathroom</h2>
<p>Floor space in front of fixtures cannot hold furniture, so storage moves up the walls. A mirror cabinet over the basin uses wall that is otherwise empty; shelves above the toilet should start high enough to clear the cistern and a standing person's head when bending. Apply the ${a('/guides/vertical-storage-by-reach/', 'reach bands')}: daily toiletries between 15 and 48 in, spares above or below. Keep any shelf above the toilet shallow so that it does not intrude on the 18 in recommended clearance from the centerline at head height.</p>
<h2 id="measure">Measuring an existing bathroom</h2>
<p>Measure from finished wall surface to finished wall surface – tiles count – and measure the toilet from the wall behind it to the center of the outlet, which decides which toilets fit as a replacement. Note the position of the waste pipes before planning any change: where the toilet can go is decided by its drain, not only by the clearances above.</p>`,
    faq: [
      ['How much space do you need beside a toilet?', 'At least 15 in from the centerline to any wall or fixture (IRC code minimum cited by the NKBA); 18 in is recommended.'],
      ['How much space in front of a toilet?', '21 in is the code minimum cited by the NKBA, 30 in is recommended.'],
      ['What is the minimum shower size?', '30 × 30 in (900 sq in) with room for a 30 in disc, under the IRC as cited in NKBA guideline 9. 36 × 36 in is recommended.'],
      ['What is the smallest bathroom with a shower?', 'At the code minimums cited by the NKBA, about 5 × 5 ft: a 30 × 30 in shower, a toilet whose centerline is exactly 15 in from the wall and a small wall-hung basin (about 18 × 14 in) with 21 in in front of it, plus a sliding or outward-opening door. The NKBA recommended clearances do not fit in that room; 5 × 8 ft meets them.']
    ],
    sources: [S.nkbaB, S.ada4042, S.hud, S.adm]
  },
  {
    slug: 'moving-into-a-studio-furniture', updated: true, group: 'Moving and deliveries', kicker: 'Moving', short: 'Moving into a studio',
    title: 'Moving Into a Studio: Furniture to Keep, Sell or Skip',
    h1: 'Moving into a studio: furniture to keep, sell, skip',
    description: 'Which furniture to take when moving into a studio: a measured method using the new floor plan, use zones and the delivery route – plus a keep/sell/skip table for the usual pieces.',
    lede: 'Moving from a one-bedroom into a studio usually means losing a third of the furniture. Decide with measurements, not memories: draw the new room, add each piece with its use zone, and check the route in.',
    related: ['will-my-sofa-fit-through-the-door', 'studio-apartment-layouts', 'how-to-measure-a-room-for-furniture'],
    tool: `draw the studio in the ${a('/tools/clearance-planner/', 'Clearance Planner')} and check each large piece with ${a('/tools/will-it-fit/', 'Will It Fit?')}.`,
    howto: { name: 'Decide which furniture to move into a studio', tools: ['Tape measure', 'Floor plan of the studio'], steps: [['Get the floor plan', 'Measure the studio or ask for a plan with door positions and swings.'], ['Measure every piece', 'Outside dimensions of each piece you might keep, including legs and handles.'], ['Add use zones', 'Add chair, drawer, bedside and door zones to each piece.'], ['Place the essentials first', 'Bed, then sofa or seating, then table or desk.'], ['Check walkways', 'Keep the route from the door to the bed and bathroom at least 36 in wide.'], ['Check the delivery route', 'Test each large piece against the doors, corners and stairs.']] },
    body: `<h2 id="method">The method</h2>
<p>The question is not “will it fit?” but “will it fit with everything else, and can I still move around?”. Work through the pieces in order of necessity and stop adding when the walkway drops below 36 in – the clear width in ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')} that this site uses as its reference.</p>
<ol><li><b>Get the studio's plan</b> with door positions and swings. Measure it yourself if possible – see ${a('/guides/how-to-measure-a-room-for-furniture/', 'how to measure a room')}.</li>
<li><b>Measure every piece</b> you are considering: outside dimensions with legs, handles and cushions.</li>
<li><b>Place the bed first,</b> with a 24 in strip on every side you use. It is the largest piece and has the fewest possible positions.</li>
<li><b>Then the seating,</b> then the table or desk with its chair zone, then storage.</li>
<li><b>Check the route</b> from the entry to bed, bathroom, kitchen and window after each piece.</li>
<li><b>Check the delivery route</b> for every large piece. A piece that does not get in is not a candidate.</li></ol>
<h2 id="table">Keep, sell or skip</h2>
${table(['Piece', 'Usually', 'Why'], [
  ['Queen bed', 'keep if the studio is 250 sq ft +', '60 × 80 in plus one strip; push one side to the wall'],
  ['King bed', 'sell', '76 × 80 in leaves little room in most studios'],
  ['Full-size sofa (84 in +)', 'check', 'a deep sofa takes 54 in with legroom; a loveseat may be better'],
  ['Sofa bed', 'keep', 'replaces bed or guest bed – see wall bed vs. sofa bed'],
  ['Dining table for 6', 'sell', 'a table for 2–4 against a wall is enough'],
  ['Drop-leaf / extending table', 'keep', 'small daily, large when needed'],
  ['Dresser', 'keep if shallow (≤ 18 in)', 'needs an 18 in drawer zone in front'],
  ['Tall bookcase', 'keep', 'storage plus divider; anchor it'],
  ['Armchair', 'check', 'about 32 × 34 in plus legroom'],
  ['Coffee table', 'swap for a smaller one', 'or nesting tables'],
  ['Desk', 'keep if ≤ 42 in wide', 'needs a 32 in chair zone'],
  ['Wardrobe', 'check delivery', 'often the hardest to get in; flat-pack moves best']])}
<h2 id="example">Example: one-bedroom to 20 × 15 ft studio</h2>
${figLayout('studio-20x15-queen-corner', 'What made it into a 240 × 180 in studio: queen bed, sofa, coffee table, TV unit, desk, dresser and one nightstand.')}
<p>From a one-bedroom with a queen bed, two nightstands, a sofa and armchair, a dining table for four, a desk, a dresser and a wardrobe, this studio kept the bed, one nightstand, the sofa, the desk and the dresser. The armchair, dining table and wardrobe did not fit without pushing a walkway below 36 in; the second nightstand would have blocked the bedside strip. A table for two would fit in place of the TV unit if eating at a table matters more than a TV.</p>
<h2 id="delivery">Getting it in</h2>
<p>Studios are often in older buildings with narrow stairs and tight landings. The ${a('/guides/will-my-sofa-fit-through-the-door/', 'five delivery measurements')} – door clear width and height, diagonal depth, hallway widths at corners, headroom – tell you before moving day whether a sofa or wardrobe will make it. The ${a('/tools/will-it-fit/', 'delivery check')} tests all orientations automatically.</p>
${tryIt(dlink({ W: 40, D: 24, H: 78, diag: 0 }, { upright: true, useDoor2: true }), 'Try it: wardrobe kept upright', 'Example: a 40 × 24 × 78 in wardrobe through a 32 in entry door, a 36 in hallway corner and a 30 in room door. Replace the numbers with your piece and your route.')}
<h2 id="storage">What happens to the things in the furniture?</h2>
<p>Every dresser and wardrobe you leave behind holds things that need a new place. Before selling storage furniture, measure its volume (width × depth × height) and plan where that volume goes – the ${a('/tools/storage-wall/', 'Storage Wall Audit')} shows how much storage a wall gives you at each reach height. For scale: England’s space standard asks for 1.0 m² (10.8 sq ft) of built-in storage floor in a new one-person home and 1.5 m² for two people (${ref('ndss-storage', 'Table 1')}), and counts a one-person flat from 37 m² (398 sq ft) – larger than every studio plan on this site, which range from 225 to 336 sq ft.</p>`,
    faq: [
      ['How much furniture fits in a studio apartment?', 'Typically a bed, a sofa or loveseat, a small table or desk, one dresser or tall bookcase and a coffee table – as long as the route from the door to the bed stays about 36 in wide.'],
      ['Should I bring my queen bed to a studio?', 'Usually yes for studios of about 250 sq ft or more, with one long side against a wall. Below that, consider a full or a wall bed.'],
      ['What furniture should I sell before moving to a studio?', 'Large dining tables, king beds, oversized sofas and deep wardrobes are the usual candidates. Check each with the new floor plan first.'],
      ['How do I know my furniture will get in?', 'Measure door clear widths, hallway widths at corners and headroom at stairs, and compare them with each piece, or use a delivery check tool.']
    ],
    sources: [S.ada4035, S.ndss]
  },
  {
    slug: 'murphy-bed-room-size', updated: true, group: 'Fold-away furniture', kicker: 'Fold-away', short: 'Murphy bed room size',
    title: 'Murphy Bed Room Size: How Much Space a Wall Bed Needs',
    h1: 'Murphy bed room size: how much space a wall bed needs',
    description: 'How much room a Murphy bed needs: wall width, ceiling height and floor depth for queen, full and twin wall beds, vertical vs. horizontal, plus the clearance to keep in front at night.',
    lede: 'A wall bed needs three things: enough wall, enough ceiling height and enough clear floor in front when it is down. Here is how to size each one for a queen, full or twin, and what has to stay free at night.',
    related: ['studio-apartment-layouts', 'space-between-bed-and-wall', 'full-vs-queen-bed-small-bedroom'],
    tool: `check the night state of your room in the ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')}.`,
    body: `<h2 id="three">Three dimensions to check</h2>
<p>Wall beds differ by manufacturer, so the numbers below are planning figures based on the mattress size plus a cabinet allowance. Mattress sizes are the U.S. standard sizes listed in ${a(CASPER, 'Casper’s size chart')}. Always confirm with the manufacturer's installation sheet for the exact model.</p>
${table(['Wall bed', 'Mattress', 'Wall width (approx.)', 'Open depth from wall (approx.)'], [
  ['Twin, vertical', '38 × 75 in', '≈ 44 in', '≈ 83 in'],
  ['Full, vertical', '53 × 75 in', '≈ 59 in', '≈ 81 in'],
  ['Queen, vertical', '60 × 80 in', '≈ 66 in', '≈ 86 in'],
  ['Full, horizontal', '53 × 75 in', '≈ 81 in', '≈ 59 in'],
  ['Queen, horizontal', '60 × 80 in', '≈ 86 in', '≈ 66 in']])}
<p>The approximations add about 6 in to the mattress for the cabinet sides and about 6–18 in to the depth for the cabinet and frame. A <b>vertical</b> wall bed (head against the wall) needs a wall slightly wider than the mattress and a ceiling higher than the bed length plus the cabinet top – typically around 84–90 in for a queen. A <b>horizontal</b> wall bed (long side against the wall) needs a wider wall but less height and less floor depth, which helps in rooms with low ceilings or sloping roofs.</p>
${rule('≈ 86 in', 'Floor depth from the wall for a queen vertical wall bed when open', 'planning figure: 80 in mattress + ≈ 6 in cabinet; check your model')}
<h3 id="spec">One real spec sheet against the planning figures</h3>
<p>The planning figures are a lower bound, and a real model can be noticeably larger. As one example – not a survey, and not a recommendation – the published spec sheet of a queen vertical wall bed with a headboard and crown moulding (model ADONQNP, sheet dated November 2023) states:</p>
${table(['', 'Spec sheet (one model)', 'Planning figure above', 'Difference'], [
  ['Width', '68 3/4 in (1746 mm)', '≈ 66 in', '+2.75 in'],
  ['Closed depth', '20 3/8 in (518 mm)', '18 in', '+2.4 in'],
  ['Open depth from the wall', '94 9/16 in (2402 mm)', '≈ 86 in', '+8.6 in'],
  ['Height', '91 5/8 in (2327 mm)', '≈ 84–90 in', 'above the range'],
  ['Mattress', '60 × 80 in, 12 in thick', '60 × 80 in', '–']])}
<p>With that model, the room depth for the bed plus a 24 in foot strip is 94.6 + 24 = 118.6 in, not 110 in – 9 ft 11 in instead of 9 ft 2 in – and it does not fit under a ceiling lower than its 91 5/8 in (just under 7 ft 8 in). A 7 ft 0 in ceiling, the minimum for habitable rooms in U.S. manufactured homes (${ref('hud-ceiling', '24 CFR 3280.104')}), is too low for it. This is why the manufacturer’s sheet for the exact model has to replace the planning figures before you buy.</p>
${tryIt(qlink('bed', { wall: 120, bedW: 68.75, depth: 132, bedL: 94.563, sides: '2' }), 'Try it: this model in 10 × 11 ft', 'Bed wall 120 in, cabinet 68.75 in wide; room depth 132 in, open depth 94.6 in: 25.6 in beside the cabinet on each side, 37.4 in at the foot.')}
<h2 id="front">What has to stay free in front</h2>
<p>When the bed is down, the floor it covers must be empty – no coffee table, no rug with furniture on it, no plant on the floor. On top of that, plan:</p>
<ul><li><b>A 24 in strip at the foot</b> (this site's bedside assumption) to walk past and make the bed.</li>
<li><b>A route from the entry door to the bed</b> at least 36 in wide – the clear width in ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')} – which may use the strip at the foot.</li>
<li><b>The entry door must open fully</b> with the bed down. A bed inside the door swing is a safety problem.</li></ul>
<p>For a queen vertical wall bed, that means about 86 + 24 = 110 in (just over 9 ft) of room depth in front of the bed wall, plus whatever the walkway needs if it does not use the foot strip.</p>
${figLayout('studio-15x15-wall-bed', 'Queen wall bed in a 15 × 15 ft studio at night: 94 in remain between the foot of the open bed and the opposite wall.', { state: 'night' })}
<h2 id="room">Minimum room sizes</h2>
${table(['Wall bed', 'Bed wall at least', 'Room depth at least', 'Ceiling at least'], [
  ['Twin, vertical', '≈ 4 ft', '≈ 9 ft', 'check model (≈ 7 ft)'],
  ['Full, vertical', '≈ 5 ft', '≈ 9 ft', 'check model (≈ 7 ft)'],
  ['Queen, vertical', '≈ 5 ft 6 in', '≈ 9 ft 2 in', 'check model (≈ 7 ft 6 in)'],
  ['Queen, horizontal', '≈ 7 ft 2 in', '≈ 7 ft 6 in', 'lower – check model']])}
<p>These are the space for the bed and its foot strip only. A room that should also work as a living room in the day needs more – see the ${a('/guides/studio-apartment-layouts/', 'measured studio layouts')}.</p>
<h2 id="sofa-bed">Wall bed or sofa bed: the same room both ways</h2>
<p>A sofa bed is the other way to free the floor by day. The plans use the same 15 × 15 ft (180 × 180 in) studio with the entry in the bottom-right corner. Both contain a table for two and a bookshelf. The wall-bed room needs separate seating – a 34 × 60 in loveseat and a coffee table that is moved away each evening – while in the sofa-bed room the bed is the seating and nothing has to move. The sofa-bed figures are this site’s preset (36 in deep closed, opening 54 in further), not a particular product.</p>
${figLayout('studio-15x15-wall-bed', 'Wall bed, day: the cabinet is 18 in deep; a loveseat and coffee table use the floor in front of it.', { state: 'day' })}
${figLayout('studio-15x15-wall-bed', 'Wall bed, night: the bed projects 68 in; the coffee table has gone, the loveseat is beside the bed, not under it.', { state: 'night' })}
${figPlan(SOFA_BED_PLAN, 'Sofa bed in the same room, night: it opens to about 90 in from the wall.', { state: 'night' })}
${(() => { 
  return table(['Computed for the plans above', 'Wall bed', 'Sofa bed'], [
    ['Free floor by day', FOLD_FREE.wbDay + ' %', FOLD_FREE.sbDay + ' %'],
    ['Free floor at night', FOLD_FREE.wbNight + ' %', FOLD_FREE.sbNight + ' %'],
    ['Depth from the wall, closed', '18 in', '36 in'],
    ['Depth from the wall, open', '86 in', '90 in'],
    ['Seating by day', 'separate loveseat (in the plan)', 'the sofa itself'],
    ['Has to be fixed to the building', 'yes, or a freestanding frame made for it', 'no']]); })()}
<p>The percentages are computed from these two plans by the planner’s code: floor not covered by furniture or by a use zone. They describe these two rooms, not wall beds and sofa beds in general. Two things can be read from them. The open depths are within 4 in of each other, so at night both rooms need about the same clear floor in front of the bed wall. And although a closed wall-bed cabinet is 18 in shallower than a sofa, the wall-bed room ends up with ${FOLD_FREE.wbDay < FOLD_FREE.sbDay && FOLD_FREE.wbNight < FOLD_FREE.sbNight ? 'less free floor here, by day and by night' : 'a different amount of free floor here'}, because the seating it needs is a second piece of furniture: the loveseat alone covers 14.2 sq ft. A wall bed frees more floor than a sofa bed only if you do without a sofa. To compare them in your own room, set up both versions in the ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')}.</p>
<h2 id="side">What can stand beside it</h2>
<p>The wall bed's own side panels can usually take shelves or a desk unit (many systems offer them). Freestanding furniture beside the cabinet is fine as long as it does not stand where the open bed lands. A sofa or loveseat placed alongside the open bed's footprint – rather than in front of the cabinet – is the arrangement that works best day to day, because nothing has to move except a light coffee table.</p>
<h2 id="wall">The wall itself</h2>
<ul><li>Most wall beds must be anchored to the wall structure (studs or masonry); some have a freestanding frame. Ask your landlord before drilling.</li>
<li>Check for outlets, switches, radiators, skirting heaters and windows on the bed wall – the cabinet will cover them.</li>
<li>Check the floor in front: a door threshold or a change of floor level within the open footprint can prevent the bed from resting flat.</li></ul>
<h2 id="steps">Step-by-step sizing</h2>
<ol><li>Pick the mattress size and orientation (vertical or horizontal).</li>
<li>Measure the wall width and ceiling height at the bed wall; compare with the manufacturer's minimums.</li>
<li>Measure from the bed wall to the opposite wall or furniture: open depth + 24 in strip at least.</li>
<li>Draw the entry door swing and check that the open bed is outside it.</li>
<li>Check the route from the door to the bed and the window at night.</li>
<li>Check delivery: wall bed cabinets come flat-packed or in large parts – check the largest box with the ${a('/tools/will-it-fit/', 'delivery check')}.</li></ol>`,
    faq: [
      ['How much space do you need for a queen Murphy bed?', 'As a planning figure: a wall about 66 in wide and roughly 86 in of floor in front of it when open (vertical bed), plus about 24 in at the foot. Real models can be larger – one spec sheet we read lists 68 3/4 in width, 94 9/16 in open depth and 91 5/8 in height – so use the sheet for your model.'],
      ['Does a wall bed save more space than a sofa bed?', `Only if you do without a sofa. The presets used here are 18 in deep for a closed wall-bed cabinet and 36 in for a sofa, and both open to about 86–90 in from the wall. In the two computed plans on this page the wall-bed room has ${FOLD_FREE.wbDay} % free floor by day and the sofa-bed room ${FOLD_FREE.sbDay} %, because the wall-bed room also holds a loveseat.`],
      ['What is the difference between vertical and horizontal wall beds?', 'A vertical bed folds up with its head against the wall: narrower wall, deeper floor, higher ceiling. A horizontal bed folds with its long side against the wall: wider wall, less depth and height.'],
      ['Can you put furniture in front of a Murphy bed?', 'Only pieces you move away each evening. Anything in the open footprint must be cleared before the bed comes down.'],
      ['Can a Murphy bed go in a 10x10 room?', 'A full or queen vertical wall bed fits a 10 × 10 ft room, leaving about 34 in (queen) at the foot when open.']
    ],
    sources: [S.casper, S.ada4035, S.spec, S.hud]
  }
];
