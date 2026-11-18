import { figPlan, figLayout, figElev, figRaw, room, door } from '../../build/figs.mjs';
import { dimLine } from '../../docs/assets/js/render.js';
export { figPlan, figLayout, figElev, figRaw, room, door, dimLine };

export const ADA = 'https://www.access-board.gov/ada/';
export const NKBA_K = 'https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf';
export const NKBA_B = 'https://kb.nkba.org/uploads/2022/05/Bath-Planning-Guidelines.pdf';
export const CASPER = 'https://casper.com/mattress-size-comparison/';
export const SILENT = 'https://www.silentnight.co.uk/guides/bed-mattress-size-guide';
export const S = {
  ada4035: ['2010 ADA Standards for Accessible Design, §403.5.1 Clear Width (U.S. Access Board)', 'https://www.access-board.gov/ada/chapter/ch04/'],
  ada4035b: ['2010 ADA Standards, §403.5.2 Clear Width at Turn', ADA + '#ada-403_5_2'],
  ada4042: ['2010 ADA Standards, §404.2.3 Clear Width of doors', ADA + '#ada-404_2_3'],
  ada40424: ['2010 ADA Standards, Table 404.2.4.1 Maneuvering clearances at doors', ADA + '#ada-404_2_4_1'],
  ada304: ['2010 ADA Standards, §304.3 Turning space', ADA + '#ada-304_3'],
  ada305: ['2010 ADA Standards, §305.3 Clear floor space (30 × 48 in)', ADA + '#ada-305_3'],
  ada308: ['2010 ADA Standards, §308.2.1 and §308.3.1 Unobstructed reach', ADA + '#ada-308_2_1'],
  nkbaK: ['NKBA Kitchen Planning Guidelines with Access Standards (PDF) – code references based on the 2015 IRC and IPC, access standards on ICC A117.1–2009; check the code edition in force locally', NKBA_K],
  nkbaB: ['NKBA Bathroom Planning Guidelines with Access Standards (PDF) – code references based on the 2015 IRC and IPC, access standards on ICC A117.1–2009; check the code edition in force locally', NKBA_B],
  casper: ['Casper – Mattress sizes and bed dimensions guide (U.S. sizes)', CASPER],
  silent: ['Silentnight – Bed and mattress size guide (UK sizes)', SILENT]
};
export const a = (href, text) => `<a href="${href}">${text}</a>`;
export const rule = (v, title, src) => `<div class="rule-card"><span class="v">${v}</span><b>${title}</b><span class="s">${src}</span></div>`;
export const table = (head, rows) => `<div class="table-scroll"><table class="data"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i && /^[\d.,–×\s]+(in|cm|ft|sq ft|%|m²)?/.test(String(c)) ? `<td class="num">${c}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export const bs = (d = 24, sides = ['E', 'W']) => sides.map(side => ({ side, depth: d, kind: 'bedside', walk: true }));
export const chair = (side = 'S', d = 32) => [{ side, depth: d, kind: 'chair' }];

/* ---- November 2026: links into the tools with the guide's own numbers, and the newly read primary documents ---- */
import { encodeQuick } from '../../docs/assets/js/quickfit.js';
import { deliveryToFragment } from '../../docs/assets/js/validate.js';
import { refById, SOURCES as RS, refUrl } from '../../docs/assets/js/refdata.js';
export const qlink = (key, values, unit = 'in') => `/tools/clearance-check/#${encodeQuick(key, values, unit).replace(/&/g, '&amp;')}`;
const ROUTE = { doorW: 32, doorH: 80, hallA: 36, hallB: 36, hallH: 96, stairW: 36, stairH: 80, door2W: 30, door2H: 80 };
export const dlink = (lengths, checks = {}) => `/tools/will-it-fit/#${deliveryToFragment({ unit: 'in', lengths: { ...ROUTE, ...lengths }, checks: { upright: false, useDoor: true, useCorner: true, useLanding: false, useDoor2: false, ...checks } }).replace(/&/g, '&amp;')}`;
// "try it with these numbers" box
export const tryIt = (href, button, text) => `<p class="try no-print"><a class="btn small" href="${href}">${button}</a><span>${text}</span></p>`;
// link to a row of the reference table, e.g. ref('adm-bed-principal', '750 mm')
export const ref = (id, text) => { if (!refById[id]) throw new Error('unknown reference row ' + id); return `<a href="/reference/#${id}">${text}</a>`; };
const RET = 'retrieved 2026-11-18';
S.adm = ['Approved Document M, Volume 1: Dwellings, 2015 edition incorporating 2016 amendments (UK Government)', RS.adm.url, RET];
S.ndss = ['Technical housing standards – nationally described space standard (UK Government, 2015)', RS.ndss.url, RET];
S.hud = ['24 CFR Part 3280, Manufactured Home Construction and Safety Standards, Subpart B (edition of April 1, 2024)', RS.hud.url, RET];
S.ada804 = ['2010 ADA Standards, §804.2.1 Pass Through Kitchen', ADA + '#ada-804_2_1', RET];
S.ada803 = ['2010 ADA Standards, §803.5 Coat Hooks and Shelves; §404.2.7 Door Hardware', ADA + '#ada-803_5', RET];
export { refUrl };
S.ada903 = ['2010 ADA Standards, §903 Benches', ADA + '#ada-903_5', RET];
S.spec = ['Spec sheet “Adonis Queen Murphy Bed”, model ADONQNP (PDF dated November 2023; the sheet does not name its manufacturer)', 'https://cdn.shopify.com/s/files/1/0818/6976/6973/files/ADONQNP_Spec_Sheet.pdf', RET + ' – one example model, not a survey'];
