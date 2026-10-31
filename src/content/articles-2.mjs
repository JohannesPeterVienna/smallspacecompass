import { figPlan, figLayout, figRaw, figElev, room, door, rule, table, a, S, ADA, NKBA_K, NKBA_B, CASPER, bs, chair, dimLine } from './common.mjs';
const it = (id, label, x, y, w, d, extra = {}) => ({ id, label, x, y, w, d, ...extra });

// L-shaped kitchen for the dishwasher example: dwX = left edge of the dishwasher on the top run.
// Guideline 13: 21 in standing space between the dishwasher edge and a run at a right angle.
const kitchenL = (dwX) => room(108, 96, [it('runA', 'Counter + sink', 0, 0, 108, 25, { target: true }),
  it('dw', 'Dishwasher', dwX, 0, 24, 25, { stack: 'runA', zones: [{ side: 'S', depth: 26, kind: 'open door', walk: true }, { side: 'S', depth: 24, at: -21, len: 21, kind: 'standing space (21 in)', walk: true }] }),
  it('runB', 'Counter', 0, 25, 25, 71)], [door('S', 60, 32, 'start', 'none')]);
const kitchenGap = (dwX) => dwX - 25;

export const A2 = [
  {
    slug: 'wall-bed-vs-sofa-bed', group: 'Fold-away furniture', kicker: 'Fold-away', short: 'Wall bed vs. sofa bed',
    title: 'Wall Bed vs. Sofa Bed: Floor Space Compared, Day and Night',
    h1: 'Wall bed vs. sofa bed: floor space compared',
    description: 'A queen wall bed and a sofa bed compared on the same floor plan – day and night footprint, walkway widths, what has to move each evening, and when each one is the better choice.',
    lede: 'Both give back floor space in the day, but in different ways. A wall bed disappears into an 18 in cabinet and leaves the room empty; a sofa bed keeps a sofa in the room and opens about as far. Here is the same room planned both ways.',
    related: ['murphy-bed-room-size', 'studio-apartment-layouts', 'divide-a-studio-without-walls'],
    tool: `check both states of your own room in the ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')}.`,
    body: `<h2 id="footprints">The footprints</h2>
<p>The figures below are round planning numbers used in the site's presets. Real products vary – always replace them with the dimensions of the model you are considering.</p>
${table(['', 'Queen wall bed (vertical)', 'Sofa bed (3-seat)'], [
  ['Closed depth from wall', '18 in', '36 in'],
  ['Open depth from wall', '≈ 86 in', '≈ 90 in'],
  ['Width', '≈ 66 in (cabinet)', '≈ 78 in'],
  ['Mattress', '60 × 80 in (queen)', 'varies, often smaller than a full'],
  ['Day footprint', '≈ 8 sq ft', '≈ 20 sq ft']])}
<p>The open depths are close: the difference between the two is mostly what happens in the day. The wall bed leaves 18 in; the sofa bed is a sofa, 36 in deep, plus the 18 in of legroom in front of it that the room needs anyway.</p>
<h2 id="same-room">The same room, both ways</h2>
<p>The plans below use a 15 × 15 ft (180 × 180 in) studio with the entry in the bottom-right corner. In both, a coffee table is the only “day only” piece; the rest stays in place at night.</p>
${figLayout('studio-15x15-wall-bed', 'Wall bed, day: the cabinet is 18 in deep; a loveseat and coffee table use the floor in front of it.', { state: 'day' })}
${figLayout('studio-15x15-wall-bed', 'Wall bed, night: the bed projects 68 in; the coffee table has gone, the loveseat is beside the bed, not under it.', { state: 'night' })}
${figPlan({ room: { W: 180, D: 180 }, doors: [door('S', 140, 32, 'end')], windows: [{ id: 'w', wall: 'E', offset: 40, width: 60 }], items: [it('sb', 'Sofa bed', 0, 0, 78, 36, { target: true, ext: { state: 'night', side: 'S', depth: 54 }, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] }), it('t', 'Table for 2', 112, 0, 30, 30, { target: true, zones: chair('S') }), it('sh', 'Bookshelf', 168, 110, 12, 31)] }, 'Sofa bed in the same room, night: it opens to about 90 in from the wall.', { state: 'night' })}
<p>At night the two rooms are almost identical. In the day, the wall-bed room has more free floor because there is no sofa – the loveseat in that plan is a separate, smaller piece of furniture. If you need a sofa anyway, a sofa bed is the more space-efficient choice: one piece instead of two.</p>
<h2 id="daily">What has to happen every evening</h2>
<ul><li><b>Wall bed:</b> clear the floor in front of it (coffee table, rug with furniture on it), lower the bed. Bedding stays on the mattress; a good mechanism takes seconds. The cabinet front must be free of anything that blocks it opening – a lamp or plant on the floor in front of it is the usual culprit.</li>
<li><b>Sofa bed:</b> remove seat cushions (and find a place for them), pull out the frame, add or unfold bedding. Bedding needs a storage place in the day – a cupboard or the sofa's own bedding box, if it has one.</li></ul>
<p>If the bed will be used every night, the wall bed's speed matters more than anything else. Many sofa beds end up permanently open because folding them away is too much work.</p>
<h2 id="mattress">Mattress and sleep</h2>
<p>A vertical queen wall bed takes a standard queen mattress (60 × 80 in according to ${a(CASPER, 'Casper’s size chart')}), often with a maximum thickness set by the cabinet. Sofa beds usually use a thinner mattress that folds with the frame, and many are narrower than a full. For nightly use, the wall bed wins on comfort; for a guest bed used a few nights a year, a good sofa bed is enough.</p>
<h2 id="install">Installation and renting</h2>
<p>A wall bed must be anchored to the wall or have a freestanding frame designed for that purpose. In a rental, ask the landlord before drilling, and check what the wall is made of. A sofa bed needs no installation, moves with you and is easier to sell – see ${a('/guides/moving-into-a-studio-furniture/', 'Moving into a studio')} for which pieces are worth taking along.</p>
<h2 id="cost">What each costs in space, not money</h2>
${table(['Question', 'Wall bed', 'Sofa bed'], [
  ['Free floor in the day (plan above)', '≈ 77 %', '≈ 70 % (with sofa counted)'],
  ['Free floor at night', '≈ 61 %', '≈ 60 %'],
  ['Pieces that move each evening', 'coffee table', 'coffee table, cushions'],
  ['Separate sofa needed?', 'yes, if you want one', 'no'],
  ['Moves with you easily?', 'no', 'yes']])}
<p>The free-floor percentages are computed for the plans on this page by the same code as the planner. They depend strongly on what else is in the room.</p>
<h2 id="choose">Which one to choose</h2>
<ul><li><b>Sleeping in the studio every night, wall you can anchor to:</b> wall bed.</li>
<li><b>Guest bed, or you need a sofa anyway:</b> sofa bed.</li>
<li><b>Room under about 200 sq ft:</b> wall bed with a small loveseat beside it, so the floor in front stays clear.</li>
<li><b>Very low ceilings or sloped walls:</b> a horizontal wall bed (side-tilt) needs less height but more wall length.</li></ul>
<p>Size the room around the open bed with ${a('/guides/murphy-bed-room-size/', 'Murphy bed room size')}.</p>`,
    faq: [
      ['Does a wall bed save more space than a sofa bed?', 'In the day, yes – a wall bed cabinet is about 18 in deep, a sofa about 36 in. At night both open to around 86–90 in from the wall. If you need a sofa anyway, a sofa bed saves one piece of furniture.'],
      ['How far does a queen Murphy bed stick out?', 'Typically around 86 in from the wall when open (cabinet plus bed). Check the specific model.'],
      ['Is a wall bed comfortable for every night?', 'It takes a regular mattress, often up to a stated maximum thickness, so it can be as comfortable as a normal bed. Most sofa beds use thinner folding mattresses.'],
      ['Can you put a wall bed in a rental?', 'Only with permission if it has to be anchored to the wall; some models have freestanding frames.']
    ],
    sources: [S.casper]
  },
  {
    slug: 'how-to-measure-a-room-for-furniture', group: 'Measuring', kicker: 'Printable checklist', short: 'How to measure a room',
    title: 'How to Measure a Room for Furniture (Printable Checklist)',
    h1: 'How to measure a room for furniture',
    description: 'A step-by-step method and printable checklist for measuring a room: walls, diagonals, doors and their swings, windows, radiators, outlets and ceiling height – what to measure and where.',
    lede: 'Ten minutes with a tape measure saves a returned sofa. This is the method used for every plan on this site, with a printable checklist and a sketch template.',
    related: ['will-my-sofa-fit-through-the-door', 'walkway-space-around-furniture', 'moving-into-a-studio-furniture'],
    tool: `enter the numbers in the ${a('/tools/clearance-planner/', 'Clearance Planner')} and print or export the result as SVG.`,
    howto: { name: 'Measure a room for furniture', tools: ['Steel tape measure (25 ft / 8 m)', 'Pencil and paper or this checklist', 'Second person (optional)'], steps: [['Sketch the room', 'Draw the outline roughly, with doors, windows and anything fixed.'], ['Measure each wall', 'Measure along every wall at about 3 ft height, corner to corner, between inside faces.'], ['Measure the diagonals', 'Measure corner to corner both ways to check whether the room is square.'], ['Locate doors and windows', 'Measure from the nearest corner to the edge of each opening, then its width and the door swing.'], ['Note fixed obstacles', 'Radiators, outlets, switches, vents, columns – position and depth.'], ['Measure heights', 'Ceiling height, window sill height, any soffits or beams.']] },
    body: `<h2 id="tools">What you need</h2>
<ul><li>A steel tape measure at least 25 ft (8 m) long; a laser measure is faster for long walls but cannot measure small offsets.</li>
<li>This checklist, printed, or squared paper.</li>
<li>A second person helps on walls longer than about 10 ft.</li></ul>
<h2 id="sketch">1. Sketch first, measure second</h2>
<p>Draw the room outline before measuring – roughly, not to scale. Mark every door, window, radiator, built-in cupboard and column. Number the walls clockwise from the entry door. Writing measurements on a sketch is faster and less error-prone than a list, and it shows immediately when something is missing.</p>
${figRaw(`<svg class="plan" viewBox="-30 -30 230 190" role="img" aria-label="Measuring sketch with wall numbers, diagonals and door offsets" style="--fs:6px"><rect x="0" y="0" width="170" height="130" fill="#fff" stroke="#1C2127" stroke-width="3"/><line x1="0" y1="0" x2="170" y2="130" stroke="#B4361B" stroke-dasharray="3 2"/><line x1="170" y1="0" x2="0" y2="130" stroke="#B4361B" stroke-dasharray="3 2"/><rect x="20" y="128" width="32" height="4" fill="#fff"/><path d="M20 130V98" stroke="#1C2127" stroke-width="1.4"/><path d="M20 98A32 32 0 0 1 52 130" fill="none" stroke="#1C2127" stroke-dasharray="3 2"/><rect x="168" y="40" width="4" height="48" fill="#fff" stroke="#1C2127"/>${dimLine(0, 0, 170, 0, 'wall 1', -12)}${dimLine(170, 0, 170, 130, 'wall 2', -12)}${dimLine(0, 130, 20, 130, 'offset', 10)}${dimLine(20, 130, 52, 130, 'door', 10)}<text x="85" y="62" text-anchor="middle" font-size="6" fill="#B4361B">diagonals</text></svg>`, 'Measuring sketch: walls numbered clockwise, both diagonals, and door offset from the nearest corner.')}
<h2 id="walls">2. Measure every wall, at furniture height</h2>
<p>Measure each wall from inside corner to inside corner, about 3 ft above the floor – that is where furniture meets the wall, above the skirting. Measure opposite walls separately: in older buildings they are often different by an inch or more. Write the smaller figure on the plan if furniture has to fit along the whole length.</p>
<h2 id="diagonals">3. Measure both diagonals</h2>
<p>Corner to corner, both ways. If the two diagonals are equal, the room is rectangular. If they differ by more than about an inch, the room is out of square: a wardrobe that fits snugly at one end of a wall may not fit at the other. Note it on the plan.</p>
<h2 id="doors">4. Doors: position, clear width and swing</h2>
<ul><li><b>Offset:</b> from the nearest corner to the edge of the door frame.</li>
<li><b>Clear width:</b> with the door open 90°, from the face of the door to the opposite stop – the method in ${a(ADA + '#ada-404_2_3', 'ADA 2010 §404.2.3')}. This is the figure that matters for deliveries.</li>
<li><b>Hinge side and swing direction:</b> which side the hinges are on and whether the door opens into the room. The swing claims a quarter circle with a radius equal to the leaf width.</li>
<li><b>Clear height:</b> floor or threshold to the underside of the head stop.</li></ul>
<h2 id="windows">5. Windows</h2>
<p>Offset from the nearest corner, width of the opening, sill height above the floor, and how the sash opens. A window that opens inwards needs a clear zone in front of it; a sill lower than about 30 in limits what can stand beneath it. Radiators are often under windows – measure their depth and height too.</p>
<h2 id="fixed">6. Everything that is fixed</h2>
<p>Outlets, switches, thermostats, vents, columns, pipes, built-in cupboards, the depth of skirting boards and window boards. For each, note the distance from the nearest corner and its height. Outlets matter more than people expect: a bed or wardrobe in front of the only outlet on a wall is a daily annoyance.</p>
<h2 id="heights">7. Heights</h2>
<p>Ceiling height in at least two places, beams and soffits, and the height of anything that limits tall furniture – a sloped ceiling, a window head, a light fitting. For storage walls, the reach range of 15–48 in from ${a(ADA + '#ada-308_2_1', 'ADA 2010 §308')} is a useful reference for what you can reach without bending or a stool; see ${a('/guides/vertical-storage-by-reach/', 'Vertical storage by reach')}.</p>
<h2 id="route">8. The delivery route</h2>
<p>Every door, hallway and stair between the street and the room: clear widths, hallway widths at each corner, headroom at landings. These decide what can come in at all. The ${a('/guides/will-my-sofa-fit-through-the-door/', 'sofa delivery guide')} explains the five measurements in detail.</p>
<h2 id="checklist">Printable checklist</h2>
<p>Print this page (the navigation and ads are hidden when printing) and fill in the blanks.</p>
${table(['Item', 'Measure', 'Your value'], [
  ['Wall 1 / 2 / 3 / 4', 'corner to corner at 3 ft height', '______ / ______ / ______ / ______'],
  ['Diagonals', 'corner to corner, both ways', '______ / ______'],
  ['Entry door', 'offset · clear width · height · hinge side · swing in/out', '______ · ______ · ______ · ____ · ____'],
  ['Other doors', 'same as entry', '______'],
  ['Windows', 'offset · width · sill height · opens in/out', '______ · ______ · ______ · ____'],
  ['Radiators', 'offset · width · depth · height', '______'],
  ['Outlets / switches', 'offset · height, per wall', '______'],
  ['Ceiling', 'height (two places) · beams · soffits', '______'],
  ['Delivery route', 'doors · hall widths at corners · headroom', '______']])}
<h2 id="mistakes">Common mistakes</h2>
<ul><li>Measuring at the floor, where skirting boards make the room look 1–2 in narrower – or at the ceiling, where crown moulding does.</li>
<li>Measuring the door leaf instead of the clear opening.</li>
<li>Forgetting the door swing – the most common reason a planned layout fails.</li>
<li>Rounding up. Round down to the nearest 1/4 in for space, up for furniture.</li>
<li>Measuring furniture without handles, feet and cushions.</li></ul>
<h2 id="record">Turn the sketch into a plan</h2>
<p>A sketch with numbers is enough to shop with, but a scaled plan shows problems that numbers hide. Enter the walls, doors and windows in the ${a('/tools/clearance-planner/', 'Clearance Planner')} and add the pieces you own or want to buy, each with its use zone. The planner draws the door swings and measures the narrowest point of every route, so you see at once whether a sofa that “fits” on paper leaves a walkable path. Export the drawing as SVG to print it, or as JSON to keep a copy that you can reopen later and adjust when you buy something new.</p>
<p>Keep the original measurements with the plan. When a delivery driver or a landlord asks for a dimension, the sketch with its handwritten numbers is the record that counts.</p>`,
    faq: [
      ['Where should I measure a wall?', 'At about 3 ft above the floor, corner to corner between the inside faces – above skirting boards and below any crown moulding.'],
      ['Why measure the diagonals?', 'To check whether the room is square. Unequal diagonals mean the walls are not at right angles, which matters for tight-fitting furniture.'],
      ['How do I measure a door for furniture delivery?', 'Open it to 90° and measure from the face of the door to the opposite stop. That clear width is smaller than the door leaf.'],
      ['Should I use a laser measure?', 'For long walls and ceiling heights it is faster and accurate. For offsets, door clear widths and furniture, a steel tape is easier.']
    ],
    sources: [S.ada4042, S.ada308]
  },
  {
    slug: 'small-kitchen-clearances', group: 'Kitchens and bathrooms', kicker: 'Kitchens', short: 'Small kitchen clearances',
    title: 'Small Kitchen Clearances: Aisles, Doors and Dishwashers (NKBA Guidelines)',
    h1: 'Small kitchen clearances: aisles, doors and dishwashers',
    description: 'The NKBA kitchen clearances that matter in small kitchens – 42/48 in work aisles, 36 in walkways, 21 in beside the dishwasher, seating clearances – with measured galley and studio plans.',
    lede: 'A small kitchen works or fails on a handful of distances: the aisle between counters, the space beside the dishwasher door, the route past a seated person. The National Kitchen & Bath Association publishes all of them.',
    related: ['dining-table-small-space', 'small-bathroom-layout-dimensions', 'walkway-space-around-furniture'],
    tool: `the galley kitchen opens in the ${a('/tools/clearance-planner/?layout=galley-kitchen-8x12', 'Clearance Planner')}; adjust the run lengths to yours.`,
    body: `<h2 id="source">The source</h2>
<p>All figures on this page come from the ${a(NKBA_K, 'NKBA Kitchen Planning Guidelines with Access Standards')}, published by the National Kitchen &amp; Bath Association. They are recommendations for good design, not law; the document notes where state or local codes may apply. Guideline numbers are given so you can find each one in the PDF.</p>
<h2 id="aisles">Work aisles and walkways</h2>
${rule('42 in', 'Work aisle, one cook (1067 mm)', 'NKBA Kitchen Planning Guideline 6 – 48 in (1219 mm) for multiple cooks')}
<p>A <b>work aisle</b> is the space in front of counters and appliances where someone cooks. The NKBA recommends at least 42 in for one cook and 48 in for multiple cooks, measured between counter frontage, tall cabinets and appliances (guideline 6). A <b>walkway</b> is a route through the kitchen where no one works; it should be at least 36 in wide (guideline 7). Where two walkways meet at a right angle, the access standard recommends that one of them be 42 in.</p>
${table(['Space', 'Recommended', 'Guideline'], [
  ['Work aisle, one cook', '42 in (1067 mm)', '6'],
  ['Work aisle, multiple cooks', '48 in (1219 mm)', '6'],
  ['Walkway (no work)', '36 in (914 mm)', '7'],
  ['Kitchen door clear opening', '32 in (813 mm)', '1'],
  ['Standing space beside dishwasher', '21 in (533 mm)', '13'],
  ['Behind seating, no traffic', '32 in (813 mm)', '8'],
  ['Behind seating, edge past', '36 in (914 mm)', '8a'],
  ['Behind seating, walk past', '44 in (1118 mm)', '8b']])}
<h2 id="galley">The galley</h2>
${figLayout('galley-kitchen-8x12', 'Galley kitchen 96 × 144 in: two 25 in runs leave a 46 in aisle. The dishwasher door and fridge door are drawn as zones in the aisle.')}
<p>A galley with two 25 in deep counter runs in an 8 ft (96 in) wide room leaves a 46 in aisle: above the 42 in one-cook figure, below the 48 in for two cooks. In practice that means one person cooks and a second can pass but not work back to back. A 7 ft 4 in room (88 in) gives exactly 38 in – a walkway, but tight for cooking. Below that, consider a single-wall kitchen with the other side free.</p>
<h2 id="dishwasher">Dishwasher placement</h2>
<p>Guideline 13 recommends placing the dishwasher within 36 in of the edge of the cleanup sink, and providing at least 21 in of standing space between the edge of the dishwasher and any counter, appliance or cabinet placed at a right angle to it. That second rule matters in L- and U-shaped kitchens: a dishwasher tucked right into the corner leaves you nowhere to stand while loading. The open door of a standard dishwasher projects roughly the depth of the unit into the aisle – about 2 ft – so the aisle in front of it is effectively closed while it is open.</p>
${figPlan(kitchenL(31), `Counter-example – L-shaped kitchen: the dishwasher starts ${kitchenGap(31)} in from the face of the corner run, far short of the 21 in standing space of guideline 13. The hatched standing strip runs into the counter.`, { counter: true, dims: [[25, 27, 31, 27, `${kitchenGap(31)} in`, 6]] })}
${figPlan(kitchenL(46), `Corrected: moved to start ${kitchenGap(46)} in from the corner run, the dishwasher leaves the full standing space and its open door clears the return.`, { dims: [[25, 27, 46, 27, `${kitchenGap(46)} in`, 6]] })}
<h2 id="doors">Door and appliance interference</h2>
<p>Guideline 2 says no entry door should interfere with the safe operation of appliances, and appliance doors should not interfere with one another. In a small kitchen, check three pairs: the oven door against the dishwasher door, the fridge door against the entry door, and any door against a person standing at the sink. Draw each appliance door as a zone and make sure no two overlap where both might be open at once.</p>
<h2 id="seating">Seating at a counter or table</h2>
<p>For an eating counter or a small table in the kitchen, guideline 9 gives the knee space per person: 24 in wide in all cases, and 18 in deep at a 30 in high table, 15 in deep at a 36 in counter, 12 in deep at a 42 in bar. Behind the diners, plan 32 in to a wall if nobody passes, 36 in if people edge past and 44 in if they walk past (guideline 8). For a table in the living area, see the ${a('/guides/dining-table-small-space/', 'dining table guide')}.</p>
<h2 id="studio">Kitchens inside a studio</h2>
${figLayout('studio-16x20-kitchen-wall', 'Kitchen run along the right wall of a studio: the 42 in work aisle is a no-furniture zone that people may walk through.')}
<p>In a studio, the kitchen aisle is part of the room. Mark the 42 in in front of the counter as a zone where furniture may not stand – a table, sofa back or bed end inside it will get hit by an oven door. The walkway through the room can overlap with that zone; the planner treats it as walk-through.</p>
<h2 id="access">Accessibility notes</h2>
<p>The access standard part of the guidelines, based on ICC A117.1-2009, asks for a clear floor space of 30 × 48 in at each appliance, a 60 in clearance between opposing arms of a U-shaped kitchen and a 60 in turning space. If you are planning for a wheelchair user, those figures replace the ones above.</p>
<h2 id="quick">Quick check for your kitchen</h2>
<ol><li>Measure between opposing counter fronts, handles included: 42 in or more?</li>
<li>Open the dishwasher: 21 in from its edge to the nearest cabinet at a right angle?</li>
<li>Open the oven, fridge and dishwasher one after another: does any door hit another or the entry door?</li>
<li>If people eat in the kitchen: 32–44 in behind each seat, depending on traffic?</li></ol>`,
    faq: [
      ['How wide should a kitchen aisle be?', 'The NKBA recommends at least 42 in for one cook and 48 in for multiple cooks (Kitchen Planning Guideline 6). A walkway where nobody cooks should be at least 36 in.'],
      ['How much space do you need beside a dishwasher?', 'At least 21 in of standing space between the edge of the dishwasher and any counter or appliance at a right angle to it (NKBA guideline 13).'],
      ['How wide is a galley kitchen?', 'With two 25 in counters and a 42 in aisle, about 92 in (7 ft 8 in) wall to wall; with a 48 in aisle, about 98 in.'],
      ['How much space behind a kitchen island stool?', 'NKBA guideline 8: 32 in to a wall with no traffic, 36 in to edge past, 44 in to walk past a seated person.']
    ],
    sources: [S.nkbaK]
  },
  {
    slug: 'desk-in-a-studio', group: 'Layouts', kicker: 'Work', short: 'Desk in a studio',
    title: "Desk in a Studio: 5 Spots That Don't Block the Door (Measured)",
    h1: 'Desk in a studio: 5 spots that don’t block the door',
    description: 'Five places for a desk in a studio apartment – corner, foot of the bed, behind the sofa, window wall, closet nook – each measured for chair space, door swing and walkway width.',
    lede: 'A desk needs about 32 in behind it for the chair. Where that chair zone lands decides whether the desk works in a studio. Five spots that keep it out of the door swing and the main route.',
    related: ['studio-apartment-layouts', 'divide-a-studio-without-walls', 'walkway-space-around-furniture'],
    tool: `drop the desk preset into your plan in the ${a('/tools/clearance-planner/', 'Clearance Planner')}; its chair zone is drawn automatically.`,
    body: `<h2 id="chair">The chair is the problem, not the desk</h2>
${rule('32 in', 'Chair zone behind a desk (813 mm)', 'by analogy with NKBA guideline 8: table edge to wall, no traffic')}
<p>A 42 × 22 in desk takes 6.4 sq ft. The chair that goes with it needs room to pull out and sit down: this site plans 32 in from the desk edge, the figure the ${a(NKBA_K, 'NKBA Kitchen Planning Guidelines')} give for the space between a table edge and a wall where nobody passes (guideline 8). If people walk behind the chair, that grows to 36 in to edge past and 44 in to walk past. The chair zone is therefore larger than the desk – and in a studio it is the chair zone that collides with door swings and walkways.</p>
<h2 id="spot1">1. The corner furthest from the door</h2>
${figPlan(room(192, 168, [it('bed', 'Full bed', 0, 0, 75, 53, { target: true, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true }] }), it('desk', 'Desk', 150, 0, 42, 22, { target: true, zones: chair('S') }), it('sofa', 'Sofa', 0, 132, 78, 36, { zones: [{ side: 'N', depth: 18, kind: 'legroom' }] })], [door('S', 150, 32, 'end')], [{ id: 'w', wall: 'N', offset: 90, width: 48 }]), 'Desk in the top-right corner: the chair zone ends long before the door swing.')}
<p>The default answer. In a corner the desk has walls on two sides, so the chair zone points into the room on one side only. Pick the corner diagonally opposite the door and the zone almost never meets the route. A corner desk (L-shaped) also works here, but it doubles the chair zone if you use both sides.</p>
<h2 id="spot2">2. At the foot of the bed</h2>
<p>If the bed is in a corner with its foot towards the room, a desk at the foot can share the bed's foot strip: the chair backs into the space you already keep free to walk round the bed. This is the arrangement in the ${a('/layouts/studio-20x15-queen-corner/', 'corner queen studio')}. It works when the foot strip is at least as deep as the chair zone; if it is only 24 in, the chair will touch the bed.</p>
<h2 id="spot3">3. Behind the sofa</h2>
${figPlan(room(192, 168, [it('sofa', 'Sofa', 57, 74, 78, 36, { zones: [{ side: 'N', depth: 18, kind: 'legroom' }] }), it('desk', 'Desk', 75, 110, 42, 22, { target: true, zones: chair('S'), zoneIgnore: [] }), it('tv', 'TV unit', 68, 0, 55, 16), it('bed', 'Full bed', 139, 93, 53, 75, { target: true })], [door('W', 120, 32, 'end')]), 'Desk against the back of a floating sofa: the desk faces away from the TV and its chair zone points to the free wall.')}
<p>A sofa that floats in the middle of the room has a back that is otherwise wasted. A narrow desk (18–22 in deep) against it doubles as a divider between living and sleeping zones. The chair then sits on the far side, so check that the zone does not end in the walkway. This spot needs a room at least about 13 ft deep in that direction: sofa 36 in + desk 22 in + chair 32 in + legroom 18 in + TV unit 16 in + walkway.</p>
<h2 id="spot4">4. The window wall</h2>
<p>Daylight from the side or front is ideal for a desk, and a window wall often has nothing else against it. Watch three things: a radiator under the window (keep the gap its manufacturer specifies), inward-opening sashes (the desk must not block them), and glare on the screen when the window is directly behind it. A desk at right angles to the window wall often works better than one facing the glass.</p>
<h2 id="spot5">5. A closet or alcove</h2>
<p>A reach-in closet about 24 in deep and 48 in or more wide can hold a desk with the doors removed or replaced by a curtain. The chair zone then lies entirely outside in the room, so treat it like a desk against a wall. You lose the closet as storage – compensate with the ideas in ${a('/guides/entryway-storage-without-a-closet/', 'entryway storage without a closet')}.</p>
<h2 id="avoid">Spots to avoid</h2>
<ul><li><b>Beside the entry door, facing the hinge side.</b> The chair zone lands in the door swing; one of the two will hit the other every day.</li>
<li><b>In a straight walkway</b> narrower than 36 + 32 = 68 in. The chair will be in the route whenever someone sits.</li>
<li><b>Facing the bed</b> in a room under about 10 ft between them – work and sleep zones blur, and the chair hits the bed frame.</li></ul>
<h2 id="sizes">Desk sizes for small rooms</h2>
${table(['Desk', 'Footprint', 'With 32 in chair zone'], [
  ['Small desk 32 × 18 in', '4.0 sq ft', '11.1 sq ft'],
  ['Standard desk 42 × 22 in', '6.4 sq ft', '15.8 sq ft'],
  ['Large desk 60 × 30 in', '12.5 sq ft', '25.8 sq ft'],
  ['Wall-mounted fold-down 36 × 20 in', '0 sq ft folded', '13.0 sq ft open']])}
<p>The chair zone more than doubles the footprint of any desk. A wall-mounted fold-down desk is the only kind that gives the whole area back when not in use – plan it like other ${a('/guides/wall-bed-vs-sofa-bed/', 'fold-away furniture')}, in both states.</p>
<h2 id="light">Light and power</h2>
<p>A desk also needs an outlet and good light. Check where the outlets are before choosing a spot: an extension cord across a walkway is a trip hazard on the very route you are trying to keep clear. Natural light from the side – window to the left for right-handed people – avoids shadows on paper and glare on screens.</p>`,
    faq: [
      ['How much space do you need behind a desk chair?', 'About 32 in from the desk edge to a wall or obstacle if nobody walks behind you; 36–44 in if people pass. This follows the NKBA table-seating guideline.'],
      ['Where should a desk go in a studio apartment?', 'In the corner diagonally opposite the entry, at the foot of a corner bed, behind a floating sofa, on the window wall, or in a closet. Avoid placing it where the chair zone lands in the door swing.'],
      ['How deep should a desk be for a small space?', '18–22 in is enough for a laptop and a monitor arm. Each inch saved in depth adds to the walkway or the chair zone.'],
      ['Can a desk go in front of a window?', 'Yes, if it does not block an inward-opening sash or crowd a radiator. Watch for screen glare.']
    ],
    sources: [S.nkbaK]
  },
  {
    slug: 'vertical-storage-by-reach', group: 'Storage', kicker: 'Storage', short: 'Vertical storage by reach',
    title: 'Vertical Storage by Reach: What to Store at Which Height (15–48 in)',
    h1: 'Vertical storage by reach height',
    description: 'How to plan wall storage by reach: the 15–48 in reach range from the ADA Standards, what to store above and below it, shelf depths, and how much volume a typical storage wall holds in each band.',
    lede: 'Floor space is what small homes lack; wall height is what they have. But not every inch of wall is equally useful. Plan storage in three bands – below 15 in, 15–48 in, above 48 in – and put things where you will actually reach them.',
    related: ['entryway-storage-without-a-closet', 'how-to-measure-a-room-for-furniture', 'moving-into-a-studio-furniture'],
    tool: `the ${a('/tools/storage-wall/', 'Storage Wall Audit')} computes the volume in each band for your own wall.`,
    body: `<h2 id="range">The reach range</h2>
${rule('15–48 in', 'Unobstructed reach range (380–1220 mm)', 'ADA 2010 §308.2.1 (forward) and §308.3.1 (side)')}
<p>Sections 308.2.1 and 308.3.1 of the ${a(ADA + '#ada-308_2_1', '2010 ADA Standards')} set the unobstructed forward and side reach for operable parts and storage at 15 in minimum and 48 in maximum above the floor. That is a legal accessibility minimum for an <b>unobstructed</b> reach, written for people using wheelchairs. Over an obstruction the limits drop: 44 in for a forward reach deeper than 20 in (§308.2.2), 46 in for a side reach deeper than 10 in (§308.3.2). This guide uses 15–48 in as a <b>planning band</b>, not as a promise that everything inside it is easy to reach for everyone: a deep shelf, a counter in front of a cabinet or a person's own height and mobility change the real reach. Above 48 in, most standing adults still reach – less comfortably, and not over a deep counter or shelf. Below 15 in, you bend or kneel.</p>
${figElev({ W: 120, H: 96 }, [{ id: 'a', label: 'Bookcase', x: 0, w: 31, bottom: 0, top: 79, depth: 11, shelves: [15, 30, 45, 60] }, { id: 'b', label: 'Bench', x: 36, w: 36, bottom: 0, top: 18, depth: 14, shelves: [8] }, { id: 'c', label: 'Shelf', x: 40, w: 30, bottom: 66, top: 76, depth: 10, shelves: [] }, { id: 'd', label: 'Cabinet', x: 80, w: 36, bottom: 0, top: 84, depth: 16, shelves: [16, 32, 48, 64] }], 'Storage wall, 120 in wide and 96 in high. The yellow band is the 15–48 in reach range.')}
<h2 id="bands">What goes in each band</h2>
${table(['Band', 'Height', 'Store here'], [
  ['High', 'above 48 in', 'seasonal clothing, suitcases, spare bedding, archive boxes, things used monthly or less'],
  ['Everyday', '15–48 in', 'daily clothes, shoes in use, keys and bags, kitchen staples, books you read, chargers'],
  ['Low', 'below 15 in', 'heavy items (tools, drinks), shoes, baskets, things children use']])}
<p>The principle is frequency: the more often you use something, the closer it should be to the middle of the everyday band – roughly between hip and shoulder height. Heavy things go low regardless of frequency, because lifting them from above shoulder height is where accidents happen.</p>
<h2 id="volume">How much volume is in each band?</h2>
<p>For the example wall above, the audit tool computes the gross volume of each unit and splits it by height at 15 and 48 in. The result is volume per height band, not proof of reach: it does not check how deep the shelf is, what stands in front of it or whether the back of a deep shelf can be reached.</p>
${table(['Band', 'Approx. volume', 'Share'], [
  ['Above 48 in', '≈ 19.9 cu ft', '≈ 39 %'],
  ['15–48 in', '≈ 18.4 cu ft', '≈ 36 %'],
  ['Below 15 in', '≈ 12.3 cu ft', '≈ 24 %']])}
<p>Two lessons from such audits: tall units put a large share of their volume – here almost two-fifths – above 48 in, and the everyday band holds only about a third, even on a wall that looks full. If most of your daily things do not fit in the everyday band, the answer is usually wider rather than taller storage – another 24 in of wall at 15–48 in adds more useful volume than a cabinet extension to the ceiling.</p>
<h2 id="depth">Shelf depth</h2>
<p>Depth matters more than people expect. A 16 in deep shelf above 48 in is hard to use: you cannot see or reach what is at the back. Common depths:</p>
<ul><li><b>Books, folded shirts:</b> 10–12 in.</li>
<li><b>Shoes:</b> 12–14 in.</li>
<li><b>Hanging clothes:</b> about 24 in for a rail with hangers.</li>
<li><b>Boxes and bins:</b> match the box; standard archive boxes are around 12–15 in deep.</li>
<li><b>Above 48 in:</b> keep it shallow, or use pull-down rails or boxes with labeled fronts.</li></ul>
<p>Depth also costs floor. A 16 in deep cabinet on a walkway takes 4 in more than a 12 in bookcase; see the ${a('/guides/walkway-space-around-furniture/', 'walkway guide')}.</p>
<h2 id="shelves">Spacing shelves</h2>
<p>Put a shelf at about 48 in where possible – the top of the everyday band – and divide the band below it to match what you store: 11–13 in for books and shoes, 14–16 in for folded clothes. Space above 48 in in bigger steps for boxes. If you are building a unit with equal compartments, the divider calculator in the ${a('/tools/storage-wall/', 'Storage Wall Audit')} gives clear widths and marking positions.</p>
<h2 id="doors">Doors, drawers and the floor in front</h2>
<p>Cupboard doors and drawers need space in front of them: about one door leaf or one drawer depth plus standing room. A wall of cabinets along a 36 in walkway is fine with closed doors and blocks the route the moment one is open. Sliding doors and open shelves avoid that – at the cost of dust and visual clutter.</p>
<h2 id="safety">Safety</h2>
<ul><li>Anchor every tall unit to the wall; a loaded bookcase can tip when a drawer or door is pulled.</li>
<li>Keep heavy items low, especially above beds and desks.</li>
<li>Use a stable step stool for the high band rather than a chair.</li></ul>
<h2 id="rooms">Room by room</h2>
<p><b>Kitchen:</b> upper cabinets usually start around 18 in above the counter, so their lowest shelf sits at about 54 in – above the reach band. Keep everyday plates and glasses on the lowest upper shelf or in drawers below the counter, and use the top shelves for rarely used dishes. <b>Bedroom:</b> a wardrobe rail at about 64–68 in is above 48 in by design, because clothes hang down from it; folded clothes belong in the band below. <b>Entry:</b> keys, bags and the dog lead go between 15 and 48 in, coats higher – see ${a('/guides/entryway-storage-without-a-closet/', 'entryway storage')}. <b>Bathroom:</b> daily toiletries at basin height, spare stock above or below.</p>
<h2 id="audit">A quick audit of your own walls</h2>
<p>Take one wall at a time. List what is on each shelf and how often you use it: daily, weekly, monthly, seasonally. Anything daily that sits above 48 in or below 15 in is a candidate to move. Anything seasonal at chest height is taking the best space. Most people find that a single reshuffle frees a whole shelf in the everyday band – without buying anything.</p>`,
    faq: [
      ['What is the best height for everyday storage?', 'Between 15 and 48 in above the floor – the unobstructed reach range in ADA 2010 §308.2.1 and §308.3.1. Put the most-used items around hip to shoulder height.'],
      ['How deep should shelves be?', '10–12 in for books and folded shirts, 12–14 in for shoes, about 24 in for hanging clothes. Keep high shelves shallow so you can see and reach the back.'],
      ['Is storage up to the ceiling worth it?', 'Yes for rarely used things, but it holds less useful volume than it seems. If daily items do not fit, add width at reach height first.'],
      ['How do I calculate shelf volume?', 'Width × depth × height of each unit, divided by 1728 for cubic feet. The Storage Wall Audit does this per reach band.']
    ],
    sources: [S.ada308]
  },
  {
    slug: 'divide-a-studio-without-walls', group: 'Layouts', kicker: 'Layouts', short: 'Divide a studio without walls',
    title: 'How to Divide a Studio Without Walls: 6 Dividers Measured',
    h1: 'How to divide a studio without walls',
    description: 'Six ways to divide a studio without building walls – bookcase, sofa back, curtain, rug, raised platform, open shelf – with the floor space each takes and how to keep the walkway at 36 in.',
    lede: 'A studio feels bigger when sleeping, living and working each have their own zone. You do not need walls for that – but every divider takes floor, and some take the walkway with it.',
    related: ['studio-apartment-layouts', 'desk-in-a-studio', 'rug-size-small-living-room'],
    tool: `try a divider in the ${a('/tools/clearance-planner/', 'Clearance Planner')} – a bookshelf preset rotated 90° works as a half wall.`,
    body: `<h2 id="why">What a divider has to do</h2>
<p>A divider separates zones visually and, ideally, keeps the bed out of sight from the door. It should not block daylight, ventilation or the route from the entry to the bed and bathroom. Measured against those three tests, the six common options differ a lot.</p>
${table(['Divider', 'Floor it takes', 'Blocks view', 'Keeps light'], [
  ['Open bookcase (12 in deep)', '1 sq ft per 12 in length', 'partly', 'yes'],
  ['Closed bookcase / wardrobe', '1–2 sq ft per 12 in', 'yes', 'no'],
  ['Sofa with its back to the bed', 'already there', 'low', 'yes'],
  ['Curtain on a ceiling track', '≈ 0', 'yes, when closed', 'when open'],
  ['Rug', '0', 'no', 'yes'],
  ['Raised platform', 'whole zone', 'no', 'yes']])}
<h2 id="bookcase">1. A bookcase at right angles to the wall</h2>
${figLayout('studio-18x14-full-alcove', 'A 12 × 62 in bookcase standing out from the top wall creates a sleeping alcove for a full bed.')}
<p>The most effective divider: a 12 in deep bookcase standing out from the wall creates an alcove and holds books on both sides. Open shelving keeps light; a back panel on the lower half and open shelves above is a good compromise. Make sure the opening between the end of the bookcase and the opposite wall or furniture stays at least 36 in wide – the walkway width from ${a(ADA + '#ada-403_5_1', 'ADA 2010 §403.5.1')} – and anchor the bookcase to the ceiling or wall. A freestanding tall bookcase standing on its narrow side tips easily.</p>
<h2 id="sofa">2. The sofa back</h2>
<p>A sofa that floats with its back to the bed costs no extra floor: you need the sofa anyway. It divides at seat-back height, about 30–34 in, which separates zones without blocking anything. A narrow console table or desk against the back adds storage – see ${a('/guides/desk-in-a-studio/', 'desk in a studio')}. The cost: the walkway now runs around the sofa on at least one side, and the sofa's legroom zone has to stay clear in front.</p>
<h2 id="curtain">3. A curtain on a ceiling track</h2>
<p>A curtain is the only divider that takes almost no floor and disappears in the day. Mount the track on the ceiling, at least a few inches from the bed so the curtain does not drag over it, and leave the end towards the walkway open or tied back. In a rental, tension rods or a track on removable fixings avoid drilling. A heavy, lined curtain also blocks light from a desk lamp or a TV.</p>
<h2 id="rug">4. Rugs</h2>
<p>A rug divides by suggestion: the living zone is the area on the rug. It takes no floor and costs no walkway, which is why rugs are the first tool in very small studios. Size matters – a rug that is too small makes a zone look smaller. The ${a('/guides/rug-size-small-living-room/', 'rug size guide')} has measured examples.</p>
<h2 id="platform">5. A raised platform</h2>
<p>A platform 12–18 in high for the bed or the living zone separates zones strongly and can hold drawers underneath. It takes the whole floor of its zone and adds a step to every route, which matters at night. It also changes the height of everything: a window sill, an outlet, the ceiling above the bed. Building one in a rental usually needs permission.</p>
<h2 id="shelf">6. Low open shelving</h2>
<p>A row of low cubes (about 30–36 in high) divides like a sofa back and holds books, plants and baskets on both sides. It is lighter than a full-height bookcase and safer, but still needs the 36 in opening at its end.</p>
<h2 id="rules">Three rules for any divider</h2>
<ol><li><b>Never across the only route.</b> The walkway from the door to the bed, kitchen and bathroom must go around the divider with at least 36 in.</li>
<li><b>Not in front of the window</b> unless it is open shelving or a curtain that is pulled back in the day.</li>
<li><b>Mind the door swing.</b> A divider within the entry door's arc will be hit every day; keep it at least the leaf width away from the hinge.</li></ol>
<h2 id="measure">Measuring for a divider</h2>
<p>Before you buy, draw the room and mark: the door swing, the bed with its 24 in bedside strip, the walkway from the entry, and the window. The divider can go anywhere outside those zones. For a bookcase, the length you can use is the distance from the wall to the start of the walkway; for a curtain, the length of the bed plus its strip.</p>`,
    faq: [
      ['How do I divide a studio apartment cheaply?', 'A rug and a curtain on a ceiling track cost little, take almost no floor and need no tools beyond a drill or tension rods. A sofa placed with its back to the bed is free.'],
      ['Can I use a bookcase as a room divider?', 'Yes, ideally an open-back bookcase about 12 in deep, anchored to the wall or ceiling. Keep at least 36 in between its end and the next obstacle.'],
      ['How do I hide a bed in a studio?', 'Put the bed in the corner furthest from the door and screen it with a bookcase at right angles to the wall, or a ceiling-mounted curtain.'],
      ['Do room dividers make a studio feel smaller?', 'Tall, solid dividers can. Low or open dividers and curtains keep sight lines and light and usually make the room feel larger by giving each zone its own edge.']
    ],
    sources: [S.ada4035]
  }
];
