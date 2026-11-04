# smallspacecompass.com

Static site, published from `docs/` (GitHub Pages, CNAME `smallspacecompass.com`).

- Source: `build/build.mjs` + `src/content/*.mjs` → `node build/build.mjs` regenerates `docs/`.
- Browser code (vanilla JS + SVG): `docs/assets/js/` – `geometry.js` (collision, door swings, distance field, widest route/A*, delivery rotation), `render.js`, `planner.js`, `delivery.js`, `storage.js`, `site.js` (ad slots, consent-gated GA4).
- Ad slots: fill the slot IDs in `docs/assets/js/site.js` (`ADSENSE.slots`). Empty ID = no slot rendered, no space reserved. The AdSense loader sits statically in the head of every indexable page (after the consent defaults); `site.js` never loads it a second time. Slots only on guide and tool pages; the browser test forces every slot visible and requires 150 px to buttons, inputs and summaries.
- Layout notes: `src/content/layout-notes.mjs` (`body` plus `more`: variants, mistakes, the 12 in smaller check, adapting, measurements).
- Tests: `npm test` (geometry + every published plan example: clearance zones, collisions, routes), `npm run check` (pages), `PLAYWRIGHT=/opt/npm-tools/node_modules/playwright node tests/consent.mjs` (consent flow with stubbed CMP), `PLAYWRIGHT=/opt/npm-tools/node_modules/playwright node tests/browser.mjs [paths|all]` (390/1366 px).
- Fonts self-hosted (Archivo, IBM Plex Mono, OFL in `docs/assets/fonts/`).
- Old URLs: see `REDIRECTS.md`.
