/* Measured Layout Library. Every plan is in inches, origin = top-left inside wall face.
   They are worked examples drawn for this site, not copies of any real listing. */
const bs = (d = 24) => [{ side: 'E', depth: d, kind: 'bedside', walk: true }, { side: 'W', depth: d, kind: 'bedside', walk: true }];
const chair = (side = 'S', d = 32) => [{ side, depth: d, kind: 'chair' }];
const leg = (side = 'S') => [{ side, depth: 18, kind: 'legroom' }];

export const LAYOUTS = [
  {
    slug: 'studio-20x15-queen-corner', title: '20 × 15 ft studio, queen bed in the far corner', short: 'Corner queen studio',
    room: { W: 240, D: 180 }, kind: 'studio',
    doors: [{ id: 'entry', label: 'entry door', wall: 'S', offset: 12, width: 32, hinge: 'start', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'N', offset: 60, width: 72 }],
    items: [
      { id: 'bed', label: 'Queen bed', x: 180, y: 0, w: 60, d: 80, target: true, zones: [{ side: 'W', depth: 24, kind: 'bedside', walk: true }, { side: 'S', depth: 24, kind: 'foot', walk: true }] },
      { id: 'ns', label: 'Nightstand', x: 222, y: 104, w: 18, d: 16 },
      { id: 'sofa', label: 'Sofa', x: 0, y: 0, w: 36, d: 78, zones: [{ side: 'E', depth: 18, kind: 'legroom' }] },
      { id: 'coffee', label: 'Coffee table', x: 54, y: 19, w: 20, d: 40 },
      { id: 'tv', label: 'TV unit', x: 110, y: 12, w: 16, d: 55 },
      { id: 'desk', label: 'Desk', x: 198, y: 158, w: 42, d: 22, target: true, zones: chair('N') },
      { id: 'dresser', label: 'Dresser', x: 110, y: 162, w: 40, d: 18, zones: [{ side: 'N', depth: 18, kind: 'drawer' }] }
    ]
  },
  {
    slug: 'studio-18x14-full-alcove', title: '18 × 14 ft studio, full bed in a sleeping alcove', short: 'Full-bed alcove studio',
    room: { W: 216, D: 168 }, kind: 'studio',
    doors: [{ id: 'entry', label: 'entry door', wall: 'S', offset: 92, width: 32, hinge: 'end', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'W', offset: 50, width: 60 }],
    items: [
      { id: 'bed', label: 'Full bed', x: 163, y: 0, w: 53, d: 75, target: true, zones: [{ side: 'W', depth: 24, kind: 'bedside', walk: true }] },
      { id: 'shelf', label: 'Bookshelf (divider)', x: 104, y: 0, w: 12, d: 62 },
      { id: 'sofa', label: 'Loveseat', x: 0, y: 0, w: 60, d: 34, zones: leg('S') },
      { id: 'coffee', label: 'Coffee table', x: 10, y: 56, w: 40, d: 20 },
      { id: 'table', label: 'Table for 2', x: 0, y: 116, w: 30, d: 30, zones: [{ side: 'E', depth: 32, kind: 'chair' }] },
      { id: 'desk', label: 'Small desk', x: 198, y: 100, w: 18, d: 32, target: true, zones: [{ side: 'W', depth: 32, kind: 'chair' }] }
    ]
  },
  {
    slug: 'studio-22x12-long-narrow', title: '22 × 12 ft long, narrow studio in three zones', short: 'Long narrow studio',
    room: { W: 264, D: 144 }, kind: 'studio',
    doors: [{ id: 'entry', label: 'entry door', wall: 'W', offset: 100, width: 32, hinge: 'end', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'E', offset: 36, width: 72 }],
    items: [
      { id: 'bed', label: 'Queen bed', x: 184, y: 0, w: 80, d: 60, target: true, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true }] },
      { id: 'sofa', label: 'Sofa', x: 70, y: 0, w: 78, d: 36, zones: leg('S') },
      { id: 'coffee', label: 'Coffee table', x: 89, y: 58, w: 40, d: 20 },
      { id: 'desk', label: 'Desk', x: 0, y: 0, w: 42, d: 22, target: true, zones: chair('S') },
      { id: 'tv', label: 'TV unit', x: 81, y: 128, w: 55, d: 16 },
      { id: 'wardrobe', label: 'Wardrobe', x: 200, y: 120, w: 40, d: 24, zones: [{ side: 'N', depth: 20, kind: 'door swing' }] }
    ]
  },
  {
    slug: 'studio-15x15-wall-bed', title: '15 × 15 ft studio with a queen wall bed', short: 'Wall-bed studio',
    room: { W: 180, D: 180 }, kind: 'studio', states: ['day', 'night'],
    doors: [{ id: 'entry', label: 'entry door', wall: 'S', offset: 140, width: 32, hinge: 'end', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'E', offset: 40, width: 60 }],
    items: [
      { id: 'wb', label: 'Queen wall bed', x: 0, y: 0, w: 66, d: 18, target: true, ext: { state: 'night', side: 'S', depth: 68 }, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] },
      { id: 'sofa', label: 'Loveseat', x: 0, y: 118, w: 34, d: 60, zones: [{ side: 'E', depth: 18, kind: 'legroom' }] },
      { id: 'coffee', label: 'Coffee table', x: 0, y: 50, w: 40, d: 20, only: 'day' },
      { id: 'table', label: 'Table for 2', x: 112, y: 0, w: 30, d: 30, target: true, zones: [{ side: 'S', depth: 32, kind: 'chair' }] },
      { id: 'shelf', label: 'Bookshelf', x: 168, y: 110, w: 12, d: 31 }
    ]
  },
  {
    slug: 'studio-16x20-kitchen-wall', title: '16 × 20 ft studio with a kitchen wall', short: 'Studio with kitchen wall',
    room: { W: 192, D: 240 }, kind: 'studio',
    doors: [{ id: 'entry', label: 'entry door', wall: 'S', offset: 150, width: 32, hinge: 'end', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'N', offset: 40, width: 72 }],
    items: [
      { id: 'kitchen', label: 'Kitchen run', x: 167, y: 0, w: 25, d: 120, zones: [{ side: 'W', depth: 42, kind: 'work aisle', walk: true }] },
      { id: 'bed', label: 'Full bed', x: 0, y: 0, w: 53, d: 75, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }] },
      { id: 'table', label: 'Table for 2', x: 0, y: 128, w: 30, d: 30, target: true, zones: [{ side: 'E', depth: 32, kind: 'chair' }] },
      { id: 'sofa', label: 'Sofa', x: 0, y: 204, w: 78, d: 36, zones: [{ side: 'N', depth: 18, kind: 'legroom' }] },
      { id: 'shelf', label: 'Bookshelf', x: 92, y: 228, w: 31, d: 12 }
    ]
  },
  {
    slug: 'studio-24x14-sofa-bed', title: '24 × 14 ft studio with a sofa bed and no separate bed', short: 'Sofa-bed studio',
    room: { W: 288, D: 168 }, kind: 'studio', states: ['day', 'night'],
    doors: [{ id: 'entry', label: 'entry door', wall: 'S', offset: 20, width: 32, hinge: 'start', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'N', offset: 100, width: 48 }],
    items: [
      { id: 'sb', label: 'Sofa bed', x: 150, y: 0, w: 78, d: 36, target: true, ext: { state: 'night', side: 'S', depth: 54 }, zones: [{ side: 'S', depth: 18, kind: 'legroom', state: 'day' }, { side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] },
      { id: 'coffee', label: 'Coffee table', x: 169, y: 70, w: 40, d: 20, only: 'day' },
      { id: 'desk', label: 'Desk', x: 0, y: 0, w: 42, d: 22, target: true, zones: chair('S') },
      { id: 'shelf', label: 'Bookshelf', x: 62, y: 0, w: 31, d: 12 },
      { id: 'table', label: 'Table for 4', x: 240, y: 110, w: 48, d: 30, zones: [{ side: 'N', depth: 32, kind: 'chair' }] },
      { id: 'tv', label: 'TV unit', x: 162, y: 152, w: 55, d: 16 }
    ]
  },
  {
    slug: 'bedroom-12x10-queen', title: '12 × 10 ft bedroom with a queen bed on the long wall', short: '12×10 queen bedroom',
    room: { W: 144, D: 120 }, kind: 'bedroom',
    doors: [{ id: 'entry', label: 'bedroom door', wall: 'S', offset: 102, width: 30, hinge: 'end', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'E', offset: 30, width: 48 }],
    items: [
      { id: 'bed', label: 'Queen bed', x: 0, y: 30, w: 80, d: 60, target: true, zoneIgnore: ['ns1', 'ns2'],
        zones: [{ side: 'N', depth: 24, kind: 'bedside', walk: true }, { side: 'S', depth: 24, kind: 'bedside', walk: true }] },
      { id: 'ns1', label: 'Nightstand', x: 0, y: 10, w: 16, d: 18 },
      { id: 'ns2', label: 'Nightstand', x: 0, y: 92, w: 16, d: 18 },
      { id: 'dresser', label: 'Dresser', x: 90, y: 0, w: 40, d: 18, zones: [{ side: 'S', depth: 18, kind: 'drawer' }] }
    ]
  },
  {
    slug: 'bedroom-12x10-full-desk', title: '12 × 10 ft bedroom with a full bed and a desk', short: '12×10 full + desk',
    room: { W: 144, D: 120 }, kind: 'bedroom',
    doors: [{ id: 'entry', label: 'bedroom door', wall: 'S', offset: 6, width: 30, hinge: 'start', swing: 'in', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'E', offset: 14, width: 40 }],
    items: [
      { id: 'bed', label: 'Full bed', x: 69, y: 67, w: 75, d: 53, target: true, zones: [{ side: 'N', depth: 22, kind: 'bedside', walk: true }] },
      { id: 'desk', label: 'Desk', x: 0, y: 0, w: 42, d: 22, target: true, zones: chair('S') },
      { id: 'dresser', label: 'Dresser', x: 56, y: 0, w: 40, d: 18, zones: [{ side: 'S', depth: 18, kind: 'drawer' }] },
      { id: 'shelf', label: 'Bookshelf', x: 113, y: 0, w: 31, d: 12 }
    ]
  },
  {
    slug: 'galley-kitchen-8x12', title: '8 × 12 ft galley kitchen with a dishwasher', short: 'Galley kitchen',
    room: { W: 96, D: 144 }, kind: 'kitchen',
    doors: [{ id: 'entry', label: 'kitchen opening', wall: 'S', offset: 32, width: 32, hinge: 'start', swing: 'none', entry: true }],
    windows: [{ id: 'win', label: 'Window', wall: 'N', offset: 24, width: 48 }],
    items: [
      { id: 'runA', label: 'Counter + sink', x: 0, y: 0, w: 25, d: 120, target: true },
      { id: 'dw', label: 'Dishwasher', x: 0, y: 66, w: 25, d: 24, zones: [{ side: 'E', depth: 26, kind: 'open door', walk: true }], stack: 'runA' },
      { id: 'runB', label: 'Range + counter', x: 71, y: 0, w: 25, d: 96, target: true },
      { id: 'fridge', label: 'Fridge', x: 66, y: 96, w: 30, d: 30, zones: [{ side: 'W', depth: 30, kind: 'door swing', walk: true }] }
    ]
  }
];
export const layoutBySlug = Object.fromEntries(LAYOUTS.map(l => [l.slug, l]));
