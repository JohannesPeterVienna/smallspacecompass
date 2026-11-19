const ADA = 'https://www.access-board.gov/ada/';
// label text as one element (label.f is a grid) – the unit never breaks away from the last word
const lab = (text) => { const i = text.lastIndexOf(' '); return `<span class="lb">${i < 0 ? '' : text.slice(0, i + 1)}<span class="nw">${text.slice(i + 1)}&nbsp;(<span data-unit-label>in</span>)</span></span>`; };
const unitSeg = `<div class="seg" role="group" aria-label="Units"><button type="button" data-units="in" aria-pressed="true">in</button><button type="button" data-units="cm" aria-pressed="false">cm</button></div>`;
const legend = `<div class="legend"><span><i class="sw route"></i>widest route from the entry</span><span><i class="sw zone"></i>use zone (chair, drawer, bedside)</span><span><i class="sw bad"></i>conflict</span><span>dashed arc: door swing</span></div>`;

const plannerApp = (mode) => `<section class="tool" data-planner data-mode="${mode}" aria-label="${mode === 'swap' ? 'Day/Night Floor Swap' : 'Clearance Planner'}">
<div style="min-width:0">${mode === 'swap'
    ? `<div class="stage-pair"><div class="stage"><h3>Day</h3><div data-stage="day"></div></div><div class="stage"><h3>Night</h3><div data-stage="night"></div></div></div><div class="stage" style="border-top:0">${legend}</div>`
    : `<div class="stage"><div data-stage="plan"></div>${legend}</div>`}
<noscript><p class="status bad">The planner needs JavaScript. The measured layouts in the library work without it.</p></noscript></div>
<div class="panel">
<div class="row">${unitSeg}<select data-load aria-label="Load a measured layout"></select></div>
<div class="fields"><label class="f">${lab('Room width')}<input type="number" min="24" step="1" data-room-w></label><label class="f">${lab('Room depth')}<input type="number" min="24" step="1" data-room-d></label></div>
<div data-report aria-live="polite"></div>
<div class="row"><label class="sr" for="preset-${mode}">Furniture preset</label><select id="preset-${mode}" data-preset style="flex:1 1 180px"></select><button class="btn small" type="button" data-act="add">Add</button></div>
<div data-editor class="item-editor"></div>
<details class="more"><summary>Doors and windows</summary><div data-doors></div><div class="row" style="margin-top:.6rem"><button class="btn small ghost" type="button" data-act="add-door">Add door</button><button class="btn small ghost" type="button" data-act="add-window">Add window</button></div></details>
${mode === 'plan' ? `<details class="more"><summary>Compare two versions</summary><div class="row"><button class="btn small ghost" type="button" data-act="snap-a">Save as A</button><button class="btn small ghost" type="button" data-act="snap-b">Save as B</button><button class="btn small ghost" type="button" data-act="load-a">Reopen A</button><button class="btn small ghost" type="button" data-act="load-b">Reopen B</button></div><div data-compare class="table-scroll" style="margin-top:.6rem"></div></details>` : ''}
<div class="row"><button class="btn small ghost" type="button" data-act="export-svg">Export SVG</button><button class="btn small ghost" type="button" data-act="export-json">Export JSON</button><button class="btn small ghost" type="button" data-act="import">Import JSON</button><button class="btn small ghost" type="button" data-act="reset">Reset</button><input type="file" accept="application/json,.json" data-file hidden></div>
<p class="note-small" style="margin:0">Saved in this browser only (localStorage). Nothing is uploaded.</p>
</div></section>`;

const num = (name, label, val, extra = '') => `<label class="f">${lab(label)}<input type="number" step="0.5" min="0" name="${name}" value="${val}" ${extra}></label>`;
const deliveryApp = `<section class="tool" data-delivery aria-label="Delivery check">
<div class="panel delivery-in">
<div class="row">${unitSeg}</div>
<h2>Worked routes to start from</h2>
<div class="row"><button class="btn small ghost" type="button" data-example="sofaok">84 in sofa that passes</button><button class="btn small ghost" type="button" data-example="sofastuck">Same sofa, 2 in deeper</button><button class="btn small ghost" type="button" data-example="mattress">Queen mattress, stairs</button><button class="btn small ghost" type="button" data-example="wardrobe">Wardrobe kept upright</button></div>
<h2>1 · The item (outside dimensions)</h2>
<div class="row">${['sofa', 'loveseat', 'queenmattress', 'kingbox', 'wardrobe', 'fridge'].map(k => `<button class="btn small ghost" type="button" data-preset="${k}">${{ sofa: 'Sofa', loveseat: 'Loveseat', queenmattress: 'Queen mattress', kingbox: 'Box spring', wardrobe: 'Wardrobe', fridge: 'Fridge' }[k]}</button>`).join('')}</div>
<div class="fields">${num('W', 'Length / width', 84)}${num('D', 'Depth', 35)}${num('H', 'Height', 34)}${num('diag', 'Diagonal depth (sofas)', 31)}</div>
<label class="row note-small"><input type="checkbox" name="upright"> Must stay upright (wardrobe with glass, fridge)</label>
<h2>2 · The route</h2>
<fieldset><legend class="row note-small"><label><input type="checkbox" name="useDoor" checked> Entry door</label></legend><div class="fields">${num('doorW', 'Clear width', 32)}${num('doorH', 'Clear height', 80)}</div></fieldset>
<fieldset><legend class="row note-small"><label><input type="checkbox" name="useCorner" checked> 90° hallway corner</label></legend><div class="fields">${num('hallA', 'Hall width before', 36)}${num('hallB', 'Hall width after', 36)}${num('hallH', 'Ceiling height', 96)}</div></fieldset>
<fieldset><legend class="row note-small"><label><input type="checkbox" name="useLanding"> Stair landing turn</label></legend><div class="fields">${num('stairW', 'Stair / landing width', 36)}${num('stairH', 'Headroom at turn', 80)}</div></fieldset>
<fieldset><legend class="row note-small"><label><input type="checkbox" name="useDoor2"> Room door</label></legend><div class="fields">${num('door2W', 'Clear width', 30)}${num('door2H', 'Clear height', 80)}</div></fieldset>
</div>
<div class="delivery-out" style="min-width:0"><div data-result aria-live="polite"></div>
<div class="row no-print" style="margin-top:1rem"><button class="btn small ghost" type="button" data-share="copy">Copy result</button><button class="btn small ghost" type="button" data-share="link">Copy link</button><button class="btn small ghost" type="button" data-share="print">Print</button><span class="note-small" data-msg role="status"></span></div>
<p class="note-small no-print" style="margin:.6rem 0 0">“Copy link” puts your dimensions into the link itself, after the # sign. Nothing is uploaded; whoever opens the link sees the same numbers.</p></div>
</section>`;

const storageApp = `<section class="tool" data-storage aria-label="Storage wall audit">
<div style="min-width:0"><div class="stage" data-wall></div><div data-bands class="table-scroll" style="margin-top:1rem"></div></div>
<div class="panel">
<div class="row">${unitSeg}<button class="btn small" type="button" data-act="add">Add unit</button><button class="btn small ghost" type="button" data-act="reset">Reset</button></div>
<div class="fields"><label class="f">${lab('Wall width')}<input type="number" data-wall-w step="1"></label><label class="f">${lab('Ceiling height')}<input type="number" data-wall-h step="1"></label></div>
<div data-unit class="item-editor"></div>
<div data-divider class="item-editor"><h3>Equal compartments</h3><div class="fields"><label class="f">Inside opening<input type="number" name="opening" value="30" step="0.25"></label><label class="f">Compartments<input type="number" name="parts" value="3" min="1" max="20" step="1"></label><label class="f">Divider thickness<input type="number" name="thick" value="0.75" step="0.0625"></label></div><div data-div aria-live="polite"></div></div>
<div class="row no-print"><button class="btn small ghost" type="button" data-out="csv">Export CSV</button><button class="btn small ghost" type="button" data-out="print">Print</button></div>
<p class="note-small" style="margin:0">Saved in this browser only. The CSV lists every unit with its volume per band.</p></div>
</section>`;

// Clearance Check: the shell is static HTML; quick.js fills it. Used on the home page and on its own tool page.
export const quickShell = `<section class="tool quick" data-quick aria-label="Clearance Check">
<div class="panel">
<div class="row"><div class="seg" role="group" aria-label="What to check" data-q-scen></div><div class="seg" role="group" aria-label="Units" data-q-units></div></div>
<div class="row" data-q-ex aria-label="Examples"></div>
<div data-q-note></div>
<div class="fields" data-q-fields></div>
<div class="row no-print"><button class="btn small ghost" type="button" data-q-act="copy">Copy result</button><button class="btn small ghost" type="button" data-q-act="link">Copy link</button><button class="btn small ghost" type="button" data-q-act="print">Print</button><span class="note-small" data-q-msg role="status"></span></div>
<p class="note-small no-print" style="margin:0">Nothing is stored or uploaded. “Copy link” puts your numbers into the link itself, after the # sign; whoever opens it sees the same numbers.</p>
</div>
<div class="q-out" data-q-out aria-live="polite"><noscript><p class="status bad">The Clearance Check needs JavaScript. The <a href="/reference/">reference table</a> with all widths works without it.</p></noscript></div>
</section>`;

export const TOOLS = [
  {
    path: '/tools/clearance-check/', short: 'Clearance Check', script: 'quick.js', updated: '2026-11-19',
    title: 'Clearance Check: Bed, Walkway, Table & Kitchen Aisle Widths',
    description: 'Type in a wall and a bed, a gap, a table or a kitchen width: the check shows the subtraction, the clear width that is left and which published reference widths it meets – in inches or centimeters.',
    h1: 'Clearance Check', lede: 'Four quick sums for the questions that come up before any drawing: is there room beside the bed, is this gap still a walkway, how wide may the table be, is the kitchen aisle wide enough? Each result shows its working and is compared with published widths from five primary documents, each linked to its entry in the reference table.',
    app: quickShell,
    body: `<h2 id="how">What the check does</h2>
<p>Each of the four checks is a subtraction you could do on paper – the value of the tool is that it shows the working, compares the result with every published width that applies, and tells you how much is missing for the next one. It works on one section through the room: a wall with a bed against it, a gap with use zones on either side, a room with a table in it, a kitchen with one or two counter runs.</p>
<div class="table-scroll"><table class="data"><thead><tr><th>Check</th><th>Working</th><th>Compared with</th></tr></thead><tbody>
<tr><td>Bed on a wall</td><td>(wall − bed width) ÷ sides in use; room depth − bed length. The tighter of the two is compared.</td><td>24 in bedside strip (this site’s assumption); 750 mm and 1000 mm clear access zones of Approved Document M; 36 in ADA walking surface</td></tr>
<tr><td>Walkway</td><td>gap − use zone A − use zone B</td><td>28 in (24 CFR 3280.112), 750 mm and 900 mm (Approved Document M), 32 in pinch and 36 in (ADA §403.5.1)</td></tr>
<tr><td>Table and chairs</td><td>(room width − table width) ÷ sides with chairs</td><td>32, 36 and 44 in from table edge to wall (NKBA Kitchen Guideline 8)</td></tr>
<tr><td>Kitchen aisle</td><td>wall to wall − counter depths</td><td>36 in walkway and 42 / 48 in work aisle (NKBA 7 and 6), 40 in (ADA §804.2.1), 1200 mm (Approved Document M)</td></tr></tbody></table></div>
<h2 id="zones">The use zones in the walkway check</h2>
<p>A gap is not a walkway until you subtract what happens in it. The check offers three zone depths. The 32 in for a desk or dining chair is the distance the <a href="/reference/#nkba-seat-none">NKBA guideline</a> gives from a table edge to a wall where nobody passes. The 18 in for an open drawer or sofa legroom and the 24 in bedside strip are this site’s own planning assumptions – no standard we could read states them – so they are labelled as such wherever they appear. If your chair, drawer or door leaf is deeper, subtract it by hand and enter the smaller gap.</p>
<h2 id="read">Reading the result</h2>
<p>The list of reference widths is sorted from the smallest to the largest. A row says “meets” when your clear width is at least that wide, and gives the margin either way. The documents were written for different purposes: an accessibility standard for public buildings, a federal standard for factory-built homes, English building-regulations guidance, a trade association’s kitchen guidelines. None of them governs how you furnish a private room. Together they bracket the range from “a person can physically pass” to “comfortable for a wheelchair user”, which is more useful than a single rule of thumb. The <a href="/reference/">reference table</a> shows each figure with its section number, scope and link.</p>
<p>“Next step” names the largest piece – or the smallest room – that would still reach the next width up, so you know what to change. A sum on one section cannot see door swings, a second piece of furniture further along or a route that turns a corner; for that, draw the room in the <a href="/tools/clearance-planner/">Clearance Planner</a>.</p>
<h2 id="limits">Limits</h2>
<ul><li>One straight section, rectangles only. Skirting boards, radiators, handles and bed frames wider than the mattress have to be included in the numbers you type.</li>
<li>Metric figures from the English documents are compared exactly (750 mm, not a rounded 29.5 in); inch figures from the U.S. documents likewise. Results are rounded to 0.1 in or 0.1 cm for display; a converted reference width is always rounded up (750 mm is shown as 29.53 in), so the display never understates a minimum.</li>
<li>Meeting a width here is not a statement that a room complies with any code or accessibility standard.</li></ul>`,
    faq: [
      ['Is 24 inches beside a bed a rule?', 'No. It is this site’s planning assumption. The only bedside figure we found in a primary document is the 750 mm (29.53 in) clear access zone of England’s Approved Document M for accessible and adaptable dwellings, and 1000 mm for wheelchair user dwellings; the check shows both.'],
      ['Why does the kitchen check list both 40 and 42 inches?', 'They come from different documents: 40 in is the minimum clearance in a pass-through kitchen in the 2010 ADA Standards (§804.2.1), 42 in is the work aisle the NKBA recommends for one cook (guideline 6).'],
      ['What does “Copy link” contain?', 'The check you chose, the unit and the numbers you typed, written after the # sign of the link. Browsers do not send that part to the web server. Nothing is stored on this site. If a link carries a value the check does not know, it says so and shows its default instead.']
    ],
    sources: [
      ['2010 ADA Standards for Accessible Design, §403.5.1, §804.2.1 (U.S. Access Board)', 'https://www.access-board.gov/ada/#ada-403_5_1', 'retrieved 2026-11-18'],
      ['NKBA Kitchen Planning Guidelines with Access Standards (PDF)', 'https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf', 'guidelines 6, 7 and 8; retrieved 2026-11-18'],
      ['Approved Document M, Volume 1: Dwellings, 2015 edition incorporating 2016 amendments (UK Government)', 'https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m', 'paragraphs 1.15, 2.22, 2.24, 2.25, 3.35; retrieved 2026-11-18'],
      ['24 CFR Part 3280, Manufactured Home Construction and Safety Standards, § 3280.112 (edition of April 1, 2024)', 'https://www.govinfo.gov/content/pkg/CFR-2024-title24-vol5/pdf/CFR-2024-title24-vol5-part3280.pdf', 'retrieved 2026-11-18']
    ]
  },
  {
    path: '/tools/clearance-planner/', short: 'Clearance Planner', script: 'planner.js',
    title: 'Clearance Planner: Walkways, Door Swings & Chair Space',
    description: 'Free room planner that measures the narrowest walkway from your door to the bed, desk and window, draws door swings and chair, drawer and wardrobe zones, and flags every conflict.',
    h1: 'Clearance Planner', lede: 'Draw the room, drop in measured furniture and see whether you can still walk through it. The planner finds the widest route from the entry to every bed, desk and window, marks its narrowest point and compares it with 36 in (915 mm) – the ADA 2010 §403.5.1 clear width for walking surfaces on accessible routes, used here as a width reference, not as a full accessibility assessment.',
    app: plannerApp('plan'),
    body: `<h2 id="how">How the planner measures a walkway</h2>
<p>Most free room planners answer one question: does the furniture fit on the floor? That is the easy part. The hard part is the space you need to use the furniture and to get past it – the arc of the door as it swings open, the 30-odd inches a desk chair rolls back, the strip beside a bed you need for making it, the drawer that has to come out of a dresser. The Clearance Planner draws all of those as zones, then measures the space that is left.</p>
<p>Behind the drawing, the floor is cut into a fine grid of about one-inch cells. Every cell covered by furniture, by a use zone or by the swing of the door is marked as blocked. For every free cell the planner then computes the exact straight-line distance to the nearest blocked cell or wall (a Euclidean distance transform). That distance is the radius of the largest circle you could stand in at that point; twice the radius is the width of the passage there.</p>
<p>Next it searches for a route from the entry door to each target – every piece you marked “measure the walkway to this piece”, plus every window. It does not take the shortest route but the <em>widest</em> one: the route whose narrowest point is as wide as possible (a so-called bottleneck path). Among all routes of that width it then takes the shortest, using an A* search, and draws it in yellow. The point where the route is tightest gets a marker, and the planner measures the gap there once more, exactly, between the two surfaces that cause it. That figure is what you see in the result box.</p>
<p>The target itself and its own use zone are not treated as obstacles on the way to it – you are walking <em>to</em> the desk chair space, not around it. Use zones marked as walk-through, like the strip beside a bed or the work aisle in front of a counter, never block a route: you can stand in them, you just should not put furniture there.</p>
<h2 id="threshold">Why 36 inches is the reference line</h2>
<p>The planner compares every walkway with the 36 in (915 mm) minimum clear width for walking surfaces in section 403.5.1 of the <a href="https://www.access-board.gov/ada/chapter/ch04/">2010 ADA Standards for Accessible Design</a>. That section sets the clear width of walking surfaces that are part of an accessible route (chapter 4, accessible routes). Private homes are generally not required to meet those standards, and the planner does not claim they are: it checks one width against this reference and is not a full accessibility assessment. The number is used because it is a published, measured width that lets one adult walk past furniture without turning sideways, and the same 36 in figure appears as the recommended walkway width in the <a href="https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf">NKBA Kitchen Planning Guidelines</a> (guideline 7). The standards also allow short pinch points: 32 in for no more than 24 in of length. If your narrowest point is a short squeeze past a nightstand, the planner will still show it below 36 in – you decide whether that is acceptable for you.</p>
<h2 id="zones">Default use zones</h2>
<p>Every preset comes with a zone that you can change once the piece is selected. They are working assumptions for planning, not code requirements:</p>
<div class="table-scroll"><table class="data"><thead><tr><th>Piece</th><th>Zone</th><th>Default depth</th><th>Why</th></tr></thead><tbody>
<tr><td>Desk, dining table</td><td>chair</td><td class="num">32 in</td><td>NKBA guideline 8 allows 32 in from a table edge to a wall where nobody passes behind a seated diner.</td></tr>
<tr><td>Bed</td><td>bedside</td><td class="num">24 in</td><td>Enough to stand beside the bed and make it; a site assumption explained in the <a href="/guides/space-between-bed-and-wall/">bed-and-wall guide</a>.</td></tr>
<tr><td>Dresser</td><td>drawer</td><td class="num">18 in</td><td>A typical full-extension drawer depth plus room to stand.</td></tr>
<tr><td>Wardrobe, fridge</td><td>door swing</td><td class="num">20–30 in</td><td>The width of one door leaf.</td></tr>
<tr><td>Kitchen counter</td><td>work aisle</td><td class="num">42 in</td><td>NKBA guideline 6: 42 in for one cook.</td></tr>
<tr><td>Sofa, armchair</td><td>legroom</td><td class="num">18 in</td><td>Space for feet in front of the seat.</td></tr></tbody></table></div>
<h2 id="tips">Working with the planner</h2>
<ul><li><b>Measure the inside faces of the walls</b>, not the outside of the trim. Doors are measured as the clear opening with the door open 90°, as described in ADA 2010 §404.2.3.</li>
<li><b>Drag pieces</b> with a mouse or finger, or select one with Tab and move it with the arrow keys (Shift for 6 in steps). R rotates, Delete removes.</li>
<li><b>Snapshots A and B</b> under “Compare two versions” let you try a second arrangement and see free floor, narrowest walkway and conflicts side by side.</li>
<li><b>Export</b> the drawing as SVG for printing or sending to a landlord, or as JSON to continue on another device. Import accepts the same JSON.</li>
<li>Switch the units at any time; the plan is stored in inches internally and converted exactly (1 in = 2.54 cm).</li></ul>
<h2 id="limits">What the planner does not do</h2>
<p>It treats every piece as a rectangle at floor level, so a wall-mounted shelf above a desk, a radiator under a window or a sloped ceiling is not modeled. It does not know about building codes, fire egress, the swing of a window sash or the weight of anything. It is a geometric aid that makes the space between objects visible – read more in <a href="/about/">About and method</a>.</p>`,
    faq: [
      ['Is the planner free and do I need an account?', 'Yes, it is free and there is no account. Your plan is stored only in your own browser (localStorage) and can be exported as JSON or SVG.'],
      ['Why is my walkway shown as narrower than the gap I measured?', 'The planner adds use zones: a desk chair, an open drawer or the swing of the door take space even when they are not drawn as furniture. Select the piece to see or reduce its zone.'],
      ['Can I use centimeters?', 'Yes. Use the in/cm switch. All inputs and results change unit; the stored plan keeps full precision.'],
      ['Does a result of 36 in mean my home is accessible?', 'No. 36 in is a reference taken from ADA 2010 §403.5.1. Accessibility also depends on turning space, door hardware, thresholds and much more that the planner does not model.']
    ],
    sources: [['2010 ADA Standards for Accessible Design, §403.5.1, §404.2.3 (U.S. Access Board)', 'https://www.access-board.gov/ada/chapter/ch04/'], ['NKBA Kitchen Planning Guidelines with Access Standards (PDF)', 'https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf', 'guidelines 6, 7 and 8']]
  },
  {
    path: '/tools/will-it-fit/', short: 'Will It Fit?', script: 'delivery.js', updated: '2026-11-19',
    title: 'Will It Fit? Sofa, Mattress & Wardrobe Delivery Check',
    description: 'Check whether a sofa, mattress or wardrobe can be carried through your door, around a 90° hallway corner and up a stair landing – straight, tilted or turned – with a drawing of the move.',
    h1: 'Will It Fit? Delivery Check', lede: 'Type in the outside dimensions of a sofa, mattress or wardrobe and the narrowest parts of the route into your home. The check tries every orientation – straight, on its side, on end, tilted – and draws the one that works.',
    app: deliveryApp,
    body: `<h2 id="method">What the check calculates</h2>
<p>Getting a piece of furniture into a home is a sequence of bottlenecks: the building door, the apartment door, a hallway that turns 90°, a stair with a landing, the bedroom door. Each one is a different geometric problem, and the check treats them separately.</p>
<h3>Doors</h3>
<p>Through a doorway, only the cross-section of the item matters – its length is carried straight through. The check tries all three ways to turn the box (each dimension leading in turn) and tests whether the remaining two dimensions fit the clear width and height of the opening. Turning the cross-section diagonally helps when one side is long and the other thin, like a mattress or a door panel; the check uses the exact geometric condition for fitting one rectangle inside another at an angle rather than a rough rule of thumb. For sofas, it also applies the profile rule used by furniture makers: tipped onto its back or end, a sofa with a sloped back clears a doorway when its <em>diagonal depth</em> is smaller than the door's clear width. Measure that from the top back of the frame to the front of the seat.</p>
<h3>A 90° corner</h3>
<p>In a hallway that turns a corner, length suddenly matters. The longest rectangle of width <span class="mono">w</span> that can be swung flat around a right-angled corner between corridors of width <span class="mono">a</span> and <span class="mono">b</span> is the minimum over all angles θ of <span class="mono">a/cos θ + b/sin θ − w(tan θ + cot θ)</span>. For a thin pole in a corner between two 36 in halls that is about 102 in; for a 34 in deep sofa it is much less. The check evaluates this formula numerically and also tries tilting the item upwards: lifting one end shortens its footprint, as long as the tilted piece still fits under the ceiling. The sketch shows the item at its tightest angle in the corner.</p>
<h3>Stair landings</h3>
<p>A U-shaped or L-shaped stair forces the same turn on the landing, usually with less headroom. Enter the stair width and the clear height at the turn; the check handles it like a corner with equal widths and that headroom.</p>
<h2 id="measure">Measuring the route</h2>
<ol><li><b>Door clear width:</b> open the door to 90° and measure from the face of the door to the opposite stop – the method in ADA 2010 §404.2.3. This is typically 2 in or more less than the door leaf. Taking the door off its hinges usually gains the thickness of the leaf.</li>
<li><b>Door clear height:</b> floor or threshold to the underside of the head stop.</li>
<li><b>Hallway widths:</b> wall to wall at the narrowest point before and after the corner – radiators, trim and light switches count.</li>
<li><b>Ceiling or headroom:</b> at the corner itself, including any light fitting or soffit.</li>
<li><b>Item:</b> the outside dimensions with packaging if it arrives boxed; feet and cushions that can be removed can be left out.</li></ol>
<h2 id="read">Reading the result</h2>
<p>Each checkpoint shows whether it passes and how: which side leads, which side is vertical, how far the item has to be tilted and how much room is left. If a corner fails, the result says by how much the item is too long even when tilted within the ceiling height. That number tells you what to ask the retailer: a sofa with removable arms or legs, a split box spring, a modular or “sofa-in-a-box” design.</p>
<p>The form opens with a sofa that makes it: 84 in long, 35 in deep, 34 in high, 31 in diagonal depth, through a 32 in door and around a corner between two 36 in halls. Change the depth to 37 in – the <a href="/guides/will-my-sofa-fit-through-the-door/#example">worked example in the sofa guide</a> – and the same sofa still passes the door but fails at the hallway corner by about an inch. Those 2 in of depth are exactly what to ask the retailer about. Both cases are among the “worked routes” buttons above the form; they are constructed examples, not measurements of real buildings.</p>
<h2 id="share">Sending the result to someone</h2>
<p>“Copy result” puts the verdict for every checkpoint on the clipboard as plain text – for a message to the retailer or the movers. “Copy link” creates a link that reopens the check with your dimensions: they are written after the # sign of the address, which browsers do not transmit to the web server, and nothing is stored on this site. Whoever opens the link sees your numbers without losing their own: the check they had saved in their browser is only replaced once they change a value. “Print” prints the form, the result and the sketches without navigation and ads.</p>`,
    faq: [
      ['What is the diagonal depth of a sofa?', 'The distance from the top of the back frame to the front edge of the seat, measured in a straight line from the side. Many retailers list it; otherwise measure with a straightedge across the side profile.'],
      ['Does the check account for people carrying the item?', 'No. It checks the rigid geometry of a box with the dimensions you enter. Allow a couple of inches for hands, straps and packaging.'],
      ['Why does a mattress fit when its width is wider than my door?', 'A mattress is thin. Turned on its side and slightly diagonally it can pass an opening narrower than its width. Foam mattresses can also bend, which the check does not assume.'],
      ['Can it check spiral stairs?', 'No. Spiral and winder stairs need a 3D model of the steps; use the landing setting only for straight flights with a flat landing.']
    ],
    sources: [['2010 ADA Standards, §404.2.3 Clear Width (measuring doors)', ADA + '#ada-404_2_3']]
  },
  {
    path: '/tools/day-night-swap/', short: 'Day/Night Floor Swap', script: 'planner.js', updated: true,
    title: 'Day/Night Floor Swap – check a wall bed, sofa bed or drop-leaf table in both positions',
    description: 'Plan fold-away furniture twice: the planner checks your room with the wall bed or sofa bed folded and open, and flags anything that blocks the bed, the door or the walkway at night.',
    h1: 'Day/Night Floor Swap', lede: 'A wall bed, sofa bed or drop-leaf table changes the room twice a day. This tool shows the same plan in both states and runs the full clearance check on each – so the coffee table that is fine at noon does not end up under the mattress at midnight.',
    app: plannerApp('swap'),
    body: `<h2 id="how">How the two states work</h2>
<p>Every piece has a state setting. “Day + night” pieces stay where they are. “Day only” pieces are folded or moved away at night – a coffee table that goes against the wall, a folding chair that hangs on a hook. “Night only” pieces appear only at night, such as a folding guest bed. Fold-away presets also carry an <em>unfold</em> depth: a queen wall bed is about 18 in deep when closed and projects roughly another 68 in into the room when open; a sofa bed grows by the length of its mattress frame. The planner adds that extension on the side you choose and checks the room again.</p>
<p>In each state the same analysis runs as in the <a href="/tools/clearance-planner/">Clearance Planner</a>: overlaps, door swing conflicts, blocked use zones and the widest route from the entry to the bed, desk, table and windows, with its narrowest point. A conflict that only appears at night is shown only in the night drawing.</p>
<h2 id="sizes">Typical fold-away dimensions</h2>
<p>The presets use round planning figures. Always replace them with the manufacturer's dimensions for the exact model, because cabinet depth, frame and mattress thickness vary:</p>
<div class="table-scroll"><table class="data"><thead><tr><th>Piece</th><th>Closed depth</th><th>Projects when open</th><th>Mattress</th></tr></thead><tbody>
<tr><td>Queen wall bed (vertical)</td><td class="num">18 in</td><td class="num">68 in more</td><td class="num">60 × 80 in</td></tr>
<tr><td>Full wall bed (vertical)</td><td class="num">18 in</td><td class="num">63 in more</td><td class="num">53 × 75 in</td></tr>
<tr><td>Sofa bed</td><td class="num">36 in</td><td class="num">54 in more</td><td class="num">varies</td></tr>
<tr><td>Drop-leaf table</td><td class="num">10 in</td><td class="num">20 in more</td><td class="num">–</td></tr></tbody></table></div>
<p>Mattress sizes are the U.S. standard sizes as published in <a href="https://casper.com/mattress-size-comparison/">Casper's size chart</a>. For the space a wall bed needs in front of it, see <a href="/guides/murphy-bed-room-size/">Murphy bed room size</a>, which also plans the same room with a wall bed and with a sofa bed.</p>
<h2 id="checks">The night-time checks that matter most</h2>
<ul><li><b>The door must still open.</b> If the open bed sits inside the swing of the entry door, the planner marks it red. A bed that blocks the only exit is a safety problem, not just an inconvenience.</li>
<li><b>A route to the bed and the window.</b> At night you want to reach the bed without climbing over furniture, and the window should stay reachable.</li>
<li><b>Bedside space.</b> The open bed carries a 24 in walk-through zone at its foot by default; reduce it if you accept a tighter squeeze.</li>
<li><b>Nothing left under the bed.</b> Pieces marked “day only” disappear at night; anything else in the bed's footprint is a conflict.</li></ul>`,
    faq: [
      ['How much room does a queen wall bed need when it is open?', 'Roughly 86 in from the wall (about 18 in cabinet plus the open bed) for a vertical queen, plus whatever space you want to walk past its foot. Check the manufacturer sheet for your model.'],
      ['Can I use it for a normal room without fold-away furniture?', 'Yes, but the Clearance Planner is simpler for that because it shows a single plan.'],
      ['Is the plan shared with the Clearance Planner?', 'No. Each tool keeps its own plan in your browser so that you can work on both. Use JSON export and import to move a plan between them.']
    ],
    sources: [['Casper mattress size comparison (U.S. mattress sizes)', 'https://casper.com/mattress-size-comparison/'], ['2010 ADA Standards, §403.5.1 Clear Width', 'https://www.access-board.gov/ada/chapter/ch04/']]
  },
  {
    path: '/tools/storage-wall/', short: 'Storage Wall Audit', script: 'storage.js', updated: true,
    title: 'Storage Wall Audit: Shelf Volume by Reach Height',
    description: 'Draw a storage wall, add shelves and cabinets and see how much volume sits within easy reach (15–48 in), above it and below it – plus an equal-compartment divider calculator.',
    h1: 'Storage Wall Audit', lede: 'How much of your storage can you actually reach? Draw the wall, add the units, and the audit splits their volume into three bands: below 15 in, 15–48 in, and above 48 in – the reach range from the ADA Standards.',
    app: storageApp,
    body: `<h2 id="bands">Why three bands</h2>
<p>Section 308 of the <a href="${ADA}#ada-308_2_1">2010 ADA Standards</a> sets the unobstructed reach range for forward and side reach at 15 in minimum and 48 in maximum above the floor (§308.2.1 and §308.3.1). That is an accessibility minimum for unobstructed reach, written for wheelchair users; over an obstruction the high limit drops to 44 in (forward, reach depth over 20 in, §308.2.2) or 46 in (side, over 10 in, §308.3.2). The audit uses the band as a planning line, not as a reach guarantee. Above 48 in most adults can still reach, but less comfortably and not over a deep obstruction; below 15 in you bend or kneel.</p>
<p>The audit computes the gross volume of each unit (width × depth × height) and splits it at 15 and 48 in. It sorts volume by height only: obstacles in front of a unit, shelf depth and whether the back of a deep shelf is reachable are <b>not checked</b>. It does not subtract shelf thickness or drawer boxes either, so treat the figures as a comparison between arrangements rather than as a capacity a manufacturer would quote. The value of the tool is in seeing the <em>share</em>: a wall where 60 % of the volume sits above 48 in is a wall for suitcases and seasonal things, not for everyday use.</p>
<h2 id="divider">Equal compartments</h2>
<p>The divider calculator below the unit settings was previously a separate site, Shelf Measure. It divides an inside opening into equal clear compartments: clear width = (opening − dividers × thickness) ÷ compartments. It also lists where to mark the left edge of each divider, measured from the left inside face. Typical board thicknesses are 3/4 in (19 mm) for plywood and 5/8 in (16 mm) for melamine shelving.</p>
<h2 id="how">How to use the audit</h2>
<ol><li>Measure the wall: width between corners or obstructions, and the ceiling height.</li>
<li>For each unit, enter its distance from the left, width, bottom and top height above the floor, and inside depth. Wall shelves start at their mounting height.</li>
<li>List the shelf heights above the floor so the drawing shows them; the volume does not depend on them.</li>
<li>Move units and shelves until the everyday band holds what you use every day – see the <a href="/guides/vertical-storage-by-reach/">guide to vertical storage by reach</a>.</li>
<li>“Export CSV” saves one line per unit with its position, size and volume in each band, in the unit shown on screen, for a spreadsheet or a carpenter. “Print” prints the elevation and the table.</li></ol>`,
    faq: [
      ['What do 15 and 48 inches mean?', 'They are the low and high limits of the unobstructed reach range in ADA 2010 §308.2.1 (forward reach) and §308.3.1 (side reach): 15 in minimum and 48 in maximum above the floor.'],
      ['Are the volumes usable capacity?', 'No, they are gross volumes of the unit outlines. They are best used to compare layouts.'],
      ['Can I enter centimeters?', 'Yes, switch to cm. Volumes are then shown in liters.']
    ],
    sources: [['2010 ADA Standards, §308.2.1 and §308.3.1 Unobstructed reach', ADA + '#ada-308_2_1']]
  }
];
