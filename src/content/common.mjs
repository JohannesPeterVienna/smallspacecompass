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
