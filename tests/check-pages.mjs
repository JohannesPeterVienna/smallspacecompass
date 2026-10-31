// Page audit: word count, meta, single h1, canonical, JSON-LD, internal links, ad rules.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const pages = JSON.parse(readFileSync(join(ROOT, 'build/pages.json'), 'utf8'));
const redirects = JSON.parse(readFileSync(join(ROOT, 'build/redirects.json'), 'utf8'));
const NO_AD = ['/imprint/', '/privacy/', '/contact/', '/404.html', '/', '/guides/', '/layouts/', '/tools/', '/about/'];
let fail = 0;
const err = (p, m) => { fail++; console.log(`✗ ${p}: ${m}`); };
const fileOf = (p) => join(DOCS, p.endsWith('/') ? p + 'index.html' : p);

function words(html) {
  const m = html.match(/<article[^>]*data-words[^>]*>([\s\S]*?)<\/article>/);
  if (!m) return 0;
  let t = m[1].replace(/<div data-nocount>[\s\S]*$/, '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
  return t.split(/\s+/).filter(w => /[A-Za-z]/.test(w)).length;
}
const all = [...pages, { path: '/404.html', ads: false, noindex: true, kind: 'other' }];
const report = [];
for (const p of all) {
  const f = fileOf(p.path);
  if (!existsSync(f)) { err(p.path, 'missing file'); continue; }
  const h = readFileSync(f, 'utf8');
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(p.path, `${h1} h1`);
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  if (title.length < 10 || title.length > 95) err(p.path, `title length ${title.length}`);
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  if (desc.length < 50 || desc.length > 200) err(p.path, `description length ${desc.length}`);
  const can = h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (can !== 'https://smallspacecompass.com' + p.path) err(p.path, `canonical ${can}`);
  if (!h.includes('<html lang="en"')) err(p.path, 'lang');
  if (!h.includes('content="ca-pub-7811071715414905"')) err(p.path, 'adsense meta');
  const hasAdScript = h.includes('adsbygoogle.js');
  const slots = (h.match(/class="ad ad-/g) || []).length;
  if (NO_AD.includes(p.path) && (hasAdScript || slots)) err(p.path, 'ads on a page that must have none');
  if (p.kind === 'layout' && (hasAdScript || slots)) err(p.path, 'ads on layout page');
  // tool pages: no ad inside the tool section
  const tool = h.match(/<section class="tool"[\s\S]*?<\/section>/)?.[0] || '';
  if (/class="ad /.test(tool)) err(p.path, 'ad slot inside tool UI');
  if (p.kind === 'tool' && /class="ad ad-leader"/.test(h)) err(p.path, 'leaderboard on tool page (above inputs)');
  // JSON-LD validity + FAQ only with visible FAQ
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const o = JSON.parse(m[1]); if (o['@type'] === 'FAQPage' && !h.includes('class="faq"')) err(p.path, 'FAQPage without visible FAQ'); }
    catch (e) { err(p.path, 'invalid JSON-LD'); }
  }
  // internal links
  for (const m of h.matchAll(/href="(\/[^"#?]*)/g)) {
    const u = m[1]; if (u.startsWith('//')) continue;
    if (!existsSync(fileOf(u)) && !existsSync(join(DOCS, u))) err(p.path, `broken link ${u}`);
  }
  const w = words(h);
  if (p.kind === 'article' && w < 900) err(p.path, `only ${w} words`);
  if (p.kind === 'article' && !h.includes('Last reviewed: October 2026')) err(p.path, 'no review date');
  if (p.kind === 'article' && !/<svg class="(plan|elev)/.test(h)) err(p.path, 'no own plan figure');
  if ((p.kind === 'article' || p.kind === 'tool') && !(hasAdScript && slots)) err(p.path, 'expected ad setup');
  report.push([p.path, p.kind, w, hasAdScript ? 'ads' : '-']);
}
for (const [from, to] of redirects) {
  const h = readFileSync(join(DOCS, from), 'utf8');
  if (!h.includes('noindex') || !h.includes(`url=${to}`) || !h.includes(`canonical" href="https://smallspacecompass.com${to}"`)) err(from, 'bad redirect');
  if (!existsSync(fileOf(to))) err(from, 'redirect target missing');
}
for (const f of ['ads.txt', 'robots.txt', 'sitemap.xml', 'CNAME', '.nojekyll', '404.html']) if (!existsSync(join(DOCS, f))) err(f, 'missing');
if (readFileSync(join(DOCS, 'ads.txt'), 'utf8').trim() !== 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0') err('ads.txt', 'content');
const sm = readFileSync(join(DOCS, 'sitemap.xml'), 'utf8');
for (const [from] of redirects) if (sm.includes(from)) err('sitemap', `contains redirect ${from}`);
const imp = readFileSync(fileOf('/imprint/'), 'utf8');
for (const s of ['Seilerstätte 8', 'ATU54682507', 'office@adstern.com', 'Magistratisches Bezirksamt', 'WKO', 'ris.bka.gv.at']) if (!imp.includes(s)) err('/imprint/', 'missing ' + s);
if (/\+43|tel:/i.test(imp)) err('/imprint/', 'phone number present');
const pr = readFileSync(fileOf('/privacy/'), 'utf8');
for (const s of ['Third-party vendors, including Google, use cookies to serve ads based on', 'adssettings.google.com', 'aboutads.info', 'youronlinechoices', 'Barichgasse 40–42', 'Do Not Sell or Share', 'GitHub Pages', 'data-privacy-settings', 'local storage']) if (!pr.includes(s)) err('/privacy/', 'missing ' + s);
if (process.argv.includes('-v')) console.table(report);
const arts = report.filter(r => r[1] === 'article');
console.log(`${all.length} pages, ${arts.length} articles (min ${Math.min(...arts.map(r => r[2]))} words, total ${arts.reduce((s, r) => s + r[2], 0)}), ${redirects.length} redirects`);
console.log(fail ? `${fail} problem(s)` : 'all page checks passed');
process.exit(fail ? 1 : 0);
