/* Clearance & dimension reference: every row is a figure read in the cited primary document.
   Shared by the build (static table) and the browser (filter, search, CSV). No DOM access here.
   `conv` names the column that is OUR conversion (the document gives only the other unit):
   'met' = metric converted from inches (× 25.4), 'imp' = inches converted from millimetres (÷ 25.4). */
import { csvLine, csvFile } from './csv.js';
export const RETRIEVED = '2026-11-18';

export const SOURCES = {
  ada: {
    short: 'ADA 2010', name: '2010 ADA Standards for Accessible Design', publisher: 'U.S. Department of Justice / U.S. Access Board',
    url: 'https://www.access-board.gov/ada/', anchor: (s) => '#ada-' + s.replace(/\./g, '_'),
    kind: 'Accessibility standard (US)', region: 'US',
    scope: 'Applies to places of public accommodation, commercial facilities and state and local government facilities. Private homes are generally outside it; this site uses its figures as reference lines, not as a compliance test.'
  },
  nkbaK: {
    short: 'NKBA Kitchen', name: 'NKBA Kitchen Planning Guidelines with Access Standards', publisher: 'National Kitchen & Bath Association',
    url: 'https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',
    kind: 'Industry guideline (US)', region: 'US',
    scope: 'Recommendations of a trade association, not law. Where the document quotes a code minimum, it says its code references are based on the 2015 International Residential Code and International Plumbing Code; the edition in force where you live may differ.'
  },
  nkbaB: {
    short: 'NKBA Bath', name: 'NKBA Bathroom Planning Guidelines with Access Standards', publisher: 'National Kitchen & Bath Association',
    url: 'https://kb.nkba.org/uploads/2022/05/Bath-Planning-Guidelines.pdf',
    kind: 'Industry guideline (US)', region: 'US',
    scope: 'Recommendations of a trade association, not law. Rows marked “code minimum as cited by NKBA” repeat the 2015 IRC/IPC figure quoted in the guideline; we did not read the code itself.'
  },
  hud: {
    short: '24 CFR 3280', name: 'Manufactured Home Construction and Safety Standards, 24 CFR Part 3280, Subpart B (edition revised as of April 1, 2024)', publisher: 'U.S. Department of Housing and Urban Development',
    url: 'https://www.govinfo.gov/content/pkg/CFR-2024-title24-vol5/pdf/CFR-2024-title24-vol5-part3280.pdf',
    kind: 'Federal regulation (US)', region: 'US',
    scope: 'Binding only for factory-built manufactured homes. Useful as the smallest room and passage sizes a US federal housing standard accepts; it does not apply to site-built houses or apartments.'
  },
  ndss: {
    short: 'NDSS (England)', name: 'Technical housing standards – nationally described space standard (published 27 March 2015, notes added 19 May 2016)', publisher: 'UK Government (GOV.UK, statutory guidance)',
    url: 'https://www.gov.uk/government/publications/technical-housing-standards-nationally-described-space-standard/technical-housing-standards-nationally-described-space-standard',
    kind: 'Government space standard (England)', region: 'UK',
    scope: 'Applies to new dwellings in England only where a local authority has adopted it in its Local Plan. The document states that its bedroom and storage figures “have no other statutory meaning or use”.'
  },
  adm: {
    short: 'Approved Doc M', name: 'Approved Document M, Volume 1: Dwellings (2015 edition incorporating 2016 amendments)', publisher: 'UK Government (HM Government, Building Regulations 2010)',
    url: 'https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m',
    kind: 'Building regulations guidance (England)', region: 'UK',
    scope: 'Guidance for new dwellings in England. Category M4(1) “visitable” is the default; M4(2) “accessible and adaptable” and M4(3) “wheelchair user” are optional requirements that apply only where a planning condition imposes them.'
  }
};

/* Conversions. A converted minimum is rounded UP and a converted maximum DOWN, so the converted figure never
   understates the document; sizes that are neither (furniture, ranges of products) go to the nearest step. */
const up = (v, d) => Math.ceil(+(v * 10 ** d).toFixed(6)) / 10 ** d, down = (v, d) => Math.floor(+(v * 10 ** d).toFixed(6)) / 10 ** d;
const mm = (inch) => `${up(inch * 25.4, 0)} mm`;            // minimum given in inches
const mmMax = (inch) => `${down(inch * 25.4, 0)} mm`;       // maximum given in inches
const inch = (millis) => `${up(millis / 25.4, 2)} in`;      // minimum given in millimetres
const inchMax = (millis) => `${down(millis / 25.4, 2)} in`; // maximum given in millimetres
const inchSize = (millis) => `${+(millis / 25.4).toFixed(1)} in`; // a size, not a limit
const sqft = (m2) => `${up(m2 / 0.09290304, 1)} sq ft`;
const m2 = (ft2) => `${up(ft2 * 0.09290304, 2)} m²`;
// rows: [id, topic, what, imperial, metric, source, section, note, conv]
const rows = [
  // ---- walkways and halls
  ['ada-walk', 'Walkways & halls', 'Clear width of a walking surface on an accessible route', '36 in', '915 mm', 'ada', '403.5.1', 'Minimum. The reference line used by the tools on this site.'],
  ['ada-pinch', 'Walkways & halls', 'Permitted narrowing of that walking surface', '32 in for at most 24 in of length', '815 mm for at most 610 mm', 'ada', '403.5.1', 'Exception: reduced segments must be separated by segments at least 48 in (1220 mm) long and 36 in wide.'],
  ['ada-uturn', 'Walkways & halls', '180° turn around an element less than 48 in wide', '42 in approaching, 48 in at the turn, 42 in leaving', '1065 / 1220 / 1065 mm', 'ada', '403.5.2', 'Not required where the clear width at the turn is 60 in (1525 mm) or more.'],
  ['ada-protrude', 'Walkways & halls', 'How far an object between 27 and 80 in above the floor may protrude into a circulation path', '4 in', '100 mm', 'ada', '307.2', 'Maximum. Relevant for wall shelves and cabinets beside a route.'],
  ['ada-headroom', 'Walkways & halls', 'Vertical clearance along a circulation path', '80 in', '2030 mm', 'ada', '307.4', 'Minimum.'],
  ['nkba-walkway', 'Walkways & halls', 'Kitchen walkway (a route where nobody works)', '36 in', '914 mm', 'nkbaK', 'Guideline 7', 'Recommended minimum. Access standard: where two walkways are perpendicular, one should be at least 42 in (1067 mm).'],
  ['hud-hall', 'Walkways & halls', 'Hallway in a manufactured home, finished wall to finished wall', '28 in', mm(28), 'hud', '§ 3280.112', 'Minimum horizontal dimension. Minor protrusions by doorknobs, trim, smoke alarms or light fixtures are permitted.', 'met'],
  ['adm-hall1', 'Walkways & halls', 'Corridor where a localised obstruction (e.g. a radiator) narrows it – visitable dwelling', inch(750), '750 mm', 'adm', 'M4(1) 1.15b', 'The corridor may not be reduced below this at any point; the obstruction may be at most 2 m long and not opposite or close to a doorway.', 'imp'],
  ['adm-hall2', 'Walkways & halls', 'Hall or landing – accessible and adaptable dwelling', inch(900), '900 mm', 'adm', 'M4(2) 2.22a', 'Minimum clear width; localised obstructions may reduce it to 750 mm (2.22b).', 'imp'],
  ['adm-hall3', 'Walkways & halls', 'Hallway, approach or landing – wheelchair user dwelling', inch(1050), '1050 mm', 'adm', 'M4(3) 3.24a', 'Minimum clear width; 1200 mm where the approach to a doorway is not head-on (3.24b).', 'imp'],
  // ---- doors
  ['ada-door', 'Doors', 'Clear width of a door opening', '32 in', '815 mm', 'ada', '404.2.3', 'Minimum, measured between the face of the door and the stop with the door open 90°. Openings more than 24 in deep need 36 in.'],
  ['ada-threshold', 'Doors', 'Threshold height at a doorway', '1/2 in', '13 mm', 'ada', '404.2.5', 'Maximum. Existing or altered thresholds may be 3/4 in (19 mm) with a bevelled edge on each side.'],
  ['ada-hardware', 'Doors', 'Height of door handles, pulls, latches and locks', '34–48 in', '865–1220 mm', 'ada', '404.2.7', 'Above the finish floor.'],
  ['nkba-door', 'Doors', 'Clear opening of a kitchen or bathroom doorway', '32 in (needs a 2 ft 10 in door)', '813 mm (864 mm door)', 'nkbaK', 'Guideline 1', 'Recommended. Same figure in Bathroom Guideline 1, which allows a 2 ft 0 in (610 mm) door where the existing structure cannot be changed.'],
  ['hud-extdoor', 'Doors', 'Exterior swinging door of a manufactured home, clear opening', '28 in wide × 74 in high', `${mm(28)} × ${mm(74)}`, 'hud', '§ 3280.105(b)(2)', 'Minimum. Door seals may reduce it by up to 1 in. Sliding glass doors: 28 × 72 in.', 'met'],
  ['hud-intdoor', 'Doors', 'Interior swinging door of a manufactured home, clear opening', '27 in', mm(27), 'hud', '§ 3280.108(c)', 'Minimum. Closet and pantry doors are excepted; bathroom doors in single-section homes may be 23 in (§ 3280.111(b)).', 'met'],
  ['adm-door-head', 'Doors', 'Internal door approached head-on from a 900 mm corridor', inch(750), '750 mm', 'adm', 'M4(1) Table 1.1 / M4(2) Table 2.1', 'Minimum clear opening width.', 'imp'],
  ['adm-door-side', 'Doors', 'Internal door not approached head-on: door width needed for a given corridor width', `${inch(750)} door / ${inch(1200)} corridor · ${inch(775)} / ${inch(1050)} · ${inch(800)} / ${inch(900)}`, '750 mm door needs 1200 mm corridor · 775 mm needs 1050 mm · 800 mm needs 900 mm', 'adm', 'M4(1) Table 1.1 / M4(2) Table 2.1', 'A standard 826 mm door leaf up to 44 mm thick is deemed to give a 775 mm clear opening.', 'imp'],
  ['adm-door3', 'Doors', 'Every door in a wheelchair user dwelling', inch(850), '850 mm', 'adm', 'M4(3) 3.24d', 'Minimum clear opening width, irrespective of the direction of approach.', 'imp'],
  // ---- turning and floor space
  ['ada-turn', 'Turning & floor space', 'Wheelchair turning space, circular', '60 in diameter', '1525 mm', 'ada', '304.3.1', 'Minimum. May include knee and toe clearance.'],
  ['ada-tturn', 'Turning & floor space', 'Wheelchair turning space, T-shaped', 'within a 60 in square, arms and base 36 in wide', '1525 mm square, 915 mm arms', 'ada', '304.3.2', 'Minimum.'],
  ['ada-floor', 'Turning & floor space', 'Clear floor space for one wheelchair', '30 × 48 in', '760 × 1220 mm', 'ada', '305.3', 'Minimum.'],
  ['adm-turn', 'Turning & floor space', 'Manoeuvring square and turning circle used in the furniture schedule', `${inch(1200)} square · ${inch(1500)} circle`, '1200 × 1200 mm · 1500 mm diameter (or 1400 × 1700 mm ellipse)', 'adm', 'Appendix D', 'Used to show that a dwelling layout complies.', 'imp'],
  // ---- reach and heights
  ['ada-reach', 'Reach & heights', 'Unobstructed forward or side reach', '15 in low, 48 in high', '380 mm, 1220 mm', 'ada', '308.2.1', 'Above the finish floor; side reach in 308.3.1. The band used by the Storage Wall Audit.'],
  ['ada-reach-fwd', 'Reach & heights', 'High forward reach over an obstruction more than 20 in deep', '44 in', '1120 mm', 'ada', '308.2.2', 'Maximum; the reach depth may be at most 25 in (635 mm).'],
  ['ada-reach-side', 'Reach & heights', 'High side reach over an obstruction more than 10 in deep', '46 in', '1170 mm', 'ada', '308.3.2', 'Maximum; obstruction at most 34 in high and 24 in deep.'],
  ['ada-shelf', 'Reach & heights', 'Shelves in dressing, fitting and locker rooms', '40–48 in', '1015–1220 mm', 'ada', '803.5', 'Above the finish floor; coat hooks within the reach ranges of 308.'],
  ['ada-surface', 'Reach & heights', 'Top of an accessible dining or work surface', '28–34 in', '710–865 mm', 'ada', '902.3', 'Above the finish floor.'],
  ['ada-bench', 'Reach & heights', 'Bench seat (dressing and locker rooms)', '17–19 in high, 20–24 in deep, at least 42 in long', '430–485 mm high, 510–610 mm deep, 1065 mm long', 'ada', '903.5', 'Size in 903.3. A reference for a bench you sit on to put on shoes.'],
  ['ada-knee', 'Reach & heights', 'Knee clearance zone under a table or counter', '9–27 in above the floor', '230–685 mm', 'ada', '306.3.1', 'Space in this height range under an element counts as knee clearance.'],
  ['adm-switch', 'Reach & heights', 'Centre line of switches and sockets in habitable rooms', `${inch(450)}–${inchMax(1200)}`, '450–1200 mm', 'adm', 'M4(1) 1.18a', 'Above floor level. M4(2) 2.30b adds: at least 300 mm from an inside corner.', 'imp'],
  ['adm-window', 'Reach & heights', 'Window handle in the principal living area', `${inch(450)}–${inchMax(1200)}`, '450–1200 mm', 'adm', 'M4(2) 2.30c', 'Above floor level; other windows up to 1400 mm (2.30d).', 'imp'],
  ['hud-window', 'Reach & heights', 'Bottom of an egress window opening in a manufactured-home bedroom', '36 in', mmMax(36), 'hud', '§ 3280.106(b)', 'Maximum above the floor; latches and handles needed to exit at most 54 in (§ 3280.106(c)).', 'met'],
  // ---- bedrooms
  ['adm-bed-route', 'Bedrooms', 'Clear access route from the bedroom door to the window', inch(750), '750 mm', 'adm', 'M4(2) 2.25a', 'Minimum width, every bedroom.', 'imp'],
  ['adm-bed-principal', 'Bedrooms', 'Clear access zone around the bed in the principal double bedroom', `${inch(750)} on both sides and at the foot`, '750 mm on both sides and at the foot', 'adm', 'M4(2) 2.25b', 'Minimum. Diagram 2.4 allows bedside furniture inside the side zones.', 'imp'],
  ['adm-bed-other', 'Bedrooms', 'Clear access zone in every other double bedroom', `${inch(750)} on one side and at the foot`, '750 mm on one side and at the foot', 'adm', 'M4(2) 2.25c', 'Minimum. Single and twin bedrooms: 750 mm on one side of each bed (2.25d).', 'imp'],
  ['adm-bed-wheel', 'Bedrooms', 'Clear access zone around the bed in a wheelchair user dwelling', `${inch(1000)}`, '1000 mm', 'adm', 'M4(3) 3.35e–h', 'Both sides and foot of the principal bed and in front of all furniture; one side and foot in other double bedrooms.', 'imp'],
  ['ndss-single', 'Bedrooms', 'Single bedroom (one bedspace)', `${sqft(7.5)}, at least ${inch(2150)} wide`, '7.5 m², at least 2.15 m wide', 'ndss', 'para 10c', 'Minimum floor area and width.', 'imp'],
  ['ndss-double', 'Bedrooms', 'Double or twin bedroom (two bedspaces)', `${sqft(11.5)}; one at least ${inch(2750)} wide, others ${inch(2550)}`, '11.5 m²; one at least 2.75 m wide, every other 2.55 m', 'ndss', 'para 10d–e', 'Minimum floor area and width.', 'imp'],
  ['adm-bed3-size', 'Bedrooms', 'Bedrooms in a wheelchair user dwelling', `principal double ${sqft(13.5)} and ${inch(3000)} wide; single ${sqft(8.5)} and ${inch(2400)} wide`, 'principal double 13.5 m² and 3 m wide; other double 12.5 m² and 3 m; single 8.5 m² and 2.4 m', 'adm', 'M4(3) 3.35d, f, i', 'Minimum, clear of obstructions such as radiators.', 'imp'],
  ['hud-bedroom', 'Bedrooms', 'Bedroom in a manufactured home', '50 sq ft; 70 sq ft for two people', `${m2(50)}; ${m2(70)}`, 'hud', '§ 3280.109(b)', 'Minimum gross floor area; plus 50 sq ft for each person in excess of two.', 'met'],
  ['hud-closet', 'Bedrooms', 'Clothes hanging space in every manufactured-home bedroom', '22 in inside depth', mm(22), 'hud', '§ 3280.109(c)', 'Minimum, with a rod and a shelf.', 'met'],
  // ---- room sizes and ceilings
  ['ndss-1p', 'Room size & ceilings', 'Whole dwelling for one person, one storey (1b1p)', `${sqft(39)} (${sqft(37)} with a shower room instead of a bathroom)`, '39 m² (37 m²)', 'ndss', 'Table 1', 'Minimum gross internal area, including 1.0 m² of built-in storage.', 'imp'],
  ['ndss-2p', 'Room size & ceilings', 'Whole dwelling for two people, one storey (1b2p)', sqft(50), '50 m²', 'ndss', 'Table 1', 'Minimum gross internal area, including 1.5 m² of built-in storage.', 'imp'],
  ['ndss-ceiling', 'Room size & ceilings', 'Floor-to-ceiling height', inch(2300), '2.3 m for at least 75 % of the gross internal area', 'ndss', 'para 10i', 'Minimum.', 'imp'],
  ['ndss-headroom', 'Room size & ceilings', 'Floor area under low headroom', `under ${inchMax(1500)}: not counted`, 'under 1.5 m: not counted unless used solely for storage', 'ndss', 'para 10f–g', 'Storage-only areas with 900–1500 mm headroom count at 50 %; below 900 mm not at all.', 'imp'],
  ['hud-living', 'Room size & ceilings', 'Living area of a manufactured home', '150 sq ft', m2(150), 'hud', '§ 3280.109(a)', 'At least one living area of this gross floor area.', 'met'],
  ['hud-mindim', 'Room size & ceilings', 'Smallest horizontal dimension of a required room area', '5 ft', '1524 mm', 'hud', '§ 3280.110', 'No clear horizontal dimension of the required gross floor area may be less.', 'met'],
  ['hud-ceiling', 'Room size & ceilings', 'Ceiling height of habitable rooms and bathrooms in a manufactured home', '7 ft 0 in over at least 50 % of the floor area', `${mm(84)}`, 'hud', '§ 3280.104(a)', 'The rest at least 5 ft 0 in; under ducts and beams 6 ft 4 in; hallways and foyers 6 ft 6 in (§ 3280.104(b)).', 'met'],
  // ---- kitchens
  ['nkba-aisle', 'Kitchens', 'Work aisle', '42 in for one cook, 48 in for multiple cooks', '1067 mm, 1219 mm', 'nkbaK', 'Guideline 6', 'Recommended minimum, measured between counter frontage, tall cabinets and/or appliances.'],
  ['ada-galley', 'Kitchens', 'Pass-through kitchen: clearance between opposing cabinets, counters, appliances or walls', '40 in', '1015 mm', 'ada', '804.2.1', 'Minimum. U-shaped kitchens enclosed on three sides: 60 in (1525 mm), 804.2.2.'],
  ['adm-kitchen', 'Kitchens', 'Clear space in front of and between all kitchen units and appliances', inch(1200), '1200 mm', 'adm', 'M4(2) 2.24b', 'Minimum, accessible and adaptable dwellings.', 'imp'],
  ['nkba-seat-none', 'Kitchens', 'Table or counter edge to wall, nobody passes behind the seated diner', '32 in', '813 mm', 'nkbaK', 'Guideline 8', 'Recommended. Total distance – the chair is inside it.'],
  ['nkba-seat-edge', 'Kitchens', 'Table or counter edge to wall, people edge past behind the diner', '36 in', '914 mm', 'nkbaK', 'Guideline 8a', 'Recommended.'],
  ['nkba-seat-walk', 'Kitchens', 'Table or counter edge to wall, people walk past behind the diner', '44 in', '1118 mm', 'nkbaK', 'Guideline 8b', 'Recommended.'],
  ['nkba-knee', 'Kitchens', 'Knee space per seated diner', '24 in wide; 18 in deep at a 30 in table, 15 in at a 36 in counter, 12 in at a 42 in counter', '610 mm wide; 457 / 381 / 305 mm deep', 'nkbaK', 'Guideline 9', 'Recommended.'],
  ['nkba-triangle', 'Kitchens', 'Work triangle between cooking surface, sink and refrigerator', 'legs 4–9 ft each, 26 ft in total at most', '1.2–2.7 m each, 7.9 m in total', 'nkbaK', 'Guideline 3', 'Recommended; each leg measured from the centre front of the appliance or sink.'],
  ['nkba-dw', 'Kitchens', 'Dishwasher', 'within 36 in of the sink; 21 in standing space beside it', '914 mm; 533 mm', 'nkbaK', 'Guideline 13', 'Recommended; the 21 in is measured to counters, appliances or cabinets placed at a right angle.'],
  ['nkba-sink', 'Kitchens', 'Landing area beside the main sink', '24 in on one side, 18 in on the other', '610 mm, 457 mm', 'nkbaK', 'Guideline 11', 'Recommended; countertop at least 16 in (406 mm) deep.'],
  ['nkba-prep', 'Kitchens', 'Preparation area next to a sink', '36 in wide × 24 in deep', '914 × 610 mm', 'nkbaK', 'Guideline 12', 'Recommended continuous countertop.'],
  ['nkba-cook', 'Kitchens', 'Landing area beside a cooking surface', '12 in on one side, 15 in on the other', '305 mm, 381 mm', 'nkbaK', 'Guideline 17', 'Recommended.'],
  ['nkba-fridge', 'Kitchens', 'Landing area at the refrigerator', '15 in on the handle side', '381 mm', 'nkbaK', 'Guideline 16', 'Recommended; alternatively 15 in no more than 48 in (1219 mm) across from the front.'],
  ['nkba-hood', 'Kitchens', 'Clearance above a cooking surface', '24 in to a protected non-combustible surface; 30 in to combustible material', '610 mm; 762 mm', 'nkbaK', 'Guideline 18', 'The 30 in figure is the code minimum as cited by NKBA (IRC M1901.1, G2447.5); 24 in is permitted with an approved range hood.'],
  ['nkba-counter', 'Kitchens', 'Total countertop frontage', '158 in, 24 in deep', '4013 mm, 610 mm deep', 'nkbaK', 'Guideline 25', 'Recommended, with at least 15 in (381 mm) of clearance above.'],
  ['ada-kitchen-surface', 'Kitchens', 'Accessible kitchen work surface height', '34 in', '865 mm', 'ada', '804.3.2', 'Maximum; adjustable counters 29–36 in (735–915 mm).'],
  // ---- bathrooms
  ['nkba-wc-side', 'Bathrooms', 'Toilet centreline to any wall, fixture or obstacle', '18 in recommended', '457 mm', 'nkbaB', 'Guideline 20', 'Code minimum as cited by NKBA: 15 in (381 mm) (IRC R307.1, P2705.1).'],
  ['nkba-front', 'Bathrooms', 'Clear floor in front of a lavatory, toilet, bidet or tub', '30 in recommended', '762 mm', 'nkbaB', 'Guideline 4', 'Code minimum as cited by NKBA: 21 in (533 mm); 24 in (610 mm) in front of a shower entry (IRC R307.1, P2705.1.5).'],
  ['nkba-shower', 'Bathrooms', 'Shower interior', '36 × 36 in recommended', '914 × 914 mm', 'nkbaB', 'Guideline 9', 'Code minimum as cited by NKBA: 30 × 30 in or 900 sq in in which a 30 in disc fits (IRC P2708.1); entry opening at least 22 in (559 mm).'],
  ['nkba-lav', 'Bathrooms', 'Lavatory centreline to a side wall or tall obstacle', '20 in recommended', '508 mm', 'nkbaB', 'Guideline 5', 'Code minimum as cited by NKBA: 15 in (381 mm) (IRC P2705.1.5).'],
  ['nkba-lav2', 'Bathrooms', 'Two lavatories, centreline to centreline', '36 in recommended', '914 mm', 'nkbaB', 'Guideline 6', 'Code minimum as cited by NKBA: 30 in (762 mm).'],
  ['nkba-wc-room', 'Bathrooms', 'Separate toilet compartment', '36 × 66 in recommended', '914 × 1676 mm', 'nkbaB', 'Guideline 21', 'Code minimum as cited by NKBA: 30 × 60 in (762 × 1524 mm) (IPC 405.3.1).'],
  ['nkba-bath-ceiling', 'Bathrooms', 'Bathroom ceiling height', '80 in', '2032 mm', 'nkbaB', 'Guideline 3', 'Code minimum as cited by NKBA (IRC R305.1), also above a 30 × 30 in area at the shower head.'],
  ['hud-wc', 'Bathrooms', 'Toilet compartment in a manufactured home', '30 in wide, 21 in clear in front of the toilet', `${mm(30)}, ${mm(21)}`, 'hud', '§ 3280.111(a)', 'Minimum. Beside the short end of a tub, the toilet centreline may be 12 in from the tub.', 'met'],
  ['ada-wc-seat', 'Bathrooms', 'Toilet seat height in residential dwelling units', '15–19 in', '380–485 mm', 'ada', '604.4', 'Exception 2; otherwise 17–19 in.'],
  ['ada-lav-height', 'Bathrooms', 'Rim or counter of an accessible lavatory or sink', '34 in', '865 mm', 'ada', '606.3', 'Maximum above the finish floor.'],
  // ---- storage
  ['ndss-storage', 'Storage', 'Built-in storage in a new dwelling', `${sqft(1.0)} for one person, ${sqft(1.5)} for two (1b2p), ${sqft(2.0)} for a two-bedroom home`, '1.0 m², 1.5 m², 2.0 m²', 'ndss', 'Table 1', 'Minimum, included in the gross internal area; includes 0.5 m² for fixed services such as a boiler.', 'imp'],
  ['ndss-wardrobe', 'Storage', 'Built-in wardrobe that still counts as bedroom floor area', `${sqft(0.72)} in a double, ${sqft(0.36)} in a single bedroom`, '0.72 m², 0.36 m²', 'ndss', 'para 10h', 'Built-in area beyond this counts towards the storage requirement; the wardrobe may not reduce the room below its minimum width.', 'imp'],
  ['adm-storage', 'Storage', 'General built-in storage in a wheelchair user dwelling', `${sqft(1.5)} with one bedroom, ${sqft(2.0)} with two`, '1.5 m², 2.0 m² (rising 0.5 m² per bedroom to 4.0 m²)', 'adm', 'M4(3) Table 3.1', 'Minimum area.', 'imp'],
  ['nkba-storage', 'Storage', 'Kitchen shelf and drawer frontage', '1400 in for a small kitchen (under 150 sq ft)', '35,560 mm', 'nkbaK', 'Guideline 27', 'Recommended total; 1700 in for a medium kitchen. Storage more than 84 in (2134 mm) above the floor counts as miscellaneous.'],
  // ---- furniture sizes used by a regulator
  ['adm-f-double', 'Furniture sizes', 'Double bed, as assumed when checking a bedroom layout', `${inchSize(2000)} × ${inchSize(1500)} (principal) · ${inchSize(1900)} × ${inchSize(1350)} (other)`, '2000 × 1500 mm · 1900 × 1350 mm', 'adm', 'Appendix D', 'Furniture schedule: the sizes a layout drawing must show.', 'imp'],
  ['adm-f-single', 'Furniture sizes', 'Single bed', `${inchSize(1900)} × ${inchSize(900)}`, '1900 × 900 mm', 'adm', 'Appendix D', 'Furniture schedule.', 'imp'],
  ['adm-f-bedroom', 'Furniture sizes', 'Bedside table · chest of drawers · double wardrobe · desk and chair', `${inchSize(400)} sq · ${inchSize(450)} × ${inchSize(750)} · ${inchSize(600)} × ${inchSize(1200)} · ${inchSize(500)} × ${inchSize(1050)}`, '400 × 400 · 450 × 750 · 600 × 1200 · 500 × 1050 mm', 'adm', 'Appendix D', 'Furniture schedule.', 'imp'],
  ['adm-f-living', 'Furniture sizes', 'Armchair · two-seat settee · three-seat settee · coffee table', `${inchSize(850)} sq · ${inchSize(850)} × ${inchSize(1300)} · ${inchSize(850)} × ${inchSize(1850)} · ${inchSize(500)} × ${inchSize(1050)}`, '850 × 850 · 850 × 1300 · 850 × 1850 · 500 × 1050 mm', 'adm', 'Appendix D', 'Furniture schedule; the coffee table may instead be 750 mm in diameter.', 'imp'],
  ['adm-f-dining', 'Furniture sizes', 'Dining table for 2 / 4 / 6 bedspaces', `${inchSize(800)} × ${inchSize(800)} / ${inchSize(1200)} / ${inchSize(1500)}`, '800 × 800 / 800 × 1200 / 800 × 1500 mm', 'adm', 'Appendix D', 'Furniture schedule: 800 mm deep, length by number of bedspaces (3: 1000, 5: 1350, 7: 1650 mm).', 'imp'],
  ['adm-f-bath', 'Furniture sizes', 'WC with cistern · bath · wash hand basin', `${inchSize(500)} × ${inchSize(700)} · ${inchSize(700)} × ${inchSize(1700)} · ${inchSize(600)} × ${inchSize(450)}`, '500 × 700 · 700 × 1700 · 600 × 450 mm', 'adm', 'Appendix D', 'Furniture schedule.', 'imp'],
  // ---- stairs
  ['hud-stair', 'Stairs', 'Stairway built into a manufactured home', '36 in clear width', mm(36), 'hud', '§ 3280.114(a)(2)', 'Minimum above handrail height; at and below the handrail 31½ in with one handrail, 27 in with two.', 'met'],
  ['adm-stair', 'Stairs', 'Stair from the entrance storey – accessible and adaptable dwelling', inch(850), '850 mm', 'adm', 'M4(2) 2.23c', 'Minimum clear width, measured 450 mm above the pitch line, so that a stair-lift can be fitted.', 'imp']
];

export const REFERENCE = rows.map(([id, topic, what, imp, met, src, sec, note = '', conv = '']) => ({ id, topic, what, imp, met, src, sec, note, conv }));
export const TOPICS = [...new Set(REFERENCE.map(r => r.topic))];
export const refById = Object.fromEntries(REFERENCE.map(r => [r.id, r]));
export const refUrl = (r) => { const s = SOURCES[r.src]; return s.url + (s.anchor && /^\d/.test(r.sec) ? s.anchor(r.sec) : ''); };

/* ---- filter (pure) ---- */
export function filterRows(list, { q = '', topic = '', src = '', region = '' } = {}) {
  const words = String(q).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  return list.filter(r => {
    if (topic && r.topic !== topic) return false;
    if (src && r.src !== src) return false;
    if (region && SOURCES[r.src].region !== region) return false;
    if (!words.length) return true;
    const hay = `${r.what} ${r.imp} ${r.met} ${r.sec} ${r.note} ${r.topic} ${SOURCES[r.src].short} ${SOURCES[r.src].name}`.toLowerCase();
    return words.every(w => hay.includes(w));
  });
}

/* ---- CSV of the given rows (cells are neutralised in csv.js) ---- */
export function referenceCsv(list) {
  const head = ['Topic', 'Measurement', 'Imperial', 'Metric', 'Converted by this site', 'Source', 'Section', 'Note', 'Source URL', 'Retrieved'];
  return csvFile([csvLine(head), ...list.map(r => csvLine([r.topic, r.what, r.imp, r.met, r.conv === 'met' ? 'metric column' : r.conv === 'imp' ? 'imperial column' : 'no', SOURCES[r.src].name, r.sec, r.note, refUrl(r), RETRIEVED]))]);
}
