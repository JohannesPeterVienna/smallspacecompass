import { figPlan, figLayout, figRaw, room, door, rule, table, a, S, ADA, NKBA_K, CASPER, SILENT, bs, chair, dimLine } from './common.mjs';
const it = (id, label, x, y, w, d, extra = {}) => ({ id, label, x, y, w, d, ...extra });

export const A1 = [
  {
    slug: 'walkway-space-around-furniture', group: 'Clearances', kicker: 'Clearances', short: 'Walkway space around furniture',
    title: 'How Much Walkway Space Do You Need Around Furniture? (Measured)',
    h1: 'How much walkway space do you need around furniture?',
    description: 'Walkway widths with sources: 36 in (915 mm) for a main route, where a 32 in pinch is acceptable, and the extra space chairs, drawers and doors take – with measured plans.',
    lede: 'Plan main routes at 36 in (915 mm) clear, allow short pinches down to 32 in, and add the space that chairs, drawers and doors need before you measure what is left. Here is where those numbers come from and how to apply them in a small room.',
    related: ['space-between-bed-and-wall', 'dining-table-small-space', 'small-kitchen-clearances'],
    tool: `the ${a('/tools/clearance-planner/', 'Clearance Planner')} finds the narrowest point between your door and every bed, desk and window automatically.`,
    body: `<h2 id="short">The short answer</h2>
${rule('36 in', 'Main walkway, clear width (915 mm)', 'ADA 2010 §403.5.1 – walking surfaces; also NKBA kitchen guideline 7')}
<p>A walkway that people use every day – from the front door to the kitchen, from the bedroom door to the bed – should be at least 36 in (915 mm) wide between the nearest surfaces. That figure is the minimum clear width of walking surfaces on accessible routes in section 403.5.1 of the ${a('https://www.access-board.gov/ada/chapter/ch04/', '2010 ADA Standards for Accessible Design')}. Private homes are usually not required to follow those standards, and meeting this one width is not a full accessibility assessment, but 36 in is the most widely used published number for a comfortable one-person route, and the ${a(NKBA_K, 'NKBA Kitchen Planning Guidelines')} use the same figure for kitchen walkways (guideline 7).</p>
<p>The same ADA section allows the route to narrow to 32 in (815 mm) for a length of no more than 24 in, provided those pinch points are separated by at least 48 in of full 36 in width. In a home that translates into a useful rule: squeezing past the corner of a nightstand or a door frame is fine; a 32 in corridor along the full length of a sofa is not.</p>
<h2 id="what-counts">Measure the gap that is actually left</h2>
<p>Most walkway problems in small rooms come from measuring the wrong thing. The gap between a sofa and a coffee table is not the gap between their feet; it is the distance between the front of the seat cushion and the table edge – minus the space someone's legs take while seated. Before you measure a walkway, subtract every <em>use zone</em> that sits next to it:</p>
${table(['Next to the walkway', 'Space it takes', 'Basis'], [
  ['Desk or dining chair', '32 in from table edge', 'NKBA guideline 8 (no traffic behind)'],
  ['Open dresser drawer', '≈ 18 in', 'drawer depth + standing room (assumption)'],
  ['Swinging door', 'leaf width as a quarter circle', 'geometry of the door'],
  ['Bed you make every day', '≈ 24 in strip', 'site assumption, see bed guide'],
  ['Sofa legroom', '≈ 18 in', 'site assumption']])}
<p>Only what remains after those zones counts as walkway. The plan below shows the effect: two arrangements of the same 12 × 12 ft room with the same furniture. In the first, the desk chair zone pushes into the route between door and bed. In the second, the desk is turned so that the chair backs into the corner and the route keeps its width.</p>
${figPlan(room(144, 144, [it('bed', 'Queen bed', 84, 0, 60, 80, { target: true, zones: bs(24, ['W']) }), it('desk', 'Desk', 0, 54, 22, 42, { target: true, zones: chair('E') }), it('dr', 'Dresser', 0, 0, 40, 18)], [door('S', 8, 32)]), 'Desk on the left wall: its 32 in chair zone narrows the route from the door to the bed. The marker shows the measured pinch.')}
${figPlan(room(144, 144, [it('bed', 'Queen bed', 84, 0, 60, 80, { target: true, zones: bs(24, ['W']) }), it('desk', 'Desk', 0, 0, 42, 22, { target: true, zones: chair('S') }), it('dr', 'Dresser', 104, 126, 40, 18, { zones: [{ side: 'N', depth: 18, kind: 'drawer' }] })], [door('S', 8, 32)]), 'Desk moved into the corner, dresser to the bottom wall: the same pieces leave a wider route to the bed.')}
<h2 id="turns">Corners and turns</h2>
<p>A route that turns around the end of a bed or a kitchen island needs more width than a straight one. ADA §403.5.2 asks for 42 in approaching and leaving a 180° turn around an element narrower than 48 in, and 48 in at the turn itself. The NKBA access standard recommends that where two kitchen walkways meet at a right angle, one of them should be 42 in wide. You do not need to apply these figures literally in a studio, but they explain a common experience: the corner of a bed on the way to the window always feels tighter than the same width along a straight wall.</p>
<h2 id="two-people">When two people need to pass</h2>
<p>The 36 in figure assumes one person walking. Where people regularly pass each other or work back to back, plan more. The NKBA guidelines are the best published reference for homes: 42 in for a one-cook kitchen work aisle, 48 in for multiple cooks (guideline 6), and 44 in to walk past someone seated at a table (guideline 8b). Behind a dining chair where people only edge past sideways, NKBA allows 36 in.</p>
${table(['Situation', 'Plan for', 'Source'], [
  ['One person, main route', '36 in (915 mm)', 'ADA §403.5.1'],
  ['Short pinch (max. 24 in long)', '32 in (815 mm)', 'ADA §403.5.1 exception'],
  ['Edge past a seated person', '36 in from table edge', 'NKBA guideline 8a'],
  ['Walk past a seated person', '44 in from table edge', 'NKBA guideline 8b'],
  ['Kitchen work aisle, one cook', '42 in (1067 mm)', 'NKBA guideline 6'],
  ['Kitchen work aisle, two cooks', '48 in (1219 mm)', 'NKBA guideline 6'],
  ['Wheelchair turning circle', '60 in (1525 mm) diameter', 'ADA §304.3.1']])}
<h2 id="how-to-measure">How to measure an existing walkway</h2>
<ol><li>Walk the route you use most – door to bed, door to desk, bed to bathroom – and note where you turn your shoulders or slow down. Those are your pinch points.</li>
<li>At each one, measure between the two nearest surfaces at hip height, not at the floor: sofa arms, table tops and open drawers stick out further than legs and plinths.</li>
<li>Open every door and drawer that faces the route and measure again.</li>
<li>Compare with the table above. If a pinch is shorter than about two feet and only one, it is usually acceptable.</li></ol>
<h2 id="fixes">Fixes that gain the most width</h2>
<ul><li><b>Turn the chair, not the desk.</b> Rotating a desk so that the chair zone points into a corner or along a wall frees the full 32 in that a chair needs.</li>
<li><b>Change the door swing.</b> Re-hanging a door to swing against the nearest wall, or replacing it with a pocket or barn door, can free a quarter circle of up to 36 in radius.</li>
<li><b>Shallower pieces along routes.</b> A 12 in deep bookcase instead of a 16 in dresser along a corridor gains 4 in where it matters most.</li>
<li><b>Round tables at pinch points.</b> A round table loses its corners exactly where people walk past.</li>
<li><b>Lift storage off the floor.</b> Wall-mounted shelves above 34 in or so keep the floor clear at hip height – check the ${a('/guides/vertical-storage-by-reach/', 'reach guide')} for the heights you can still use.</li></ul>
<p>In very small studios it is sometimes impossible to keep every route at 36 in. Then prioritize: the route from the entry to the bed and to the bathroom should be the widest, because you use it at night and in a hurry. Routes to a window or a rarely used cupboard can be tighter.</p>`,
    faq: [
      ['What is the minimum walkway width in a home?', 'There is no single legal minimum for walkways between furniture in private homes. The most widely used published figure is 36 in (915 mm), the clear width of walking surfaces in the 2010 ADA Standards (§403.5.1). Short pinches down to 32 in for up to 24 in of length are allowed there.'],
      ['How much space should be between a sofa and a coffee table?', 'Enough for legs and for walking past: this site uses an 18 in legroom zone in front of the seat as a planning assumption. If the gap is also a walkway, it needs the legroom plus the walkway width.'],
      ['How much space do you need behind a dining chair?', 'The NKBA Kitchen Planning Guidelines recommend 32 in from table edge to wall where no one passes, 36 in to edge past a seated person and 44 in to walk past (guideline 8).'],
      ['Is 30 inches enough for a walkway?', 'For a short squeeze past a corner, it is tight but usable. For a main route it is below both the 36 in ADA width and the 32 in pinch allowance, so most people will turn sideways.']
    ],
    sources: [S.ada4035, S.ada4035b, S.ada304, S.nkbaK]
  },
  {
    slug: 'will-my-sofa-fit-through-the-door', group: 'Moving and deliveries', kicker: 'Deliveries', short: 'Will my sofa fit through the door?',
    title: 'Will My Sofa Fit Through the Door? 5 Measurements to Take First',
    h1: 'Will my sofa fit through the door? 5 measurements',
    description: 'The five measurements that decide whether a sofa fits through a door and around a hallway corner – door clear width, height, diagonal depth, hall widths and headroom – with worked examples.',
    lede: 'Most sofas that get stuck do not fail at the front door; they fail at the first hallway corner. Five measurements tell you in advance whether a sofa will make it, and which way round to carry it.',
    related: ['moving-into-a-studio-furniture', 'how-to-measure-a-room-for-furniture', 'murphy-bed-room-size'],
    tool: `enter the five measurements in ${a('/tools/will-it-fit/', 'Will It Fit?')} – it tests every orientation, tilting included, and sketches the move.`,
    howto: { name: 'Measure a doorway and hallway for sofa delivery', tools: ['Tape measure', 'Straightedge'], steps: [['Measure the door clear width', 'Open the door to 90 degrees and measure from the face of the door to the opposite stop.'], ['Measure the door clear height', 'Measure from the floor or threshold to the underside of the head stop.'], ['Measure the sofa diagonal depth', 'From the side, measure from the top back corner of the frame to the front edge of the seat.'], ['Measure the hallway widths at the corner', 'Measure wall to wall before and after the turn, including radiators and trim.'], ['Measure the headroom at the corner', 'Measure floor to ceiling at the turn, including lights and soffits.']] },
    body: `<h2 id="why">Why sofas get stuck</h2>
<p>A sofa is a long box with a short cross-section. Through a straight doorway only the cross-section matters – depth and height – because the length is simply carried through. In a hallway that turns 90°, the length suddenly matters, because the sofa has to swing round the corner. That is why a sofa that passes the front door can still be stuck one meter later. The five measurements below cover both cases.</p>
<h2 id="m1">1. The door's clear width</h2>
${rule('32 in', 'Minimum door clear width (815 mm)', 'ADA 2010 §404.2.3 – measured face of door to stop, door open 90°')}
<p>Do not measure the door leaf. Open the door to 90° and measure from the face of the open door to the stop on the opposite jamb. This is how §404.2.3 of the ${a(ADA + '#ada-404_2_3', '2010 ADA Standards')} defines the clear width of a doorway, and it is usually 2 in or more less than the leaf width because the open door and its hinges take space. Many interior doors in older homes are narrower than 32 in. If you can lift the door off its hinges, you gain the thickness of the leaf and the hinge knuckles.</p>
<h2 id="m2">2. The door's clear height</h2>
<p>From the floor – or the top of the threshold – to the underside of the head stop. Standard doors are often around 80 in high, but measure yours: older buildings, basements and doors with closers vary. Height matters when the sofa has to be stood on end.</p>
<h2 id="m3">3. The sofa's depth, height and diagonal depth</h2>
<p>Take the overall depth (front of arm to back), overall height (floor to top of back) and the <b>diagonal depth</b>: from the side, the straight distance from the top back corner of the frame to the front edge of the seat. A sofa with a sloping back can be tipped onto its back or end and “rolled” through a doorway that is narrower than its depth, provided the diagonal depth is smaller than the door's clear width. Furniture retailers often list this figure; otherwise use a straightedge across the side profile.</p>
${figRaw(`<svg class="plan" viewBox="-20 -20 140 90" role="img" aria-label="Side profile of a sofa with depth, height and diagonal depth" style="--fs:5px"><path d="M10 50V18h10V8h16v10h-6V38h52V28h14v22z" fill="#E3E5DF" stroke="#1C2127" stroke-width="1.2"/><line x1="36" y1="8" x2="96" y2="38" stroke="#B4361B" stroke-width="1.4" stroke-dasharray="3 2"/><text x="72" y="18" font-size="5" fill="#B4361B">diagonal depth</text>${dimLine(10, 50, 96, 50, 'depth', 9)}${dimLine(10, 50, 10, 8, 'height', 8)}</svg>`, 'Side profile of a sofa: depth, height and the diagonal depth from the top of the back to the front of the seat.')}
<h2 id="m4">4. Hallway widths at every corner</h2>
<p>Measure wall to wall before and after each turn, at the narrowest point – radiators, skirting, light switches and door frames count. The longest flat rectangle of width <span class="mono">w</span> that can turn a right-angled corner between halls of width <span class="mono">a</span> and <span class="mono">b</span> follows from a classic geometry problem: it is the minimum of <span class="mono">a/cos θ + b/sin θ − w(tan θ + cot θ)</span> over all angles θ. Some worked values, computed with the same code as the delivery tool:</p>
${table(['Hall widths', 'Item width (carried flat)', 'Longest length that turns'], [
  ['36 + 36 in', '24 in', '53.8 in'],
  ['36 + 36 in', '30 in', '41.8 in'],
  ['42 + 36 in', '34 in', '41.7 in'],
  ['48 + 48 in', '34 in', '67.8 in']])}
<p>The numbers drop quickly as the item gets wider: in two 36 in halls, a 24 in wide box can be up to about 54 in long; a 30 in wide one only about 42 in. That is why a sofa is usually carried on its side or on its end through corners – it reduces the width that has to turn.</p>
<h2 id="m5">5. Headroom at the corner</h2>
<p>If the sofa will not turn flat, movers tip one end up. Raising the long axis shortens the sofa's footprint, but only as far as the ceiling allows. Measure floor to ceiling at the corner, and note light fittings, smoke alarms and soffits. On stairs, measure the headroom at the landing where the turn happens; it is often lower than in the hallway.</p>
<h2 id="example">Worked example</h2>
<p>A three-seat sofa measures 84 in long, 37 in deep and 34 in high, with a diagonal depth of 31 in. The apartment door has a 32 in clear width and 80 in clear height; the hallway behind it turns 90° with 36 in on both sides and a 96 in ceiling.</p>
<ul><li><b>Door:</b> the sofa's depth (37 in) and height (34 in) are both wider than the door, so it will not go through upright or on its back. Tipped on its back and rolled through, the 31 in diagonal depth clears the 32 in opening with 1 in to spare – tight but possible.</li>
<li><b>Corner:</b> carried on its back or side, the cross-section is 34 × 37 in, which leaves almost nothing to swing in a 36 in hall. Stood on end, its 37 × 34 in footprint just misses the 36 × 36 in corner square by 1 in. Result: it fails at the corner by about an inch even though it passes the door.</li></ul>
<p>The fix is to ask the retailer before ordering: legs and back cushions that come off, arms that unbolt, or a modular design. A 2 in difference in depth would have been enough here.</p>
<h2 id="tips">Before delivery day</h2>
<ul><li>Take the measurements yourself and send them to the retailer; ask for their minimum doorway figure for the exact model.</li>
<li>Remove doors from hinges along the route, and remove door stops if the gain matters.</li>
<li>Protect corners and the floor; a sofa that “just fits” is often carried at an awkward angle.</li>
<li>For stairs with winders or spiral stairs, no 2D check is reliable – ask for a site survey.</li></ul>`,
    faq: [
      ['How wide does a door need to be for a sofa?', 'Wider than either the sofa’s depth or height, or – for a sofa tipped on its back or end – wider than its diagonal depth. Measure the door’s clear width with the door open 90°, not the leaf.'],
      ['What is the diagonal depth of a sofa?', 'The straight-line distance, seen from the side, from the top back corner of the frame to the front edge of the seat. It decides whether a sofa can be tipped through a narrow doorway.'],
      ['Can you take a door off to fit a sofa?', 'Usually yes. Lifting the leaf off its hinges adds roughly the thickness of the door and the hinge knuckles to the clear width; removing the stops can add a little more.'],
      ['Why did my sofa fit through the door but not the hallway?', 'Through a straight doorway only the cross-section matters. Around a corner the sofa’s length has to swing, and in narrow halls the maximum length that can turn falls quickly as the item gets wider.']
    ],
    sources: [S.ada4042]
  },
  {
    slug: 'studio-apartment-layouts', group: 'Layouts', kicker: 'Layouts', short: 'Studio apartment layouts',
    title: 'Studio Apartment Layouts: 6 Measured Floor Plans (with Walkway Widths)',
    h1: 'Studio apartment layouts: 6 measured floor plans',
    description: 'Six studio floor plans drawn to the inch – corner bed, alcove, long narrow room, wall bed, kitchen wall and sofa bed – with door swings, chair zones and the measured width of every route.',
    lede: 'Six common studio shapes, each drawn to the inch with door swings, chair and drawer zones and the narrowest point between the entry and the bed, desk and window. Open any of them in the planner and change the walls to match yours.',
    related: ['divide-a-studio-without-walls', 'desk-in-a-studio', 'moving-into-a-studio-furniture'],
    tool: `every plan opens in the ${a('/tools/clearance-planner/', 'Clearance Planner')} or the ${a('/tools/day-night-swap/', 'Day/Night Floor Swap')} from its layout page.`,
    body: `<h2 id="how">How these plans were made</h2>
<p>Every plan uses real furniture sizes: U.S. mattress sizes from ${a(CASPER, 'Casper’s size chart')} (full 53 × 75 in, queen 60 × 80 in), and common retail sizes for the rest, which you can change in the planner. Each piece carries its use zone – 32 in for a chair at a desk or table, 18 in for drawers, 24 in beside a bed – and every door is drawn with its swing. The yellow line is the widest route from the entry to each target; the marker is where it is narrowest, measured. The table on each layout page compares those widths with the 36 in walking-surface width from ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')}.</p>
<h2 id="corner">1. Queen bed in the far corner (20 × 15 ft)</h2>
${figLayout('studio-20x15-queen-corner', 'Corner queen studio, 240 × 180 in. The bed goes diagonally opposite the door; the TV unit doubles as a low divider.')}
<p>The most robust studio layout: put the bed in the corner furthest from the entry, so that the route to it crosses the living area at its edge rather than through the middle. The bed needs only one long side free in a studio; push the other against the wall and keep a 24 in strip on the open side and at the foot. The living area takes the window wall. The desk sits at the foot of the bed, chair zone pointing into the room and away from the door swing.</p>
<p><b>Works for:</b> roughly square rooms from about 250 sq ft. <b>Watch:</b> the gap between sofa legroom and TV unit – it is the first route to shrink if you buy a deeper sofa.</p>
<h2 id="alcove">2. Full bed in an alcove (18 × 14 ft)</h2>
${figLayout('studio-18x14-full-alcove', 'Alcove studio, 216 × 168 in. A 12 in deep bookcase at right angles to the wall screens the bed.')}
<p>A tall bookcase standing at right angles to the wall creates a sleeping alcove without building anything. It works best with a full bed: a queen leaves too little space between the bed and the shelf for a comfortable bedside strip. The bookcase must be anchored to the wall or ceiling.</p>
<p><b>Works for:</b> rooms where the bed can go in a corner away from the window. <b>Watch:</b> do not let the alcove block daylight; use an open-back shelf if the window is behind it. More options in ${a('/guides/divide-a-studio-without-walls/', 'How to divide a studio without walls')}.</p>
<h2 id="narrow">3. Long, narrow studio in three zones (22 × 12 ft)</h2>
${figLayout('studio-22x12-long-narrow', 'Long narrow studio, 264 × 144 in. Large pieces along the top wall, route along the bottom.')}
<p>In a narrow room, the walkway should run straight along one long wall, and the big pieces along the other. Arrange the zones in the order you use them from the door: work first, living in the middle, sleeping at the far end. Avoid deep furniture on both long walls – two 36 in deep pieces opposite each other in a 144 in room leave 72 in, which sounds generous until you add legroom and a coffee table.</p>
<p><b>Works for:</b> rooms more than about 1.6 times as long as they are wide. <b>Watch:</b> anything placed on the route side; keep it 16 in deep or less.</p>
<h2 id="wallbed">4. Queen wall bed (15 × 15 ft)</h2>
${figLayout('studio-15x15-wall-bed', 'Wall-bed studio, 180 × 180 in, night state: the coffee table is moved aside, the bed is down.', { state: 'night' })}
<p>A wall bed gives back most of the floor in the day – this plan keeps 77 % free – but only if nothing permanent stands in front of it. Place the sofa beside the bed's open footprint, not in front of it; then only a light coffee table has to move each evening. The layout page shows the day and night plans side by side.</p>
<p><b>Works for:</b> square rooms from about 200 sq ft, people who will actually fold the bed up every day. See ${a('/guides/murphy-bed-room-size/', 'Murphy bed room size')}.</p>
<h2 id="kitchen">5. Studio with a kitchen wall (16 × 20 ft)</h2>
${figLayout('studio-16x20-kitchen-wall', 'Studio with kitchen run, 192 × 240 in. The 42 in work aisle in front of the counters is kept free.')}
<p>When the kitchen is a single run of cabinets in the room, the space in front of it is a work aisle. The NKBA recommends 42 in for one cook (${a(NKBA_K, 'Kitchen Planning Guideline 6')}); treat that strip as a no-furniture zone you can walk through. The bed goes in the corner furthest from the cooking area, the dining table between them.</p>
<p><b>Works for:</b> rectangular studios with a kitchen on a long wall. <b>Watch:</b> the fridge door swing near the entry.</p>
<h2 id="sofabed">6. Sofa bed, no separate bed (24 × 14 ft)</h2>
${figLayout('studio-24x14-sofa-bed', 'Sofa-bed studio, 288 × 168 in, night state: the coffee table moves away, the bed opens towards the room.', { state: 'night' })}
<p>The cheapest way to free floor space: one piece of furniture for sitting and sleeping. The trade-off is time and bedding storage, not space – a sofa bed opens about as far as a wall bed. The window route is the tight one in this plan, which the layout page shows in its route table.</p>
<p><b>Works for:</b> wide rooms where the sofa can open without hitting the dining or desk area. Compare in ${a('/guides/wall-bed-vs-sofa-bed/', 'Wall bed vs. sofa bed')}.</p>
<h2 id="choose">Which layout fits your room?</h2>
${table(['Room shape', 'Start with', 'Key measurement'], [
  ['Square, 250 sq ft +', 'Corner queen (1)', 'bed corner opposite the door'],
  ['Square, under 230 sq ft', 'Wall bed (4)', '86 in clear in front of the wall bed'],
  ['Long and narrow', 'Three zones (3)', 'one straight walkway ≥ 36 in'],
  ['Kitchen on a long wall', 'Kitchen wall (5)', '42 in work aisle'],
  ['Wide, few walls free', 'Sofa bed (6)', 'open depth of the sofa bed'],
  ['Corner away from window', 'Alcove (2)', '24 in strip beside the bed']])}
<p>All six are on the ${a('/layouts/', 'Measured Layout Library')} page together with two 12 × 10 ft bedrooms and a galley kitchen.</p>`,
    faq: [
      ['What is the best layout for a studio apartment?', 'For most roughly square studios: bed in the corner furthest from the entry, living area along the window wall, and the desk where its chair does not cross the route from the door. Long narrow studios work better as three zones in a row.'],
      ['How big is a typical studio apartment?', 'The plans here range from 225 to 336 sq ft (about 21 to 31 m²). The layout principles apply to smaller rooms as well, but you may need fold-away furniture below about 220 sq ft.'],
      ['Can I fit a queen bed in a studio?', 'Usually yes – a queen is 60 × 80 in. What matters is the space around it: with one long side against a wall you need a 24 in strip on the other side and at the foot, plus the walkway.'],
      ['Can I use these plans for my own apartment?', 'Yes. Open the layout in the planner, enter your own wall lengths and door position, and move the pieces until every route is wide enough.']
    ],
    sources: [S.ada4035, S.nkbaK, S.casper]
  },
  {
    slug: '12x10-bedroom-layout', group: 'Bedrooms', kicker: 'Bedrooms', short: '12×10 bedroom layouts',
    title: '12x10 Bedroom Layout Ideas: Queen or Full Bed, Measured',
    h1: '12 × 10 bedroom layout ideas (queen or full)',
    description: 'Measured 12 × 10 ft bedroom layouts with a queen or full bed: which wall the bed goes on, how much space is left at the foot and sides, where the dresser and desk fit, and what the door swing costs.',
    lede: 'A 12 × 10 ft room is 120 sq ft – big enough for a queen bed with walking space on both sides, or a full bed and a desk. The deciding question is which wall the headboard goes against.',
    related: ['full-vs-queen-bed-small-bedroom', 'space-between-bed-and-wall', 'walkway-space-around-furniture'],
    tool: `try your own door position in the ${a('/tools/clearance-planner/?layout=bedroom-12x10-queen', 'Clearance Planner')} – the 12 × 10 layouts open directly.`,
    body: `<h2 id="numbers">The numbers that decide the layout</h2>
<p>The room is 144 × 120 in (3.66 × 3.05 m). A U.S. queen mattress is 60 × 80 in and a full is 53 × 75 in, according to ${a(CASPER, 'Casper’s size chart')}; bed frames typically add a little to each dimension, so measure yours. Subtracting the bed from the room gives what is left for walking and other furniture:</p>
${table(['Bed and orientation', 'Left across the room', 'Left at the foot'], [
  ['Queen, head on 10 ft wall', '144 − 80 = 64 in at the foot', '120 − 60 = 60 in beside'],
  ['Queen, head on 12 ft wall', '144 − 60 = 84 in beside', '120 − 80 = 40 in at the foot'],
  ['Full, head on 10 ft wall', '144 − 75 = 69 in at the foot', '120 − 53 = 67 in beside'],
  ['Full, head on 12 ft wall', '144 − 53 = 91 in beside', '120 − 75 = 45 in at the foot']])}
<p>The rule this site uses for a bed you share or make every day is a 24 in strip on each side you use and at least a 36 in walkway where people pass (the clear width in ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')}). Apply that to the table and two layouts stand out.</p>
<h2 id="queen-short">Layout A: queen bed, headboard on the 10 ft wall</h2>
${figLayout('bedroom-12x10-queen', 'Queen bed with the headboard on the 10 ft wall; 24 in strips on both sides; dresser at the far end.')}
<p>With the headboard on a short wall, the queen's 80 in length runs along the 12 ft dimension. The 60 in left across the room is split into two 24 in bedside strips plus nightstands at the head, with 12 in to spare; 64 in remain at the foot. That is enough for the door, a walkway and a dresser with its drawers open.</p>
<p>Put the door on the wall at the foot end if you can choose, and make sure its swing ends against a wall rather than the dresser. In the plan above, the door is on the long wall near the corner and swings into the corner, so nothing is inside its arc.</p>
<h2 id="queen-long">Layout B: queen bed, headboard on the 12 ft wall</h2>
${figPlan(room(144, 120, [it('bed', 'Queen bed', 42, 0, 60, 80, { target: true, zones: bs(24), zoneIgnore: ['n1', 'n2'] }), it('n1', 'Nightstand', 18, 0, 18, 16), it('n2', 'Nightstand', 108, 0, 18, 16), it('dr', 'Dresser', 0, 60, 18, 40, { zones: [{ side: 'E', depth: 18, kind: 'drawer' }] })], [door('S', 104, 30, 'end')], [{ id: 'w', wall: 'N', offset: 0, width: 16 }]), 'Queen bed with the headboard on the 12 ft wall: 40 in at the foot – a walkway, but nothing else fits there.')}
<p>Centring the bed on the long wall looks symmetrical and leaves 42 in on each side, but only 40 in at the foot. That is a walkway, not a furniture zone. A dresser has to go on a side wall, where its 18 in drawer zone meets the bedside strip. It works if the dresser is shallow and placed beside the head of the bed, but the room will feel narrower.</p>
<h2 id="full-desk">Layout C: full bed in the corner plus a desk</h2>
${figLayout('bedroom-12x10-full-desk', 'Full bed in the corner, desk opposite: one bedside strip, a working desk and a dresser.')}
<p>A full bed pushed into the corner gives up access from one side but frees about 8 sq ft of floor compared with a centered queen – enough for a 42 in desk with a 32 in chair zone. This layout suits a single sleeper or a guest room that doubles as a home office. The route to the window is the tight one here; with the desk chair pushed in it is acceptable.</p>
<h2 id="door">The door decides more than the bed</h2>
<p>A standard 30 in interior door swinging into the room claims a quarter circle with a 30 in radius – about 4.9 sq ft that must stay empty. In a 120 sq ft room that is 4 % of the floor. Three ways to manage it:</p>
<ul><li>Hinge the door on the side nearest a corner so that it opens against the wall.</li>
<li>Keep the arc as part of the walkway – the area you walk through anyway.</li>
<li>If the arc lands on the only good wall for the bed, consider a sliding door; check your lease first.</li></ul>
<h2 id="window">Windows and radiators</h2>
<p>A headboard under a window is possible if the sill is higher than the headboard and there is no radiator. Otherwise, use the window wall for a desk or dresser. Keep at least one route to the window wide enough to open it and reach the latch – the planner measures the route to every window you draw.</p>
<h2 id="checklist">Before you buy the bed</h2>
<ol><li>Measure the room inside wall faces and note the door hinge side and swing.</li>
<li>Measure the bed frame, not just the mattress – frames with footboards and storage drawers can be several inches larger.</li>
<li>If the frame has drawers, add an 18 in drawer zone on that side.</li>
<li>Check the delivery route for the frame and mattress with the ${a('/guides/will-my-sofa-fit-through-the-door/', 'five delivery measurements')}.</li></ol>`,
    faq: [
      ['Can a queen bed fit in a 12x10 room?', 'Yes. With the headboard on a 10 ft wall a queen (60 × 80 in) leaves 64 in at the foot and room for 24 in strips on both sides plus nightstands.'],
      ['Which wall should the bed go on in a 12x10 room?', 'Usually a 10 ft wall. It leaves more space at the foot for a dresser and the door; with the headboard on the 12 ft wall only 40 in remain at the foot of a queen.'],
      ['Can I fit a desk in a 12x10 bedroom with a queen bed?', 'Only a small one, typically beside the dresser at the foot end, and only if the door swing is not in the way. With a full bed in the corner, a 42 in desk fits comfortably.'],
      ['Is a 12x10 bedroom small?', 'At 120 sq ft it is a common size for a secondary bedroom. It fits a queen bed with access from both sides, which is the main test of a usable double bedroom.']
    ],
    sources: [S.casper, S.ada4035]
  },
  {
    slug: 'space-between-bed-and-wall', group: 'Bedrooms', kicker: 'Bedrooms', short: 'Space between bed and wall',
    title: 'How Much Space Between Bed and Wall? Side, Foot and Corner Measurements',
    h1: 'How much space between bed and wall?',
    description: 'How much space to leave beside and at the foot of a bed, when pushing it against the wall makes sense, and how nightstands, dressers and doors change the numbers – with measured plans.',
    lede: 'Leave about 24 in beside every side of the bed you use and 36 in wherever it is also a walkway. Pushing one side against the wall saves space but makes the bed harder to make. Here is how to decide, with measurements.',
    related: ['12x10-bedroom-layout', 'full-vs-queen-bed-small-bedroom', 'walkway-space-around-furniture'],
    tool: `draw your bedroom in the ${a('/tools/clearance-planner/', 'Clearance Planner')}; every bed preset carries an adjustable bedside zone.`,
    body: `<h2 id="short">Short answer</h2>
${rule('24 in', 'Bedside strip on each side you use (610 mm)', 'site planning assumption – see reasoning below')}
<p>There is no building code for the space beside a bed. The 24 in figure used on this site is a planning assumption: it is enough to stand facing the bed, bend to tuck in a sheet and get in and out without turning sideways. Where the strip is also the way to somewhere else – a window, a wardrobe, the bathroom – it becomes a walkway, and this site uses the 36 in clear width from ${a('https://www.access-board.gov/ada/chapter/ch04/', 'ADA 2010 §403.5.1')} as the reference for that.</p>
<h2 id="sides">Beside the bed</h2>
<p>The space beside a bed is used in three ways: standing to make the bed, getting in and out, and reaching a nightstand. A nightstand typically stands within the strip at the head of the bed – the strip is about standing room, and a nightstand at the head does not take it away because you stand beside the mattress, not beside the nightstand.</p>
${table(['Situation', 'Plan for', 'Why'], [
  ['Side you sleep on, no one passes', '24 in', 'stand, bend, get in'],
  ['Side that is also the route to a window or wardrobe', '36 in', 'walkway width (ADA §403.5.1)'],
  ['Short squeeze past a nightstand', '32 in', 'pinch point up to 24 in long (ADA exception)'],
  ['Side against the wall', '0–2 in', 'leave a gap only for bedding and air']])}
<h2 id="foot">At the foot of the bed</h2>
<p>The foot of the bed is usually where people walk. If nothing else is there, 24 in is enough to walk round; if it is the main route from the door, plan 36 in. If a dresser stands opposite the foot, add its drawer zone: about 18 in for the drawer and to stand in front of it. A queen with a dresser at the foot therefore needs around 80 + 36 + 18 + 18 = 152 in of room length – more than a 12 ft (144 in) room has. That is why the dresser in a 12 × 10 ft room usually goes beside the door rather than opposite the bed.</p>
${figPlan(room(132, 120, [it('bed', 'Queen bed', 36, 0, 60, 80, { target: true, zones: [{ side: 'W', depth: 24, kind: 'bedside', walk: true }, { side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'S', depth: 24, kind: 'foot', walk: true }], zoneIgnore: ['n1', 'n2'] }), it('n1', 'Nightstand', 14, 0, 18, 16), it('n2', 'Nightstand', 100, 0, 18, 16)], [door('S', 4, 30)], [{ id: 'w', wall: 'E', offset: 30, width: 48 }]), 'Queen bed in a 11 × 10 ft room: 24 in strips on both sides and at the foot. The marker shows how wide the route to the window is.')}
<h2 id="wall">Pushing the bed against a wall</h2>
<p>Putting one long side of the bed against the wall saves one whole bedside strip – 24 in times the bed length, or about 13 sq ft for a queen. It is the standard trick in studios and children's rooms. The costs:</p>
<ul><li>Making the bed is harder; fitted sheets on the wall side are the worst part. A light frame you can pull out a few inches helps.</li>
<li>Two sleepers share one exit. Many couples will not accept this for a main bedroom.</li>
<li>Cold exterior walls can cause condensation behind the mattress; leave a gap of an inch or two for air.</li></ul>
<p>Pushing the head of the bed into a corner, so that only one long side and the foot are open, combines both savings. It works best for a single bed or a full used by one person.</p>
${figPlan(room(120, 108, [it('bed', 'Full bed', 67, 0, 53, 75, { target: true, zones: [{ side: 'W', depth: 24, kind: 'bedside', walk: true }] }), it('desk', 'Desk', 0, 0, 42, 22, { target: true, zones: chair('S') }), it('sh', 'Bookshelf', 0, 77, 31, 12)], [door('S', 30, 28, 'end')]), 'Full bed in the corner of a 10 × 9 ft room: one bedside strip, room left for a desk.')}
<h2 id="headboard">Behind the headboard</h2>
<p>A bed does not need space behind the headboard, but a few details change the numbers. A radiator under the window behind the bed needs air; leave the gap the radiator manufacturer recommends. Wall sockets and switches behind the headboard should stay reachable. A headboard that is thicker than the frame adds to the bed length – measure the whole bed, not the mattress.</p>
<h2 id="mattress">Bed sizes to plan with</h2>
${table(['Size', 'U.S. (Casper)', 'UK (Silentnight)'], [
  ['Twin / single', '38 × 75 in', '90 × 190 cm'],
  ['Full / double', '53 × 75 in', '135 × 190 cm'],
  ['Queen / king (UK)', '60 × 80 in', '150 × 200 cm'],
  ['King / super king (UK)', '76 × 80 in', '180 × 200 cm']])}
<p>U.S. sizes are from ${a(CASPER, 'Casper’s size chart')}, UK sizes from ${a(SILENT, 'Silentnight’s size guide')}. The UK and U.S. names do not match: a UK king (150 × 200 cm, about 59 × 79 in) is close to a U.S. queen.</p>
<h2 id="steps">How to check your own room</h2>
<ol><li>Measure the room and the bed frame including headboard and footboard.</li>
<li>Decide which sides you will use daily; give each a 24 in strip.</li>
<li>Mark every route that crosses a strip – to the window, the wardrobe, the door – and give it 36 in.</li>
<li>Add drawer and door-swing zones of anything facing the bed.</li>
<li>Draw it in the planner; it will show the narrowest point of every route.</li></ol>`,
    faq: [
      ['How much space should be on each side of a bed?', 'About 24 in on each side you use to get in and make the bed; 36 in if that side is also a walkway to a window, wardrobe or door. This is a planning assumption, not a code requirement.'],
      ['Is it OK to push a bed against the wall?', 'Yes, especially for a single sleeper or a studio. It saves about 13 sq ft with a queen bed but makes the bed harder to make, and on cold exterior walls you should leave a small gap for air.'],
      ['How much space at the foot of the bed?', 'At least 24 in to walk round, 36 in if it is the main route, plus 18 in for each drawer zone if a dresser faces the bed.'],
      ['What size room do I need for a queen bed with two nightstands?', 'Across the bed: 60 in mattress + 2 × 24 in strips = 108 in, so a 9 ft wall is the practical minimum. Along the bed: 80 in plus at least 24–36 in at the foot.']
    ],
    sources: [S.ada4035, S.casper, S.silent]
  },
  {
    slug: 'full-vs-queen-bed-small-bedroom', group: 'Bedrooms', kicker: 'Bedrooms', short: 'Full vs. queen bed',
    title: 'Full vs. Queen Bed in a Small Bedroom: The Floor Space Difference',
    h1: 'Full vs. queen bed in a small bedroom',
    description: 'A queen takes 7 in more width and 5 in more length than a full – 645 sq in. What that costs in a small bedroom, which room sizes tip the decision, and how the UK sizes compare.',
    lede: 'On paper a queen is only 7 in wider and 5 in longer than a full. In a small bedroom those inches come out of the strips you walk in, and they decide whether a dresser or desk still fits.',
    related: ['12x10-bedroom-layout', 'space-between-bed-and-wall', 'murphy-bed-room-size'],
    tool: `swap the bed in the ${a('/tools/clearance-planner/', 'Clearance Planner')} – the narrowest walkway updates instantly.`,
    body: `<h2 id="sizes">The sizes</h2>
${table(['', 'Full', 'Queen', 'Difference'], [
  ['Width', '53 in (134.6 cm)', '60 in (152.4 cm)', '+7 in'],
  ['Length', '75 in (190.5 cm)', '80 in (203.2 cm)', '+5 in'],
  ['Area', '3,975 sq in (27.6 sq ft)', '4,800 sq in (33.3 sq ft)', '+825 sq in (+5.7 sq ft)'],
  ['Width per sleeper (two)', '26.5 in', '30 in', '+3.5 in']])}
<p>Mattress dimensions are the U.S. standard sizes from ${a(CASPER, 'Casper’s size chart')}. Frames add to these, sometimes several inches with a footboard or upholstered headboard. The mattress area difference is 825 sq in, about 5.7 sq ft. But the bed's footprint is not the whole story – the floor around it changes too.</p>
<h2 id="room">What the difference does to the room</h2>
<p>A bed with two usable sides and a walkable foot needs a 24 in strip on each side and at least 24 in at the foot (see ${a('/guides/space-between-bed-and-wall/', 'space between bed and wall')}). The total space a bed claims, mattress plus strips, is therefore:</p>
${table(['Bed', 'Width with two 24 in strips', 'Length with 24 in at foot', 'Total area'], [
  ['Full', '101 in', '99 in', '69.4 sq ft'],
  ['Queen', '108 in', '104 in', '78.0 sq ft']])}
<p>The real difference is about 8.6 sq ft once access is included – one and a half times the mattress difference. In a 120 sq ft room that is 7 % of the floor.</p>
${figPlan(room(120, 120, [it('bed', 'Full bed', 34, 0, 53, 75, { target: true, zones: bs(24) }), it('dr', 'Dresser', 80, 102, 40, 18, { zones: [{ side: 'N', depth: 18, kind: 'drawer' }] })], [door('S', 4, 30)]), 'Full bed in a 10 × 10 ft room: two 24 in strips, a dresser with open drawers at the foot end.')}
${figPlan(room(120, 120, [it('bed', 'Queen bed', 30, 0, 60, 80, { target: true, zones: bs(24) }), it('dr', 'Dresser', 80, 102, 40, 18, { zones: [{ side: 'N', depth: 18, kind: 'drawer' }] })], [door('S', 4, 30)]), 'Queen bed in the same room: the drawer zone now meets the foot of the bed.')}
<h2 id="thresholds">Room sizes where the choice flips</h2>
<p>Use the wall the headboard goes against and the wall along the bed:</p>
<ul><li><b>Headboard wall under 9 ft (108 in):</b> a queen cannot have two 24 in strips. Choose a full, or push the queen against a wall.</li>
<li><b>Headboard wall 9–10 ft:</b> a queen fits with two strips, but nightstands wider than about 6 in each will intrude on the strips (108 in + 2 × 6 in = 120 in).</li>
<li><b>Bed-length wall under 9 ft:</b> with a queen, only 28 in remain at the foot – a walkway, but no dresser opposite.</li>
<li><b>Both walls 10 ft or more:</b> a queen with two strips, nightstands and a dresser works if the door swing is clear.</li></ul>
<h2 id="who">Who needs the extra width</h2>
<p>A full gives two sleepers 26.5 in each – about the width of a twin mattress cut in half and a little more. Many couples find that tight; many single sleepers find a full generous. Practical guidance:</p>
<ul><li><b>One sleeper:</b> a full is usually enough and leaves floor for a desk or a reading chair.</li>
<li><b>Two sleepers who both get up at night:</b> a queen with two strips beats a full pushed against a wall, even if the room is tight.</li>
<li><b>Guest room used a few nights a year:</b> a full, or a ${a('/guides/wall-bed-vs-sofa-bed/', 'wall bed or sofa bed')}.</li>
<li><b>Tall sleepers:</b> the queen's extra 5 in of length matters more than its width; a full is 75 in long.</li></ul>
<h2 id="uk">UK sizes</h2>
<p>UK beds are measured in centimeters and named differently. According to ${a(SILENT, 'Silentnight’s size guide')}, a UK double is 135 × 190 cm (about 53.1 × 74.8 in) – almost exactly a U.S. full. A UK king is 150 × 200 cm (about 59.1 × 78.7 in), close to a U.S. queen. The same reasoning applies: the step from double to king costs about 15 cm across and 10 cm along the bed, plus the access strips.</p>
<h2 id="delivery">Delivery and moving</h2>
<p>A queen mattress is 60 in wide and a full 53 in, but both are thin. On its side and slightly diagonal, a mattress passes through ordinary doorways; the problem is usually a box spring, which does not bend. Split box springs for queen beds exist for exactly this reason. Check stair landings with the ${a('/tools/will-it-fit/', 'delivery check')}.</p>
<h2 id="decide">Decision in four steps</h2>
<ol><li>Measure the headboard wall and the wall along the bed.</li>
<li>Subtract the bed plus 24 in per used side and at the foot.</li>
<li>Check that the remaining floor still holds the door swing and any drawer zones.</li>
<li>If the queen leaves a walkway under 32 in anywhere, choose the full – or push the queen to the wall and accept a one-side bed.</li></ol>
<h2 id="frames">Frames change the comparison</h2>
<p>The mattress sizes above are the starting point; the frame decides the footprint. Three frame features add the most:</p>
<ul><li><b>Footboards and sleigh ends</b> add 2–6 in to the length. On a queen in a 9 ft deep room, that is the difference between a 28 in and a 22 in strip at the foot.</li>
<li><b>Upholstered headboards</b> add 2–4 in to the length and often 1–2 in to the width on each side.</li>
<li><b>Storage drawers under the bed</b> add a drawer zone on each side with drawers. A drawer that pulls out 18 in into a 24 in bedside strip leaves 6 in – you cannot stand there while it is open. Choose a frame with drawers at the foot, or lift-up storage, if the side strips are tight.</li></ul>
<p>A minimal platform frame adds almost nothing and is the best choice when a queen only just fits. When comparing, write down the outside frame dimensions of both candidates and redo the arithmetic above with those numbers rather than with the mattress sizes.</p>
<h2 id="bedding">Bedding and everyday use</h2>
<p>The size you choose also decides the bedding you buy and store. Queen bedding is the most widely available size in the U.S.; full bedding is cheaper but the range is smaller. In a small home with little linen storage, one spare set per bed is a realistic plan – and a full set takes noticeably less shelf space than a queen set. If the bed is pushed against a wall, fitted sheets with deep elastic corners make the wall side less of a struggle.</p>`,
    faq: [
      ['How much bigger is a queen than a full?', 'A U.S. queen (60 × 80 in) is 7 in wider and 5 in longer than a full (53 × 75 in): about 5.7 sq ft more mattress, and about 8.6 sq ft more floor once 24 in access strips are included.'],
      ['What is the smallest room for a queen bed?', 'With access on both sides and a walkable foot, the bed needs about 108 × 104 in. A 9 × 9 ft room is the practical minimum, but it leaves no space for other furniture.'],
      ['Is a full bed big enough for two people?', 'It gives each sleeper 26.5 in of width. Some couples are fine with that; many prefer a queen at 30 in each.'],
      ['Is a UK double the same as a US full?', 'Nearly: a UK double is 135 × 190 cm (about 53.1 × 74.8 in), a U.S. full is 53 × 75 in.']
    ],
    sources: [S.casper, S.silent]
  }
];
