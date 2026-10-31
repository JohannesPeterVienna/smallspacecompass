import { figPlan, figLayout, figRaw, figElev, room, door, rule, table, a, S, ADA, NKBA_K, NKBA_B, CASPER, SILENT, bs, chair, dimLine } from './common.mjs';
const it = (id, label, x, y, w, d, extra = {}) => ({ id, label, x, y, w, d, ...extra });

export const A3 = [
  {
    slug: 'dining-table-small-space', group: 'Living and dining', kicker: 'Dining', short: 'Dining table for a small space',
    title: 'Dining Table for a Small Space: Size and Chair Clearance (Measured)',
    h1: 'Dining table for a small space: size and chair clearance',
    description: 'How big a dining table fits a small room: 24 in per place setting, 32–44 in behind each chair depending on traffic, and measured plans for round, square and drop-leaf tables.',
    lede: 'The table is the small part. Each chair needs about 32 in from the table edge to sit down, more if people walk behind it. Work out the chair zones first and the table size follows.',
    related: ['small-kitchen-clearances', 'walkway-space-around-furniture', 'wall-bed-vs-sofa-bed'],
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
${figPlan(room(120, 120, [it('t', 'Table for 4', 36, 45, 48, 30, { zones: [{ side: 'N', depth: 32, kind: 'chair' }, { side: 'S', depth: 32, kind: 'chair' }] }), it('sb', 'Sideboard', 0, 0, 40, 16)], [door('S', 6, 30)], [{ id: 'w', wall: 'E', offset: 30, width: 48 }]), 'Table for four in a 10 × 10 ft space: 32 in chair zones on the long sides leave 13 in to each wall – nobody can pass behind a seated diner.')}
<p>The plan shows the common mistake: the table fits, the chairs fit, but nobody can get past a seated person. In a 10 ft room with chairs on both long sides, the table may be at most 120 − 2 × 44 = 32 in wide if people should walk behind the chairs – a narrow table, or a bench along one wall.</p>
<h2 id="round">Round versus rectangular</h2>
<p>A round table has no corners at hip height, so it is easier to edge past. It also seats one more person in a pinch. The cost: a round table cannot go flat against a wall without wasting space, and the same seating needs a slightly larger footprint than a rectangle with one long side against the wall. In a small space, use round tables in the middle of a zone and rectangles along walls.</p>
<h2 id="wall">Against the wall</h2>
${figPlan(room(120, 96, [it('t', 'Table for 2', 0, 30, 30, 30, { zones: [{ side: 'E', depth: 32, kind: 'chair' }] }), it('sofa', 'Loveseat', 60, 62, 60, 34, { zones: [{ side: 'N', depth: 18, kind: 'legroom' }] })], [door('N', 70, 30, 'end')]), 'A table for two against the wall needs one chair zone instead of two – the rest of the floor stays free.')}
<p>Pushing a table against the wall turns a table for four into a table for two or three in daily use and saves one or two chair zones of 32 in. When guests come, pull it out. Benches along a wall save even more: they need no pull-out space at all, because you slide onto them.</p>
<h2 id="dropleaf">Drop-leaf and gateleg tables</h2>
<p>A drop-leaf table folded against the wall is about 10–12 in deep; opened, it projects another 20 in or so and needs chair zones on its open sides. Plan it like ${a('/guides/wall-bed-vs-sofa-bed/', 'any fold-away furniture')}: check the room in both states. The ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')} has a drop-leaf preset that opens in the day and folds at night.</p>
<h2 id="chairs">Chairs</h2>
<ul><li><b>Width:</b> 24 in per diner (NKBA guideline 9) is the comfortable minimum; dining chairs are typically 17–20 in wide.</li>
<li><b>Stools that tuck under</b> a counter or table use the knee space and need no pull-out zone when not in use.</li>
<li><b>Folding chairs</b> on wall hooks are the small-space classic – one hook per guest chair.</li>
<li><b>Armrests</b> stop a chair sliding fully under the table; prefer armless chairs in small rooms.</li></ul>
<h2 id="steps">Choosing a table in four steps</h2>
<ol><li>Decide how many people eat at the table daily, not on the busiest day.</li>
<li>Decide which sides have traffic behind the chairs: 32, 36 or 44 in.</li>
<li>Subtract the chair zones from the space to get the maximum table size.</li>
<li>Pick a table that seats the daily number and extends or unfolds for the rest.</li></ol>
<h2 id="shapes">Odd rooms and corners</h2>
<p>In an L-shaped corner, a banquette or corner bench with a table saves the most floor: the bench side needs no pull-out zone, and the table can be pushed into the corner. In a long, narrow room, a narrow rectangular table (24–30 in wide) along the wall leaves the walkway clear; a round table in the same room usually ends up in the route. Under a window, keep the table low enough not to block the sill and make sure an inward-opening sash still clears it.</p>
<h2 id="lighting">Light above the table</h2>
<p>A pendant light fixes the table's position. Before you drill, place the table and its chair zones on the plan and mark the centre of the table, not the centre of the room – in a small space the two are rarely the same.</p>`,
    faq: [
      ['How much space do you need around a dining table?', '32 in from the table edge to a wall where nobody passes, 36 in if people edge past and 44 in if they walk past (NKBA Kitchen Planning Guideline 8).'],
      ['What size table fits a 10x10 room?', 'A 36 in square or round table for four fits with 32 in chair zones on all sides, but nobody can pass behind a seated diner. For walking space, push it against a wall or choose a narrow table.'],
      ['Is a round or square table better for a small space?', 'Round tables are easier to edge past and seat an extra person; square and rectangular tables use space better against a wall.'],
      ['How much width does each person need at a table?', '24 in per seated diner according to NKBA guideline 9.']
    ],
    sources: [S.nkbaK]
  },
  {
    slug: 'entryway-storage-without-a-closet', group: 'Storage', kicker: 'Storage', short: 'Entryway storage without a closet',
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
<li>the walkway from the door into the room – it should stay at least 36 in wide, the clear width in ${a(ADA + '#ada-403_5_1', 'ADA 2010 §403.5.1')}.</li></ul>
${figPlan(room(120, 96, [it('bench', 'Shoe bench', 0, 82, 36, 14, { zones: [{ side: 'N', depth: 24, kind: 'sitting', walk: true }] }), it('cab', 'Shoe cabinet', 84, 84, 36, 12), it('sofa', 'Sofa', 0, 0, 78, 36, { target: true })], [door('S', 44, 32, 'end')]), 'Entry wall: shoe bench on the latch side, shallow cabinet behind the door swing; the route into the room stays clear.')}
<h2 id="heights">Heights that work</h2>
${table(['Element', 'Height above floor', 'Why'], [
  ['Coat hooks, adults', '≈ 60–66 in', 'long coats clear the floor; above the reach band, but hooks need no shelf depth'],
  ['Coat hooks, children or second row', '≈ 40–48 in', 'within the 15–48 in reach range'],
  ['Key hooks, mail tray', '≈ 40–48 in', 'everyday reach, ADA §308 range'],
  ['Shoe bench seat', '≈ 17–19 in', 'normal seat height'],
  ['Shelf above hooks', '≈ 70 in +', 'hats, gloves; seasonal']])}
<p>The reach range of 15–48 in from ${a(ADA + '#ada-308_2_1', 'ADA 2010 §308.2.1')} is the zone for things you grab every day – keys, bags, a dog lead. Coat hooks are an exception: long coats need to hang above the floor, so adult hooks go higher. Mount a second row lower for children, guests or short jackets. See ${a('/guides/vertical-storage-by-reach/', 'Vertical storage by reach')} for the reasoning.</p>
<h2 id="depth">Depth is the constraint</h2>
<p>Everything at an entry sits next to a walkway. A coat on a hook projects 10–12 in from the wall; a shoe bench is typically 12–16 in deep; a shoe cabinet with tilt-out drawers only 7–9 in when closed. In a narrow entry corridor, those inches decide whether the walkway stays at 36 in:</p>
${table(['Entry width', 'Storage depth that keeps 36 in', 'Fits'], [
  ['42 in', '6 in', 'hooks only, slim key rack'],
  ['48 in', '12 in', 'hooks + tilt-out shoe cabinet'],
  ['54 in', '18 in', 'bench + hooks, or a small cabinet'],
  ['60 in +', '24 in', 'wardrobe-depth unit']])}
<h2 id="ideas">Seven ideas, from shallow to deep</h2>
<ol><li><b>A rail of hooks</b> along the latch-side wall: no floor at all.</li>
<li><b>A slim shoe cabinet</b> (tilt-out drawers) behind the door's swing arc – only if the door still opens fully past it.</li>
<li><b>A shoe bench</b> with a shelf underneath: somewhere to sit, about 4–6 pairs of shoes.</li>
<li><b>A wall shelf with hooks</b> above the bench: hats, gloves and a key tray at reach height.</li>
<li><b>Over-door hooks</b> on the inside of the entry door: a few bags or scarves, no wall needed.</li>
<li><b>A freestanding coat stand</b> in a corner: easy to move, but it takes about 20 in square.</li>
<li><b>A shallow wardrobe</b> (16–18 in) if the entry is wide enough: closed storage for coats and a vacuum.</li></ol>
<h2 id="shoes">How much shoe storage do you need?</h2>
<p>Count the pairs in daily use, not all you own. Rough capacities: a 36 in wide shelf holds 4–5 pairs of adult shoes; a tilt-out drawer about 3 pairs. Keep only those at the door; the rest go in the high or low band elsewhere.</p>
<h2 id="mistakes">Mistakes to avoid</h2>
<ul><li>Hooks so close to the door frame that coats are hit by the opening door.</li>
<li>A bench or cabinet inside the door swing – the door will stop against it.</li>
<li>A mirror at the only spot where you stand to put on shoes.</li>
<li>Deep storage on both sides of a narrow entry: the walkway becomes a squeeze.</li></ul>
<h2 id="hinge">Using the hinge side</h2>
<p>The wall behind an open door is often wasted. Measure the distance between the face of the fully open door and the wall it opens towards: that gap – often 2–4 in with a door stop – is the maximum depth of anything you mount there. Shallow hooks, a slim key cabinet or a fold-down shelf can use it. Anything deeper stops the door short of fully open, which reduces the clear width of the entrance – the width that every delivery has to pass, as explained in the ${a('/guides/will-my-sofa-fit-through-the-door/', 'sofa delivery guide')}.</p>
<h2 id="plan">Plan it before you drill</h2>
<p>Draw the entry wall in the ${a('/tools/storage-wall/', 'Storage Wall Audit')}: wall width, bench, cabinet and shelf heights. The tool shows how much of the storage sits within the 15–48 in band. Then draw the floor plan in the ${a('/tools/clearance-planner/', 'Clearance Planner')} with the door swing, and add the bench with a 24 in sitting zone in front – the space you need to sit and put on shoes. If the zone and the door swing overlap, the bench is in the wrong place.</p>`,
    faq: [
      ['How high should coat hooks be?', 'About 60–66 in for adult coats so long coats do not drag; a second row at 40–48 in for children, guests or bags.'],
      ['How deep should an entryway bench be?', 'Usually 12–16 in. In a narrow entry, check that the walkway beside it stays at least 36 in wide.'],
      ['Where do I put shoes without a closet?', 'In a slim tilt-out cabinet or under a bench by the door, keeping only the pairs you use daily there.'],
      ['Can storage go behind the entry door?', 'Only if it is shallow enough that the door still opens fully – measure the gap between the open door and the wall.']
    ],
    sources: [S.ada4035, S.ada308]
  },
  {
    slug: 'rug-size-small-living-room', group: 'Living and dining', kicker: 'Living room', short: 'Rug size guide',
    title: 'Rug Size Guide for Small Living Rooms (with Measured Plans)',
    h1: 'Rug size guide for small living rooms',
    description: 'Which rug size fits a small living room – 5 × 8, 6 × 9 or 8 × 10 ft – with measured plans: how far it sits from the walls, which furniture legs go on it, and how rugs define zones in a studio.',
    lede: 'A rug that is too small makes a small room look smaller. The usual rule – front legs of the seating on the rug – translates into a few measurable distances. Here they are, with plans for three common sizes.',
    related: ['divide-a-studio-without-walls', 'studio-apartment-layouts', 'dining-table-small-space'],
    tool: `the 5 × 8 ft rug preset in the ${a('/tools/clearance-planner/', 'Clearance Planner')} sits under furniture without counting as an obstacle.`,
    body: `<h2 id="sizes">Common sizes</h2>
${table(['Nominal size', 'Inches', 'Centimetres (approx.)'], [
  ['4 × 6 ft', '48 × 72 in', '120 × 180 cm'],
  ['5 × 8 ft', '60 × 96 in', '150 × 240 cm'],
  ['6 × 9 ft', '72 × 108 in', '180 × 270 cm'],
  ['8 × 10 ft', '96 × 120 in', '240 × 300 cm']])}
<p>Rugs are sold in nominal sizes; actual sizes are often an inch or two smaller, and metric rugs (160 × 230 cm, 200 × 300 cm) are common in the UK and Europe. Measure the rug you are buying.</p>
<h2 id="rule">The rule, measured</h2>
<p>For a seating area, the most useful rule is: <b>the front legs of every seat stand on the rug</b>. With a typical sofa 36 in deep and front legs about 4 in in from the front, the rug must reach at least 32 in from the wall behind the sofa. On the other sides, leave a band of floor between rug and walls – the rug then looks placed rather than trapped. These distances are design conventions, not standards; use them as a starting point.</p>
${table(['Distance', 'Typical'], [
  ['Rug edge under sofa (front legs on)', '≈ 4–8 in under the front of the seat'],
  ['Floor band between rug and wall', '≈ 8–18 in in small rooms'],
  ['Rug beyond the coffee table', '≥ 12 in on each side'],
  ['Walkway across the rug', 'keep it flat; low pile or flat-weave']])}
<h2 id="58">5 × 8 ft in a 10 × 12 ft living area</h2>
${figPlan(room(144, 120, [it('rug', 'Rug 5×8', 24, 28, 96, 60, { floor: true }), it('sofa', 'Sofa', 33, 0, 78, 36, { zones: [{ side: 'S', depth: 18, kind: 'legroom' }] }), it('ct', 'Coffee table', 52, 54, 40, 20), it('ac', 'Armchair', 112, 50, 32, 34), it('tv', 'TV unit', 44, 104, 55, 16)], [door('S', 108, 32, 'end')]), 'A 5 × 8 ft rug in front of the sofa: sofa front legs on the rug, about 24 in of floor to the side walls.')}
<p>A 5 × 8 ft rug is the most common size for small living rooms. Placed lengthways in front of a 78 in sofa, it extends about 9 in beyond each end of the sofa and carries the coffee table with about 28 in to spare on each side. The armchair's front legs are on it too. The band of floor to the walls makes the room look larger than a wall-to-wall rug would.</p>
<h2 id="69">6 × 9 ft</h2>
<p>A 6 × 9 ft rug suits a living area of about 11 × 13 ft and larger, or a sofa wider than about 84 in. It extends further under the seating and can hold a pair of chairs facing the sofa. In a smaller room it starts touching the walls and makes the floor look busy.</p>
<h2 id="studio">Rugs as zone markers in a studio</h2>
<p>In a studio, a rug says “this is the living room”. Two rules make it work:</p>
<ul><li><b>One rug per zone,</b> clearly separate – a rug that runs under the bed and the sofa merges the two zones instead of dividing them.</li>
<li><b>Keep the walkway off the rug edge</b> where possible, or choose a flat-weave rug with a thin edge so nobody trips at night.</li></ul>
<p>See ${a('/guides/divide-a-studio-without-walls/', 'How to divide a studio without walls')} for rugs combined with other dividers.</p>
<h2 id="bedroom">Under a bed</h2>
<p>Under a bed, a rug should extend beyond the sides where you get out: a 5 × 8 ft rug under a queen (60 × 80 in), placed crosswise with the bed's lower two-thirds on it, extends 18 in on each side – roughly the bedside strip. In a small bedroom, two runners beside the bed often work better than one large rug.</p>
<h2 id="safety">Safety and practicalities</h2>
<ul><li>Use a non-slip underlay; it also stops the rug creeping under a door.</li>
<li>Check the door: a thick rug inside a door swing can stop the door opening fully. Measure the gap under the door.</li>
<li>Rugs with a raised edge are a trip hazard on night routes.</li></ul>
<h2 id="dining">Under a dining table</h2>
<p>A rug under a dining table must be large enough that the chairs stay on it when pulled out – otherwise the back legs catch on the edge every time someone sits down. Add the chair zone on every side: for a 48 × 30 in table with 32 in zones on both long sides, the rug must be at least 30 + 2 × 32 = 94 in across. A 5 × 8 ft (60 in) or 6 × 9 ft (72 in) rug is too narrow in that direction; an 8 × 10 ft rug (96 in) is the smallest standard size that works. In small spaces, a bare floor under the table is often the better choice.</p>
<h2 id="measure">How to test a size before buying</h2>
<p>Mark the rug outline on the floor with painter's tape and leave it for a day. Walk the routes, open the doors and sit on the sofa. If the tape crosses a doorway or ends just short of the sofa's front legs, change the size. In the ${a('/tools/clearance-planner/', 'Clearance Planner')}, the rug preset sits under the furniture and does not count as an obstacle, so you can try several sizes against the real plan.</p>
<h2 id="materials">Pile height in small rooms</h2>
<p>In a small room, rugs sit on routes far more often than in a large one. A low pile or flat-weave rug lets doors swing over it, does not catch chair legs and is easier to keep clean. If a door has to open over the rug, measure the gap under the door and compare it with the rug's thickness plus underlay.</p>`,
    faq: [
      ['What size rug for a small living room?', 'Usually 5 × 8 ft (60 × 96 in). It allows the front legs of a standard sofa and an armchair to stand on the rug while leaving a band of floor to the walls.'],
      ['Should the sofa be on the rug?', 'At least its front legs. A rug that stops short of the sofa makes the seating area look smaller.'],
      ['Is a 5x8 rug too small?', 'Not for a living area of about 10 × 12 ft with a sofa up to about 80 in long. For larger sofas or rooms, consider 6 × 9 ft.'],
      ['How much floor should show around a rug?', 'In small rooms, roughly 8–18 in between rug and walls looks deliberate. It is a design convention, not a rule.']
    ],
    sources: [S.casper]
  },
  {
    slug: 'small-bathroom-layout-dimensions', group: 'Kitchens and bathrooms', kicker: 'Bathrooms', short: 'Small bathroom dimensions',
    title: 'Small Bathroom Layout Dimensions: Toilet, Vanity and Shower Clearances',
    h1: 'Small bathroom layout dimensions',
    description: 'Small bathroom clearances with sources: toilet centerline 15/18 in, 21/30 in in front of fixtures, basin spacing and the 30 × 30 in minimum shower (NKBA, IRC), with plans.',
    lede: 'A small bathroom is a puzzle of a few fixed distances: from the toilet centreline to the wall, in front of each fixture, between two basins, and the inside of the shower. Here they are, with their sources and measured plans.',
    related: ['small-kitchen-clearances', 'how-to-measure-a-room-for-furniture', 'walkway-space-around-furniture'],
    body: `<h2 id="source">Sources</h2>
<p>The figures come from the ${a(NKBA_B, 'NKBA Bathroom Planning Guidelines with Access Standards')}. The guidelines give a <b>recommended</b> value for good design and, where one exists, the <b>code requirement</b> from the International Residential Code (IRC) that the NKBA cites. Local codes may differ – this page is for planning, not for approval.</p>
<h2 id="toilet">Toilet</h2>
${rule('15 in', 'Toilet centreline to wall or fixture, code minimum (381 mm)', 'IRC, cited in NKBA Bathroom Planning Guideline 20 – 18 in (457 mm) recommended')}
<p>Measure from the centreline of the toilet to the nearest wall, fixture or obstacle on either side. The code minimum cited by the NKBA is 15 in; the recommendation is 18 in. A toilet between two walls therefore needs at least 30 in, better 36 in, of wall-to-wall width.</p>
<h2 id="front">In front of fixtures</h2>
${table(['Space in front of', 'Code minimum', 'NKBA recommended'], [
  ['Toilet, lavatory, bidet, tub', '21 in (533 mm)', '30 in (762 mm)'],
  ['Shower entry', '24 in (610 mm)', '30 in (762 mm)']])}
<p>Guideline 4 recommends 30 in of clear floor space from the front edge of every fixture to any opposite fixture, wall or obstacle. The code minimums cited are 21 in in front of a lavatory, toilet, bidet and tub, and 24 in in front of a shower entry.</p>
<h2 id="basin">Basins</h2>
<ul><li><b>Single lavatory:</b> centreline at least 20 in from a side wall or tall obstacle (recommended); 15 in code minimum (guideline 5).</li>
<li><b>Double lavatory:</b> centrelines at least 36 in apart (recommended), 30 in code minimum (guideline 6).</li>
<li>For a 30 × 48 in clear floor space at the basin under the access standard, the centreline must be at least 24 in from the wall.</li></ul>
<h2 id="shower">Shower</h2>
${table(['Shower', 'Interior size', 'Source'], [
  ['Code minimum', '30 × 30 in (900 sq in) – a 30 in disc must fit', 'IRC, cited in NKBA guideline 9'],
  ['NKBA recommended', '36 × 36 in', 'guideline 9'],
  ['Transfer shower (access)', '36 × 36 in', 'access standard'],
  ['Roll-in shower (preferred)', '36–42 × 60 in', 'access standard']])}
<h2 id="plans">Three small layouts</h2>
${figPlan(room(60, 96, [it('wc', 'Toilet', 12, 0, 20, 28), it('vn', 'Vanity', 36, 0, 24, 21), it('sh', 'Shower', 0, 60, 60, 36)], [door('W', 30, 28, 'start', 'in', { entry: true })]), '5 × 8 ft bathroom: toilet and vanity on the top wall, 60 × 36 in shower across the far end. Toilet centreline 22 in from the side wall.', { noPinch: true })}
${figPlan(room(60, 60, [it('wc', 'Toilet', 20, 0, 20, 28), it('vn', 'Vanity', 0, 36, 21, 24), it('sh', 'Shower', 30, 30, 30, 30)], [door('S', 0, 24, 'start', 'none')]), '5 × 5 ft compact bathroom with a 30 × 30 in shower – the code minimum. A sliding or outward-opening door is needed.', { noPinch: true })}
<p>The first plan is the classic 5 × 8 ft bathroom: everything on one long wall except a full-width shower at the end. The toilet centreline 22 in from the wall is above the 18 in recommendation, and the 48 in from the front of the vanity to the opposite wall is well above 30 in.</p>
<p>The second shows how tight the code minimums are: a 30 × 30 in shower, toilet and small vanity in 25 sq ft. An inward-opening door would hit the toilet; the plan assumes a sliding door.</p>
<h2 id="door">Doors</h2>
<p>Bathroom doors are often the narrowest in the home. The ADA Standards define a 32 in clear width (§404.2.3) – useful as a reference for accessible bathrooms; in many homes interior bathroom doors are narrower. An outward-opening door frees the inside but must not swing into a corridor where someone walks. A pocket door frees both.</p>
<h2 id="check">Quick check</h2>
<ol><li>Toilet centreline to each side: 15 in minimum, 18 in better.</li>
<li>Front of every fixture to the opposite wall or fixture: 21 in minimum (24 in at a shower), 30 in better.</li>
<li>Shower inside: 30 × 30 in minimum, 36 × 36 in better.</li>
<li>Door swing: does it hit a fixture or a person standing at the basin?</li></ol>
<h2 id="tub">Bathtubs</h2>
<p>A standard alcove bathtub is about 60 in long and 30–32 in wide, which is why so many small bathrooms are 5 ft wide: the tub fits wall to wall across one end. The space in front of the tub follows the same rule as the other fixtures – 21 in code minimum and 30 in recommended according to the guideline cited above. A tub with a shower over it needs the shower's own minimums only if it is used as a shower; a curtain or a fixed glass panel then defines the wet area.</p>
<h2 id="storage">Storage in a small bathroom</h2>
<p>Floor space in front of fixtures cannot hold furniture, so storage moves up the walls. A mirror cabinet over the basin uses wall that is otherwise empty; shelves above the toilet should start high enough to clear the cistern and a standing person's head when bending. Apply the ${a('/guides/vertical-storage-by-reach/', 'reach bands')}: daily toiletries between 15 and 48 in, spares above or below. Keep any shelf above the toilet shallow so that it does not intrude on the 18 in recommended clearance from the centreline at head height.</p>
<h2 id="measure">Measuring an existing bathroom</h2>
<p>Measure from finished wall surface to finished wall surface – tiles count – and measure the toilet from the wall behind it to the centre of the outlet, which decides which toilets fit as a replacement. Note the position of the waste pipes before planning any change: moving a toilet is the most expensive change in a bathroom, and many small-bathroom layouts are fixed by the soil stack rather than by space.</p>`,
    faq: [
      ['How much space do you need beside a toilet?', 'At least 15 in from the centreline to any wall or fixture (IRC code minimum cited by the NKBA); 18 in is recommended.'],
      ['How much space in front of a toilet?', '21 in is the code minimum cited by the NKBA, 30 in is recommended.'],
      ['What is the minimum shower size?', '30 × 30 in (900 sq in) with room for a 30 in disc, under the IRC as cited in NKBA guideline 9. 36 × 36 in is recommended.'],
      ['What is the smallest bathroom with a shower?', 'With a 30 × 30 in shower, toilet and small vanity, about 5 × 5 ft is possible, but it needs a sliding or outward-opening door.']
    ],
    sources: [S.nkbaB, S.ada4042]
  },
  {
    slug: 'moving-into-a-studio-furniture', group: 'Moving and deliveries', kicker: 'Moving', short: 'Moving into a studio',
    title: 'Moving Into a Studio: Furniture to Keep, Sell or Skip (with Measurements)',
    h1: 'Moving into a studio: furniture to keep, sell, skip',
    description: 'Which furniture to take when moving into a studio: a measured method using the new floor plan, use zones and the delivery route – plus a keep/sell/skip table for the usual pieces.',
    lede: 'Moving from a one-bedroom into a studio usually means losing a third of the furniture. Decide with measurements, not memories: draw the new room, add each piece with its use zone, and check the route in.',
    related: ['will-my-sofa-fit-through-the-door', 'studio-apartment-layouts', 'how-to-measure-a-room-for-furniture'],
    tool: `draw the studio in the ${a('/tools/clearance-planner/', 'Clearance Planner')} and check each large piece with ${a('/tools/will-it-fit/', 'Will It Fit?')}.`,
    howto: { name: 'Decide which furniture to move into a studio', tools: ['Tape measure', 'Floor plan of the studio'], steps: [['Get the floor plan', 'Measure the studio or ask for a plan with door positions and swings.'], ['Measure every piece', 'Outside dimensions of each piece you might keep, including legs and handles.'], ['Add use zones', 'Add chair, drawer, bedside and door zones to each piece.'], ['Place the essentials first', 'Bed, then sofa or seating, then table or desk.'], ['Check walkways', 'Keep the route from the door to the bed and bathroom at least 36 in wide.'], ['Check the delivery route', 'Test each large piece against the doors, corners and stairs.']] },
    body: `<h2 id="method">The method</h2>
<p>The question is not “will it fit?” but “will it fit with everything else, and can I still move around?”. Work through the pieces in order of necessity and stop adding when the walkway drops below 36 in – the clear width in ${a(ADA + '#ada-403_5_1', 'ADA 2010 §403.5.1')} that this site uses as its reference.</p>
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
<h2 id="selling">Selling and replacing</h2>
<ul><li><b>Sell large and heavy pieces early;</b> they take longest to sell and cost most to move.</li>
<li><b>Replace with dual-use pieces:</b> sofa bed, extending table, ottoman with storage, bench instead of chairs.</li>
<li><b>Prefer legs to plinths</b> – visible floor under furniture makes a room look larger, and robot vacuums can get under.</li>
<li><b>Prefer flat-pack for wardrobes</b> – they pass any door and stair.</li></ul>
<h2 id="delivery">Getting it in</h2>
<p>Studios are often in older buildings with narrow stairs and tight landings. The ${a('/guides/will-my-sofa-fit-through-the-door/', 'five delivery measurements')} – door clear width and height, diagonal depth, hallway widths at corners, headroom – tell you before moving day whether a sofa or wardrobe will make it. The ${a('/tools/will-it-fit/', 'delivery check')} tests all orientations automatically.</p>
<h2 id="storage">What happens to the things in the furniture?</h2>
<p>Every dresser and wardrobe you leave behind holds things that need a new place. Before selling storage furniture, measure its volume (width × depth × height) and plan where that volume goes – the ${a('/tools/storage-wall/', 'Storage Wall Audit')} shows how much storage a wall gives you at each reach height.</p>
<h2 id="timeline">A two-week timeline</h2>
<ul><li><b>Two weeks before:</b> measure the studio and the route; list every piece with dimensions; draw the plan.</li>
<li><b>Ten days before:</b> decide keep/sell/skip; list the sell pieces; book the movers with the delivery measurements.</li>
<li><b>One week before:</b> confirm that large pieces pass the route; disassemble what you can – legs, bed frames, wardrobe doors.</li>
<li><b>Moving day:</b> place the bed first, as drawn; check the walkway with a tape before unpacking anything else.</li></ul>
<p>Every piece that does not make it into the plan is a piece you do not have to carry up the stairs. And if the plan shows a gap where something is missing – a place to sit while putting on shoes, a surface beside the bed – buy that piece after you have lived in the studio for a few weeks, when you know how you actually use the room.</p>`,
    faq: [
      ['How much furniture fits in a studio apartment?', 'Typically a bed, a sofa or loveseat, a small table or desk, one dresser or tall bookcase and a coffee table – as long as the route from the door to the bed stays about 36 in wide.'],
      ['Should I bring my queen bed to a studio?', 'Usually yes for studios of about 250 sq ft or more, with one long side against a wall. Below that, consider a full or a wall bed.'],
      ['What furniture should I sell before moving to a studio?', 'Large dining tables, king beds, oversized sofas and deep wardrobes are the usual candidates. Check each with the new floor plan first.'],
      ['How do I know my furniture will get in?', 'Measure door clear widths, hallway widths at corners and headroom at stairs, and compare them with each piece, or use a delivery check tool.']
    ],
    sources: [S.ada4035]
  },
  {
    slug: 'murphy-bed-room-size', group: 'Fold-away furniture', kicker: 'Fold-away', short: 'Murphy bed room size',
    title: 'Murphy Bed Room Size: How Much Space a Wall Bed Needs (Queen, Full, Twin)',
    h1: 'Murphy bed room size: how much space a wall bed needs',
    description: 'How much room a Murphy bed needs: wall width, ceiling height and floor depth for queen, full and twin wall beds, vertical vs. horizontal, plus the clearance to keep in front at night.',
    lede: 'A wall bed needs three things: enough wall, enough ceiling height and enough clear floor in front when it is down. Here is how to size each one for a queen, full or twin, and what has to stay free at night.',
    related: ['wall-bed-vs-sofa-bed', 'studio-apartment-layouts', 'full-vs-queen-bed-small-bedroom'],
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
<h2 id="front">What has to stay free in front</h2>
<p>When the bed is down, the floor it covers must be empty – no coffee table, no rug with furniture on it, no plant on the floor. On top of that, plan:</p>
<ul><li><b>A 24 in strip at the foot</b> (this site's bedside assumption) to walk past and make the bed.</li>
<li><b>A route from the entry door to the bed</b> at least 36 in wide – the clear width in ${a(ADA + '#ada-403_5_1', 'ADA 2010 §403.5.1')} – which may use the strip at the foot.</li>
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
      ['How much space do you need for a queen Murphy bed?', 'A wall about 66 in wide, roughly 86 in of floor in front of the wall when open (for a vertical bed), plus about 24 in at the foot to walk past. Ceiling height depends on the model, often around 84–90 in.'],
      ['What is the difference between vertical and horizontal wall beds?', 'A vertical bed folds up with its head against the wall: narrower wall, deeper floor, higher ceiling. A horizontal bed folds with its long side against the wall: wider wall, less depth and height.'],
      ['Can you put furniture in front of a Murphy bed?', 'Only pieces you move away each evening. Anything in the open footprint must be cleared before the bed comes down.'],
      ['Can a Murphy bed go in a 10x10 room?', 'A full or queen vertical wall bed fits a 10 × 10 ft room, leaving about 34 in (queen) at the foot when open.']
    ],
    sources: [S.casper, S.ada4035]
  }
];
