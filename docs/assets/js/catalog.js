/* Furniture presets for the planners. Sizes are common retail sizes used as starting points
   (edit them to your own tape-measured piece). Mattress widths/lengths: US sizes as published
   by Casper's size chart; UK sizes as published by Silentnight (see About page). Zones are working
   assumptions explained in the guides, not code requirements. */
export const PRESETS = [
  { key: 'bed-twin', group: 'Beds', label: 'Twin bed', w: 38, d: 75, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'bed-full', group: 'Beds', label: 'Full bed', w: 53, d: 75, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'W', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'bed-queen', group: 'Beds', label: 'Queen bed', w: 60, d: 80, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'W', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'bed-king', group: 'Beds', label: 'King bed', w: 76, d: 80, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'W', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'bed-uk-double', group: 'Beds', label: 'UK double', w: 53.1, d: 74.8, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'W', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'bed-uk-king', group: 'Beds', label: 'UK king', w: 59.1, d: 78.7, target: true, zones: [{ side: 'E', depth: 24, kind: 'bedside', walk: true }, { side: 'W', depth: 24, kind: 'bedside', walk: true }] },
  { key: 'wallbed-queen', group: 'Fold-away', label: 'Queen wall bed', w: 66, d: 18, target: true, ext: { state: 'night', side: 'S', depth: 68 }, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] },
  { key: 'wallbed-full', group: 'Fold-away', label: 'Full wall bed', w: 59, d: 18, target: true, ext: { state: 'night', side: 'S', depth: 63 }, zones: [{ side: 'S', depth: 24, kind: 'bedside', walk: true, state: 'night' }] },
  { key: 'sofabed', group: 'Fold-away', label: 'Sofa bed', w: 78, d: 36, ext: { state: 'night', side: 'S', depth: 54 }, zones: [{ side: 'S', depth: 18, kind: 'legroom', state: 'day' }] },
  { key: 'droptable', group: 'Fold-away', label: 'Drop-leaf table', w: 36, d: 10, ext: { state: 'day', side: 'S', depth: 20 }, zones: [{ side: 'S', depth: 32, kind: 'chair', state: 'day' }] },
  { key: 'sofa', group: 'Living', label: 'Sofa', w: 78, d: 36, zones: [{ side: 'S', depth: 18, kind: 'legroom' }] },
  { key: 'loveseat', group: 'Living', label: 'Loveseat', w: 60, d: 34, zones: [{ side: 'S', depth: 18, kind: 'legroom' }] },
  { key: 'armchair', group: 'Living', label: 'Armchair', w: 32, d: 34, zones: [{ side: 'S', depth: 18, kind: 'legroom' }] },
  { key: 'coffee', group: 'Living', label: 'Coffee table', w: 40, d: 20 },
  { key: 'tvunit', group: 'Living', label: 'TV unit', w: 55, d: 16 },
  { key: 'rug', group: 'Living', label: 'Rug 5×8 ft', w: 96, d: 60, floor: true },
  { key: 'desk', group: 'Work', label: 'Desk', w: 42, d: 22, target: true, zones: [{ side: 'S', depth: 32, kind: 'chair' }] },
  { key: 'desk-small', group: 'Work', label: 'Small desk', w: 32, d: 18, target: true, zones: [{ side: 'S', depth: 32, kind: 'chair' }] },
  { key: 'table2', group: 'Dining', label: 'Table for 2', w: 30, d: 30, zones: [{ side: 'N', depth: 32, kind: 'chair' }, { side: 'S', depth: 32, kind: 'chair' }] },
  { key: 'table4', group: 'Dining', label: 'Table for 4', w: 48, d: 30, zones: [{ side: 'N', depth: 32, kind: 'chair' }, { side: 'S', depth: 32, kind: 'chair' }] },
  { key: 'dresser', group: 'Storage', label: 'Dresser', w: 40, d: 18, zones: [{ side: 'S', depth: 18, kind: 'drawer' }] },
  { key: 'wardrobe', group: 'Storage', label: 'Wardrobe', w: 40, d: 24, zones: [{ side: 'S', depth: 20, kind: 'door swing' }] },
  { key: 'shelf', group: 'Storage', label: 'Bookshelf', w: 31, d: 12 },
  { key: 'nightstand', group: 'Storage', label: 'Nightstand', w: 18, d: 16 },
  { key: 'bench', group: 'Storage', label: 'Shoe bench', w: 36, d: 14, zones: [{ side: 'S', depth: 24, kind: 'sitting' }] },
  { key: 'counter', group: 'Kitchen', label: 'Counter run', w: 96, d: 25, zones: [{ side: 'S', depth: 42, kind: 'work aisle', walk: true }] },
  { key: 'fridge', group: 'Kitchen', label: 'Fridge', w: 30, d: 30, zones: [{ side: 'S', depth: 30, kind: 'door swing' }] }
];
export const presetByKey = Object.fromEntries(PRESETS.map(p => [p.key, p]));
