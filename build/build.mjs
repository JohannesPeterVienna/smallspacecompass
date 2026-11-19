// Static site generator for smallspacecompass.com → docs/
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planSVG, elevationSVG, esc } from '../docs/assets/js/render.js';
import { analyzePlan, fmtLen } from '../docs/assets/js/geometry.js';
import { LAYOUTS, layoutBySlug } from '../docs/assets/js/layouts.js';
import { ARTICLES } from '../src/content/index.mjs';
import { TOOLS } from '../src/content/tools.mjs';
import { LEGAL } from '../src/content/legal.mjs';
import { layoutNotes } from '../src/content/layout-notes.mjs';
import { figPlan } from './figs.mjs';
import { REFERENCE, SOURCES, TOPICS, RETRIEVED, refUrl } from '../docs/assets/js/refdata.js';
import { quickShell } from '../src/content/tools.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs');
const ORIGIN = 'https://smallspacecompass.com';
const REVIEWED = 'October 2026';
const VERSION = '20261119a';
// lastmod / dateModified: `updated: true` = content changed in the November 18 revision; a date string = changed on that day
const MODIFIED = '2026-11-04', MODIFIED_NEW = '2026-11-18', REVIEWED_NEW = 'November 2026';
const modOf = (p) => (typeof p.updated === 'string' ? p.updated : p.updated ? MODIFIED_NEW : MODIFIED);
const pages = [];

const NAV = [['/tools/clearance-planner/', 'Planner'], ['/tools/will-it-fit/', 'Will it fit?'], ['/layouts/', 'Layouts'], ['/guides/', 'Guides'], ['/reference/', 'Reference'], ['/about/', 'About']];
const LOGO = `<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="1" y="1" width="32" height="32" fill="#F2C230" stroke="#EFF0EC" stroke-width="2"/><path d="M6 27V7h22" fill="none" stroke="#1C2127" stroke-width="3"/><path d="M6 27h4M6 22h2.5M6 17h4M6 12h2.5M11 7v4M16 7v2.5M21 7v4" stroke="#1C2127" stroke-width="1.6"/><path d="M13 27a14 14 0 0 1 14-14" fill="none" stroke="#1C2127" stroke-width="1.6" stroke-dasharray="2 2"/></svg>`;

function write(path, html) {
  const file = join(OUT, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// Search snippets: Google cuts titles at ~60–65 and descriptions at ~155–160 characters.
function shortTitle(t) { let s = String(t); while (s.length > 65 && /\s[–—-]\s|:\s/.test(s)) { const i = Math.max(s.lastIndexOf(' – '), s.lastIndexOf(' — '), s.lastIndexOf(' - ')); if (i < 20) break; s = s.slice(0, i); } return s; }
function shortDesc(d) { let s = String(d); if (s.length <= 160) return s; const cut = s.slice(0, 160); const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' – ')); return i > 80 ? s.slice(0, i).replace(/[ –]+$/, '') + '.' : cut.replace(/\s+\S*$/, '') + '…'; }
function ad(slot) { return `<div class="ad ad-${slot}" data-slot="${slot}"></div>`; }

function layout(p) {
  const url = ORIGIN + p.path;
  const crumbs = p.crumbs || [];
  const ld = [];
  if (crumbs.length) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...crumbs].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: ORIGIN + u })) });
  if (p.ld) ld.push(...p.ld);
  const ads = p.ads === true;
  // AdSense loader (and with it the Google CMP) statically in the head of every indexable page,
  // also where there are no ad slots (home, indexes, layouts); never on noindex pages such as the 404 or on the mandatory pages.
  // Mandatory pages (stats: false – imprint, privacy policy, contact, 404) load no ad code at all, so no Auto Ads can
  // appear there, and data-stats="off" keeps Google Analytics off; Google's consent tool loads there only on an explicit click.
  const loader = !p.noindex && p.stats !== false;
  const nav = NAV.map(([u, t]) => `<a href="${u}"${p.path.startsWith(u) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<!doctype html>
<html lang="en" data-ads="${ads ? 'yes' : 'no'}"${p.stats === false ? ' data-stats="off"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(shortTitle(p.title))}</title>
<meta name="description" content="${esc(shortDesc(p.description))}">
${p.canonical === false ? '' : `<link rel="canonical" href="${url}">\n`}${p.noindex ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta name="google-adsense-account" content="ca-pub-7811071715414905">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:title" content="${esc(shortTitle(p.title))}">
<meta property="og:description" content="${esc(shortDesc(p.description))}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:site_name" content="Small Space Compass">
<meta name="theme-color" content="#1C2127">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/archivo-wdth.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${VERSION}">
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);window['ga-disable-G-T00HRG2YVF']=true;</script>
${loader ? '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7811071715414905" crossorigin="anonymous"></script>\n' : ''}${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
<script type="module" src="/assets/js/site.js?v=${VERSION}"></script>
${p.head || ''}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap"><a class="brand" href="/">${LOGO}<span>Small Space Compass</span></a><nav class="nav" aria-label="Main">${nav}</nav></div></header>
<main id="main"><div class="wrap">
${crumbs.length ? `<ol class="crumbs"><li><a href="/">Home</a></li>${crumbs.map(([n, u], i) => i === crumbs.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol>` : ''}
${p.body}
</div></main>
<footer class="foot"><div class="wrap">
<div><h2>Small Space Compass</h2><p>Small-space planning from the tape measure up: guides that state their measurements and tools that check whether you can still move once the furniture is in. A geometric aid only – check building rules and your own measurements before you buy or build.</p></div>
<div><h2>Tools</h2><ul><li><a href="/tools/clearance-planner/">Clearance Planner</a></li><li><a href="/tools/clearance-check/">Clearance Check</a></li><li><a href="/tools/will-it-fit/">Will It Fit? Delivery Check</a></li><li><a href="/tools/day-night-swap/">Day/Night Floor Swap</a></li><li><a href="/tools/storage-wall/">Storage Wall Audit</a></li><li><a href="/layouts/">Measured Layout Library</a></li></ul></div>
<div><h2>Site</h2><ul><li><a href="/guides/">All guides</a></li><li><a href="/reference/">Clearance reference</a></li><li><a href="/about/">About &amp; method</a></li><li><a href="/contact/">Contact</a></li><li><a href="/imprint/">Imprint</a></li><li><a href="/privacy/">Privacy</a></li><li><button type="button" class="linklike" data-privacy-settings>Privacy settings</button></li></ul></div>
</div></footer>
${p.scripts || ''}
</body>
</html>
`;
}

function page(p) { pages.push(p); write(p.path, layout(p)); }

/* ---------- articles ---------- */
function articlePage(a) {
  const path = `/guides/${a.slug}/`;
  const toc = [...a.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(m => `<li><a href="#${m[1]}">${m[2]}</a></li>`);
  let body = a.body;
  // one in-content ad after the third h2 (long guides only)
  let n = 0;
  body = body.replace(/<h2 id=/g, (m) => (++n === 3 ? `${ad('inline')}\n` + m : m));
  const faq = a.faq?.length ? `<h2 id="faq">Frequently asked questions</h2><div class="faq">${a.faq.map(([q, ans]) => `<details><summary>${esc(q)}</summary><div><p>${ans}</p></div></details>`).join('')}</div>` : '';
  const src = a.sources?.length ? `<h2 id="sources">Sources</h2><ol class="sources">${a.sources.map(([t, u, note]) => `<li><a href="${u}" rel="noopener">${esc(t)}</a>${note ? ` – ${note}` : ''}</li>`).join('')}</ol>` : '';
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.h1, description: a.description, inLanguage: 'en', mainEntityOfPage: ORIGIN + path, dateModified: modOf(a), author: { '@type': 'Organization', name: 'Small Space Compass' }, publisher: { '@type': 'Organization', name: 'AdStern – Agentur für digitales Marketing' } }];
  if (a.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans.replace(/<[^>]+>/g, '') } })) });
  if (a.howto) ld.push({ '@context': 'https://schema.org', '@type': 'HowTo', name: a.howto.name, tool: (a.howto.tools || []).map(t => ({ '@type': 'HowToTool', name: t })), step: a.howto.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s[0], text: s[1] })) });
  const related = (a.related || []).map(s => ARTICLES.find(x => x.slug === s)).filter(Boolean);
  page({
    path, title: a.title, description: a.description, ads: true, ogType: 'article', updated: a.updated || false,
    crumbs: [['Guides', '/guides/'], [a.short || a.h1, path]], ld,
    body: `<div class="cols"><article class="sheet" data-words>
<header class="titleblock"><span class="kicker">${esc(a.kicker || 'Measured guide')}</span><h1>${esc(a.h1)}</h1><p class="lede">${a.lede}</p>
<p class="meta"><span>Last reviewed: ${a.updated ? REVIEWED_NEW : REVIEWED}</span><span>${a.readMin || Math.max(5, Math.round(a.body.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).length / 220))} min read</span><span>Units: in + cm</span></p></header>
${ad('leader')}
${body}
${faq}
${a.tool ? `<div class="callout"><p><b>Check your own room:</b> ${a.tool}</p></div>` : ''}
<div data-nocount>${src}
<p class="reviewed">Last reviewed: ${a.updated ? REVIEWED_NEW : REVIEWED}. Measurements in this guide are planning aids for homes; they are not a building-code or accessibility compliance review.</p></div>
</article>
<aside class="aside">${toc.length ? `<nav class="toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.join('')}${faq ? '<li><a href="#faq">FAQ</a></li>' : ''}</ol></nav>` : ''}
${related.length ? `<div class="toc"><h2>Related guides</h2><ol>${related.map(r => `<li><a href="/guides/${r.slug}/">${esc(r.short || r.h1)}</a></li>`).join('')}</ol></div>` : ''}
${ad('side')}</aside></div>`
  });
}

/* ---------- layouts ---------- */
function layoutTable(L, state) {
  const a = analyzePlan(L, { state });
  const ft2 = (v) => (v / 144).toFixed(1) + ' sq ft';
  const rows = a.routes.map(r => `<tr><td>Entry → ${esc(r.label)}</td><td class="num">${r.found ? (r.width == null ? 'open floor' : `${fmtLen(r.width)} / ${fmtLen(r.width, 'cm')}`) : 'blocked'}</td><td>${r.found ? (r.ok ? 'meets 36 in' : 'below 36 in') : '–'}</td></tr>`).join('');
  return { a, html: `<div class="table-scroll"><table class="data"><caption class="sr">Route widths${state ? ' (' + state + ')' : ''}</caption><thead><tr><th>Route${state ? ` (${state})` : ''}</th><th>Narrowest width</th><th>vs. ADA §403.5.1</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="table-scroll"><table class="data"><thead><tr><th>Floor area</th><th>Furniture footprint</th><th>Use zones</th><th>Free floor</th></tr></thead><tbody><tr><td class="num">${ft2(a.area)}</td><td class="num">${ft2(a.footprint)}</td><td class="num">${ft2(a.zones)}</td><td class="num">${ft2(a.free)} (${Math.round(a.freePct * 100)}%)</td></tr></tbody></table></div>` };
}
function layoutPages() {
  for (const L of LAYOUTS) {
    const path = `/layouts/${L.slug}/`, note = layoutNotes[L.slug];
    const states = L.states || [undefined];
    const blocks = states.map(st => {
      const t = layoutTable(L, st);
      return `${st ? `<h2 id="${st}">${st === 'day' ? 'Day' : 'Night'} state</h2>` : '<h2 id="numbers">Measured results</h2>'}${figPlan(L, `${esc(L.title)}${st ? ` – ${st}` : ''}. Yellow line: widest route from the entry; marker: narrowest point.`, { state: st })}${t.html}`;
    }).join('');
    const items = L.items.map(i => `<tr><td>${esc(i.label)}</td><td class="num">${fmtLen(i.w)} × ${fmtLen(i.d)}</td><td class="num">${fmtLen(i.w, 'cm')} × ${fmtLen(i.d, 'cm')}</td><td>${(i.zones || []).map(z => `${z.kind} ${z.depth} in`).join(', ') || '–'}</td></tr>`).join('');
    page({
      path, title: `${L.title} – measured plan`, description: note.description, ads: false, updated: note.updated || false,
      crumbs: [['Layouts', '/layouts/'], [L.short, path]],
      body: `<article class="sheet" style="max-width:none" data-words><header class="titleblock"><span class="kicker">Measured layout</span><h1>${esc(L.title)}</h1><p class="lede">${note.lede}</p>
<p class="row no-print"><a class="btn" href="/tools/${L.states ? 'day-night-swap' : 'clearance-planner'}/?layout=${L.slug}">Open in the ${L.states ? 'Day/Night Floor Swap' : 'Clearance Planner'}</a></p></header>
<div style="max-width:74ch">${blocks}
<h2 id="why">Why it is laid out this way</h2>${note.body}
${note.more || ''}
<h2 id="pieces">Pieces and their use zones</h2><div class="table-scroll"><table class="data"><thead><tr><th>Piece</th><th>Size (in)</th><th>Size (cm)</th><th>Use zone in front</th></tr></thead><tbody>${items}</tbody></table></div>
<p class="note-small">Room inside wall faces: ${fmtLen(L.room.W)} × ${fmtLen(L.room.D)} (${fmtLen(L.room.W, 'cm')} × ${fmtLen(L.room.D, 'cm')}). Results are computed by the same code as the planner and compared with the 36 in clear width of ADA 2010 §403.5.1 as a reference, not as a compliance statement.</p>
<p class="reviewed">Last reviewed: November 2026</p></div></article>`
    });
  }
  const cards = LAYOUTS.map(L => `<a class="card" href="/layouts/${L.slug}/"><span class="k">${L.kind}${L.states ? ' · day/night' : ''}</span>${planSVG(L, analyzePlan(L, { state: L.states?.[0] }), { dims: false, noPinch: true, pad: 8, title: L.title })}<h3>${esc(L.title)}</h3></a>`).join('');
  page({
    path: '/layouts/', title: 'Measured Layout Library – small studio, bedroom and kitchen plans', description: 'Nine measured small-space floor plans with walkway widths, door swings and free-floor figures. Open any of them in the Clearance Planner and adapt it to your room.',
    crumbs: [['Layouts', '/layouts/']], ads: false,
    body: `<header class="titleblock"><span class="kicker">Measured Layout Library</span><h1>Measured layouts you can open and edit</h1><p class="lede">Each plan below is drawn to the inch, with door swings, chair and drawer zones and the narrowest point on the way from the entry to the bed, desk and window. Use them as starting points: open one in the planner, type in your own wall lengths and see what changes.</p></header>
<div class="intro" style="max-width:74ch"><h2 id="read">How to read the plans</h2>
<p>Every plan is measured on the inside faces of the walls and drawn at the same scale on its own page. Furniture appears as its real footprint; the lighter areas in front of it are use zones – the 32 in a desk chair rolls back, the 24 in strip beside a bed, the 18 in a dresser drawer needs, the arc of each door. The yellow line is the widest route from the entry to the bed, the desk and the window, and the marker sits where that route is narrowest. Each page lists that narrowest width in inches and centimeters and compares it with the 36 in clear width from §403.5.1 of the 2010 ADA Standards, used here as a reference line, not as a compliance test.</p>
<p>Below the drawing you also find the floor area, the furniture footprint, the area taken by use zones and the free floor that is left, plus a short note on why the pieces sit where they do. The library covers six studios between 15 × 15 ft and 24 × 14 ft, two 12 × 10 ft bedrooms and a galley kitchen; the wall-bed and sofa-bed studios are checked twice, in their day and their night position.</p>
<p>To adapt a plan, open it in the <a href="/tools/clearance-planner/">Clearance Planner</a> (or the <a href="/tools/day-night-swap/">Day/Night Floor Swap</a> for fold-away furniture), change the room size and the pieces to your own measurements and watch the route widths update. For the reasoning behind the numbers, start with the guide to <a href="/guides/studio-apartment-layouts/">studio apartment layouts</a>.</p>
<h2 id="which">Which plan for which room</h2>
<div class="table-scroll"><table class="data"><caption class="sr">Layouts by room type</caption><thead><tr><th>Your room</th><th>Start with</th><th>Why</th></tr></thead><tbody>
<tr><td>Studio, roughly square, queen bed</td><td><a href="/layouts/studio-20x15-queen-corner/">20 × 15 ft, bed in the corner</a></td><td>Bed away from the door, living area by the window</td></tr>
<tr><td>Studio where the bed should be screened</td><td><a href="/layouts/studio-18x14-full-alcove/">18 × 14 ft alcove</a></td><td>Bookshelf divider, full bed</td></tr>
<tr><td>Long, narrow studio</td><td><a href="/layouts/studio-22x12-long-narrow/">22 × 12 ft in three zones</a></td><td>Furniture on one long wall, route on the other</td></tr>
<tr><td>Small studio, wall bed</td><td><a href="/layouts/studio-15x15-wall-bed/">15 × 15 ft wall bed</a></td><td>Day and night states checked</td></tr>
<tr><td>Studio with a kitchen wall</td><td><a href="/layouts/studio-16x20-kitchen-wall/">16 × 20 ft</a></td><td>42 in work aisle kept free</td></tr>
<tr><td>Studio without a separate bed</td><td><a href="/layouts/studio-24x14-sofa-bed/">24 × 14 ft sofa bed</a></td><td>Only the coffee table moves</td></tr>
<tr><td>Small bedroom, queen bed</td><td><a href="/layouts/bedroom-12x10-queen/">12 × 10 ft queen</a></td><td>Both bed sides usable, room for a dresser</td></tr>
<tr><td>Small bedroom with a desk</td><td><a href="/layouts/bedroom-12x10-full-desk/">12 × 10 ft full bed and desk</a></td><td>Bed in the corner frees a work wall</td></tr>
<tr><td>Galley kitchen</td><td><a href="/layouts/galley-kitchen-8x12/">8 × 12 ft galley</a></td><td>NKBA aisle, dishwasher and fridge doors</td></tr>
</tbody></table></div>
<h2 id="smaller">What if your room is 12 in smaller?</h2>
<p>Each layout page also reports what happens when the room loses 12 in (30 cm) in either direction. We recompute the plan with the same code as the planner, take the 12 in out of the middle of the room and move the furniture on the far side with the wall. Some plans barely notice – the 24 × 14 ft sofa-bed studio keeps every route above 49 in – while others lose a piece: in a 12 × 9 ft bedroom a queen bed and two 24 in strips use the whole width, so the nightstands no longer fit. If your room is a little smaller than a plan, read that section first; it tells you which piece to change.</p>
<h2 id="pinch">Reading the pinch points</h2>
<p>A route is only as wide as its narrowest point. The marker on each plan shows where that is, and the two pieces on either side of it are the ones to change first. A short squeeze past the corner of a table is easier to live with than a long, narrow corridor along a sofa, which is why the 2010 ADA Standards allow a 32 in pinch only over a short length; the layout pages say when a plan relies on such a pinch.</p></div>
<div class="cards">${cards}</div>`
  });
}

/* ---------- reference table ---------- */
function referencePage() {
  const srcLink = (r) => `<a href="${refUrl(r)}" rel="noopener">${esc(SOURCES[r.src].short)}</a>`;
  const body = TOPICS.map(t => `<tbody data-topic="${esc(t)}"><tr class="grp"><th colspan="5" scope="colgroup">${esc(t)}</th></tr>${REFERENCE.filter(r => r.topic === t).map(r => `<tr id="${r.id}" data-id="${r.id}"><td>${esc(r.what)}${r.note ? `<br><span class="note-small">${esc(r.note)}</span>` : ''}</td><td class="num${r.conv === 'imp' ? ' conv' : ''}">${esc(r.imp)}</td><td class="num${r.conv === 'met' ? ' conv' : ''}">${esc(r.met)}</td><td>${srcLink(r)}<br><span class="note-small">${esc(r.sec)}</span></td><td class="no-print"><button type="button" class="btn small ghost" data-row-link="${r.id}" data-js hidden aria-label="Copy a link to this entry">Link</button></td></tr>`).join('')}</tbody>`).join('');
  const counts = Object.fromEntries(Object.keys(SOURCES).map(k => [k, REFERENCE.filter(r => r.src === k).length]));
  page({
    path: '/reference/', title: 'Clearance & Dimension Reference for Small Homes (in + mm)', updated: '2026-11-19',
    description: `${REFERENCE.length} clearances, room sizes and reach heights for small homes, each read in a primary document – ADA Standards, NKBA guidelines, 24 CFR 3280, England’s space standard and Approved Document M – with section, scope and retrieval date.`,
    crumbs: [['Reference', '/reference/']], ads: false,
    ld: [{ '@context': 'https://schema.org', '@type': 'Dataset', name: 'Clearance and dimension reference for small homes', description: `${REFERENCE.length} clearances, room sizes and reach heights compiled from six primary documents, in inches and millimetres, with section references.`, url: ORIGIN + '/reference/', dateModified: '2026-11-19', inLanguage: 'en', isAccessibleForFree: true, creator: { '@type': 'Organization', name: 'Small Space Compass' }, publisher: { '@type': 'Organization', name: 'AdStern – Agentur für digitales Marketing' } }],
    scripts: `<script type="module" src="/assets/js/reference.js?v=${VERSION}"></script>`,
    body: `<header class="titleblock"><span class="kicker">Reference</span><h1>Clearance and dimension reference</h1><p class="lede">${REFERENCE.length} widths, room sizes and heights that matter when space is short, each read in the primary document it comes from. Every entry names the section, links the source and says what kind of rule it is – because a federal standard for factory-built homes, an accessibility standard for public buildings and a trade guideline for kitchens are not the same thing.</p></header>
<div data-ref>
<div class="panel ref-filter no-print"><div class="fields">
<label class="f" style="grid-column:span 2"><span class="lb">Search</span><input type="search" data-ref-q placeholder="e.g. bed, 36 in, door, 750" autocomplete="off"></label>
<label class="f"><span class="lb">Topic</span><select data-ref-topic><option value="">All topics</option>${TOPICS.map(t => `<option>${esc(t)}</option>`).join('')}</select></label>
<label class="f"><span class="lb">Source</span><select data-ref-src><option value="">All sources</option>${Object.entries(SOURCES).map(([k, v]) => `<option value="${k}">${esc(v.short)} (${counts[k]})</option>`).join('')}</select></label>
<label class="f"><span class="lb">Region</span><select data-ref-region><option value="">US and UK</option><option value="US">United States</option><option value="UK">England (UK)</option></select></label></div>
<div class="row"><span class="mono" data-ref-count role="status">${REFERENCE.length} entries</span><button class="btn small ghost" type="button" data-ref-act="clear" data-js hidden>Clear filters</button><button class="btn small ghost" type="button" data-ref-act="csv" data-js hidden>Download CSV</button><button class="btn small ghost" type="button" data-ref-act="print" data-js hidden>Print</button><span class="note-small" data-ref-msg role="status"></span></div>
<noscript><p class="note-small">Search and filters need JavaScript; the complete table is below.</p></noscript></div>
<div class="table-scroll"><table class="data ref"><caption class="sr">Clearances and dimensions from primary documents</caption><thead><tr><th>Measurement</th><th>Imperial</th><th>Metric</th><th>Source, section</th><th class="no-print" aria-label="Link to this entry"></th></tr></thead>${body}</table></div>
<p class="status" data-ref-none hidden>No entry matches. Try a shorter search term, or clear the filters.</p>
</div>
<div class="intro" style="max-width:78ch">
<p class="note-small"><span class="conv-key">shaded</span> = our conversion (× or ÷ 25.4; areas with 1 sq ft = 0.0929 m²), because the document gives only the other unit. Converted minimums are rounded up and converted maximums down, so that a converted figure never understates what the document requires; furniture sizes are rounded to the nearest 0.1 in. All sources retrieved on ${RETRIEVED}.</p>
<h2 id="read">How to read the table</h2>
<p>The table mixes documents of very different weight, on purpose: there is no single rulebook for furnishing a small home, and the figures bracket each other. A 28 in hallway is legal in a U.S. manufactured home; 36 in is the walking-surface width of the ADA Standards; England’s guidance for adaptable homes asks for 900 mm (35.44 in). None of them governs where you put your sofa. Read each entry with its scope:</p>
<div class="table-scroll"><table class="data"><thead><tr><th>Source</th><th>What kind of document</th><th>Scope</th><th>Entries</th></tr></thead><tbody>
${Object.entries(SOURCES).map(([k, v]) => `<tr><td><a href="${v.url}" rel="noopener">${esc(v.name)}</a><br><span class="note-small">${esc(v.publisher)}</span></td><td>${esc(v.kind)}</td><td>${esc(v.scope)}</td><td class="num">${counts[k]}</td></tr>`).join('')}
</tbody></table></div>
<h2 id="method">How it was compiled</h2>
<p>Each figure was read in the document itself on ${RETRIEVED}, in the edition named above, and entered with its section or guideline number. Where a document gives both units (the ADA Standards and the NKBA guidelines do), both are copied as printed – which is why 36 in appears as 915 mm in one row and 914 mm in another. Where it gives one, the other column is our conversion and is shaded.</p>
<p>Three limits apply. First, editions: codes are revised, and the edition in force where you live may differ. Second, the International Residential Code: its figures appear here only as quoted in the NKBA guidelines, which state that their code references are based on the 2015 edition; we could not open the code text itself and therefore list no IRC figure on our own account. Third, mattress and furniture sizes: no standard we could read fixes them, so the only furniture sizes in the table are the ones England’s Approved Document M prescribes for checking a layout drawing.</p>
<h2 id="use">Using a figure</h2>
<p>To test one of these widths against your own room, the <a href="/tools/clearance-check/">Clearance Check</a> does the subtraction and compares the result with the matching rows; the <a href="/tools/clearance-planner/">Clearance Planner</a> measures whole routes. If you find an entry that does not match its source, write to <a href="mailto:office@adstern.com">office@adstern.com</a> with the entry and the section – corrections are made in the table and noted on the <a href="/about/#corrections">About page</a>.</p>
<p class="note-small" id="licence">The entries from the nationally described space standard and from Approved Document M: Contains public sector information licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">Open Government Licence v3.0</a>.</p>
<p class="reviewed">Compiled and last checked against the sources: November 18, 2026; conversions revised November 19, 2026. Not legal advice and not a compliance review.</p></div>`
  });
}

/* ---------- tools ---------- */
function toolPages() {
  for (const t of TOOLS) page({
    path: t.path, title: t.title, description: t.description, ads: true, updated: t.updated || false,
    crumbs: [['Tools', '/tools/'], [t.short, t.path]],
    ld: [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: t.h1, url: ORIGIN + t.path, applicationCategory: 'DesignApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
      ...(t.faq ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) }] : [])],
    body: `<header class="titleblock"><span class="kicker">Free tool · runs in your browser</span><h1>${esc(t.h1)}</h1><p class="lede">${t.lede}</p></header>
${t.app}
<div class="tool-text" style="margin-top:2.5rem"><article class="sheet" data-words>${t.body}
${t.faq ? `<h2 id="faq">Frequently asked questions</h2><div class="faq">${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div><p>${a}</p></div></details>`).join('')}</div>` : ''}
<div data-nocount>${t.sources ? `<h2 id="sources">Sources</h2><ol class="sources">${t.sources.map(([n, u, d]) => `<li><a href="${u}" rel="noopener">${esc(n)}</a>${d ? ' – ' + d : ''}</li>`).join('')}</ol>` : ''}<p class="reviewed">Last reviewed: ${t.updated ? REVIEWED_NEW : REVIEWED}. Geometric aid only.</p></div></article>
${ad('inline')}</div>`,
    scripts: `<script type="module" src="/assets/js/${t.script}?v=${VERSION}"></script>`
  });
  page({
    path: '/tools/', title: 'Free small-space planning tools – Small Space Compass', description: 'Five free browser tools that check clearances, delivery routes, fold-away furniture and storage by reach height. No account, nothing uploaded.',
    crumbs: [['Tools', '/tools/']], ads: false, updated: true,
    body: `<header class="titleblock"><span class="kicker">Tools</span><h1>Planning tools that check movement, not just footprints</h1><p class="lede">All five tools run entirely in your browser. Plans are kept on your device only and can be exported as SVG, JSON or CSV.</p></header>
<div class="intro" style="max-width:74ch"><h2 id="which">Which tool answers which question</h2>
<p>Start with the <a href="/tools/clearance-check/">Clearance Check</a> when you have one question and two numbers: it subtracts a bed from a wall, use zones from a gap, a table from a room or counters from a kitchen, shows the working and compares what is left with the published widths in the <a href="/reference/">reference table</a>. Use the <a href="/tools/clearance-planner/">Clearance Planner</a> when you are arranging a room: it draws furniture as measured rectangles, adds door swings and the space a chair, drawer or wardrobe door needs, then finds the widest route from the entry to the bed, desk and window and measures its narrowest point. Use <a href="/tools/will-it-fit/">Will It Fit?</a> before you order a sofa, mattress or wardrobe: it tests the item straight, on its side, on end and tilted through your door, around a 90° hallway corner and over a stair landing. The <a href="/tools/day-night-swap/">Day/Night Floor Swap</a> runs the planner's checks twice for wall beds, sofa beds and drop-leaf tables, once folded and once open. The <a href="/tools/storage-wall/">Storage Wall Audit</a> splits the volume of shelves and cabinets into what sits below 15 in, within the 15–48 in reach range and above it.</p>
<p>The Clearance Check and the delivery check can put your numbers into a link you can send to a mover or a landlord; the Storage Wall Audit exports its units as CSV. All tools work in inches or centimeters and convert exactly. Measure the inside faces of walls and the clear width of doors with the door open 90°; the <a href="/guides/how-to-measure-a-room-for-furniture/">room measuring guide</a> shows where. The tools are geometric aids: they check rectangles, arcs and heights, not building codes, structural loads or how a piece is carried. Each tool page explains its method, its sources and its limits below the tool.</p>
<h2 id="order">A sensible order</h2>
<p>Before a move or a furniture purchase, the tools work best in this order. First measure the room and the doors, using the <a href="/guides/how-to-measure-a-room-for-furniture/">measuring guide</a>. Then check every large piece with Will It Fit? – a sofa that cannot get through the hallway corner does not need a place in the plan. Next, arrange the pieces that passed in the Clearance Planner, or in the Day/Night Floor Swap if something folds. Finally, use the Storage Wall Audit to see whether the storage you planned is within easy reach or mostly above your head.</p>
<h2 id="example">A worked example</h2>
<p>Say you are moving into a 20 × 15 ft studio with a 32 in entry door and want to bring a 84 in sofa, a queen bed and a desk. In Will It Fit? you enter the sofa's width, depth and height and the door and hallway measurements; the result says whether it passes straight, on its side or only tilted, and where it gets stuck if it does not. In the Clearance Planner you then open the measured <a href="/layouts/studio-20x15-queen-corner/">20 × 15 ft studio layout</a>, change the sofa to 84 in and see the route widths update: if a route drops below the 36 in reference, the marker shows which two pieces cause it. Exporting the plan as SVG gives you a drawing to take to the shop.</p>
<h2 id="limits">What the tools do not check</h2>
<ul><li><b>Building rules.</b> Egress, fire and accessibility codes for your building are not part of the checks; the 36 in ADA figure is used as a reference line only.</li>
<li><b>Loads and fixings.</b> Whether a wall can carry a shelf or a wall bed, or a floor a piano, is a question for the building owner or a structural engineer.</li>
<li><b>Carrying.</b> The delivery check tests geometry. It does not know how heavy a piece is, whether the movers can tilt it or whether its legs come off.</li>
<li><b>Odd shapes.</b> Furniture is drawn as rectangles and rooms as rectangles with doors and windows. L-shaped rooms and curved pieces need to be approximated.</li></ul>
<p>Everything you enter stays in your browser. Each tool keeps its own plan in local storage, and you can move a plan between the planner and the swap tool with JSON export and import. The Clearance Check stores nothing at all.</p></div>
<div class="cards">${TOOLS.map(t => `<a class="card" href="${t.path}"><span class="k">Tool</span><h3>${esc(t.h1)}</h3><p>${esc(t.description)}</p></a>`).join('')}<a class="card" href="/layouts/"><span class="k">Library</span><h3>Measured Layout Library</h3><p>Nine measured plans that open straight in the planner.</p></a></div>`
  });
}

/* ---------- guides index, home ---------- */
const NUM = { 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen' };
function indexes() {
  const groups = {};
  for (const a of ARTICLES) (groups[a.group] ||= []).push(a);
  page({
    path: '/guides/', title: 'Small-space guides with real measurements – Small Space Compass', description: `${NUM[ARTICLES.length]} measured guides on walkway space, bed and sofa sizes, small kitchens and bathrooms, storage by reach and studio layouts – every one states its dimensions and sources.`,
    crumbs: [['Guides', '/guides/']], ads: false, updated: true,
    body: `<header class="titleblock"><span class="kicker">Guides</span><h1>Measured guides for small rooms</h1><p class="lede">Every guide names the measurements that matter, shows them on a drawn plan and links the primary source where a published figure exists. The figures themselves are collected in one <a href="/reference/">reference table</a>.</p></header>
${Object.entries(groups).map(([g, list]) => `<h2>${esc(g)}</h2><div class="cards">${list.map(a => `<a class="card" href="/guides/${a.slug}/"><span class="k">${esc(a.kicker || 'Guide')}</span><h3>${esc(a.h1)}</h3><p>${esc(a.description)}</p></a>`).join('')}</div>`).join('')}`
  });
  const hero = layoutBySlug['studio-20x15-queen-corner'];
  page({
    path: '/', title: 'Small Space Compass – small-space planning from the tape measure up', description: 'Check a bed, walkway, table or kitchen aisle against published clearances in seconds, then plan the room: free clearance planner, delivery check and measured guides for small homes.',
    ads: false, updated: true,
    ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Small Space Compass', url: ORIGIN + '/', inLanguage: 'en' }],
    scripts: `<script type="module" src="/assets/js/quick.js?v=${VERSION}"></script>`,
    body: `<header class="titleblock home-head"><span class="kicker">Small living, measured</span><h1>Will it leave enough room?</h1>
<p class="lede">Type two measurements. The check shows the subtraction, the clear width that is left and which published widths it meets – for a bed on a wall, a walkway, a table or a kitchen aisle.</p></header>
${quickShell}
<p class="note-small">Every width in the result links to its entry in the <a href="/reference/">clearance reference</a>: ${REFERENCE.length} figures read in six primary documents, each with section number, scope and retrieval date.</p>
<h2>Then plan the whole room</h2>
<section class="hero"><div>
<p>A sum on one wall cannot see the door swing or the second piece of furniture. The planner draws door arcs, chair and drawer zones and the route from your door to the bed, desk and window – then measures its narrowest point and compares it with the 36 in clear width from the 2010 ADA Standards, used as a reference line.</p>
<p class="row"><a class="btn" href="/tools/clearance-planner/">Open the Clearance Planner</a><a class="btn ghost" href="/tools/will-it-fit/">Will my sofa fit?</a></p></div>
${figPlan(hero, '20 × 15 ft studio. Yellow: route from the entry; markers: narrowest points, measured.', {})}</section>
<h2>What the tools check</h2>
<ol class="steps"><li><b>Clearances.</b> Furniture as measured rectangles, door swing arcs and pull-out zones for chairs, drawers and wardrobe doors. Overlaps turn signal red.</li><li><b>Walkways.</b> A distance field over the floor finds the widest route from the entry to every target and reports the pinch point in inches or centimeters.</li><li><b>Deliveries.</b> Straight, tilted or turned: the delivery check tests a sofa, mattress or wardrobe against the door, a 90° hallway corner and a stair landing.</li><li><b>Fold-away days.</b> Wall beds, sofa beds and drop-leaf tables are checked twice – in their day and their night position.</li></ol>
<h2>Start with a guide</h2><div class="cards">${['walkway-space-around-furniture', 'will-my-sofa-fit-through-the-door', 'studio-apartment-layouts', 'how-to-measure-a-room-for-furniture', 'small-kitchen-clearances', 'murphy-bed-room-size'].map(s => ARTICLES.find(a => a.slug === s)).map(a => `<a class="card" href="/guides/${a.slug}/"><span class="k">${esc(a.kicker || 'Guide')}</span><h3>${esc(a.h1)}</h3><p>${esc(a.description)}</p></a>`).join('')}</div>
<p><a href="/guides/">All ${ARTICLES.length} guides →</a> · <a href="/layouts/">Measured Layout Library →</a> · <a href="/reference/">Clearance reference →</a></p>
<h2>Where the numbers come from</h2>
<p>Every guide states its numbers and says where they come from. Where a figure is published – the ADA walking-surface width, the NKBA kitchen aisles, the bedroom access zones of England’s Approved Document M, the room minimums of the U.S. manufactured-home standard – we link the primary document and the section. Where it is our own working assumption, such as a 24 in strip beside a bed, we say so. Nothing on this site was measured in a test room or tried out on products; the plans and examples are constructed and computed.</p>
<p>The tools work without an account and without uploading anything. Read <a href="/about/">who publishes the site, how it is made and checked, and where its limits are</a>.</p>`
  });
}

/* ---------- old URLs ---------- */
const OLD = [
  ['/entryway-reset.html', '/guides/entryway-storage-without-a-closet/'],
  ['/vertical-storage.html', '/guides/vertical-storage-by-reach/'],
  ['/compact-work-corner.html', '/guides/desk-in-a-studio/'],
  ['/room-layout-paper.html', '/tools/clearance-planner/'],
  ['/about.html', '/about/'], ['/imprint.html', '/imprint/'], ['/privacy.html', '/privacy/'], ['/advertise.html', '/contact/'],
  // guides merged on 2026-11-18
  ['/guides/wall-bed-vs-sofa-bed/', '/guides/murphy-bed-room-size/#sofa-bed'],
  ['/guides/divide-a-studio-without-walls/', '/guides/studio-apartment-layouts/#dividers'],
  ['/guides/rug-size-small-living-room/', '/guides/dining-table-small-space/#rug']
];
function redirects() {
  for (const [from, to] of OLD) write(from, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Moved – Small Space Compass</title>
<meta name="robots" content="noindex, follow"><link rel="canonical" href="${ORIGIN}${to.split('#')[0]}">
<meta http-equiv="refresh" content="0; url=${to}"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body><p>This page has moved to <a href="${to}">${ORIGIN}${to}</a>.</p></body></html>
`);
}

/* ---------- run ---------- */
for (const d of ['guides', 'layouts', 'tools', 'reference', 'about', 'imprint', 'privacy', 'contact']) { const p = join(OUT, d); if (existsSync(p)) rmSync(p, { recursive: true }); }
for (const f of readdirSync(OUT)) if (f.endsWith('.html')) rmSync(join(OUT, f));
for (const a of ARTICLES) articlePage(a);
layoutPages();
toolPages();
referencePage();
indexes();
for (const l of LEGAL) page(l);
redirects();
write('/404.html', layout({ path: '/404.html', title: 'Page not found – Small Space Compass', description: 'The page you were looking for does not exist on smallspacecompass.com. It may have moved when the site was rebuilt.', noindex: true, ads: false, stats: false, canonical: false,
  body: `<div class="sheet" style="max-width:60ch"><h1>Nothing measured here.</h1><p>This address does not lead to a page. It may have moved when the site was rebuilt in October 2026.</p><p class="row"><a class="btn" href="/">Home</a><a class="btn ghost" href="/guides/">All guides</a><a class="btn ghost" href="/tools/clearance-planner/">Clearance Planner</a></p></div>` }));
const sm = pages.filter(p => !p.noindex).map(p => `<url><loc>${ORIGIN}${p.path}</loc><lastmod>${modOf(p)}</lastmod></url>`).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sm}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
writeFileSync(join(OUT, 'ads.txt'), 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0\n');
writeFileSync(join(OUT, 'CNAME'), 'smallspacecompass.com');
writeFileSync(join(OUT, '.nojekyll'), '');
writeFileSync(join(OUT, 'favicon.svg'), LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
writeFileSync(join(ROOT, 'build', 'pages.json'), JSON.stringify(pages.map(p => ({ path: p.path, ads: p.ads === true, noindex: !!p.noindex, kind: p.kind || (p.path.startsWith('/guides/') && p.path !== '/guides/' ? 'article' : p.path.startsWith('/tools/') && p.path !== '/tools/' ? 'tool' : p.path.startsWith('/layouts/') && p.path !== '/layouts/' ? 'layout' : 'other') })), null, 1));
writeFileSync(join(ROOT, 'build', 'redirects.json'), JSON.stringify(OLD, null, 1));
console.log(`built ${pages.length} pages + ${OLD.length} redirects`);
