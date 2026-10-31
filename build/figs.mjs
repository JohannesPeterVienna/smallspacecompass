import { planSVG, elevationSVG } from '../docs/assets/js/render.js';
import { analyzePlan } from '../docs/assets/js/geometry.js';
import { layoutBySlug } from '../docs/assets/js/layouts.js';
/* ---------- figure helpers used by article content ---------- */
// Every plan figure published in a guide is registered here, so tests can check it against the clearances it claims.
export const FIGURES = [];
export function figPlan(plan, caption, opt = {}) {
  const a = analyzePlan(plan, { state: opt.state });
  FIGURES.push({ plan, caption, state: opt.state, counter: !!opt.counter, conflicts: a.conflicts });
  const svg = planSVG(plan, a, { title: opt.alt || caption.replace(/<[^>]+>/g, ''), state: opt.state, extraDims: opt.dims, noPinch: opt.noPinch, dims: opt.overall });
  const open = plan.slug ? `<a class="open" href="/layouts/${plan.slug}/">Open this layout and its measurements →</a>` : '';
  return `<figure class="plan-fig"><div class="fig-body">${svg}</div><figcaption><span>${caption}</span>${open}</figcaption></figure>`;
}
export function figLayout(slug, caption, opt = {}) {
  const L = layoutBySlug[slug];
  return figPlan(L, caption, opt);
}
export function figElev(wall, units, caption) {
  return `<figure class="plan-fig"><div class="fig-body">${elevationSVG(wall, units, { title: caption.replace(/<[^>]+>/g, '') })}</div><figcaption><span>${caption}</span></figcaption></figure>`;
}
export function figRaw(svg, caption) {
  return `<figure class="plan-fig"><div class="fig-body">${svg}</div><figcaption><span>${caption}</span></figcaption></figure>`;
}


/* small plan builder for article figures */
export function room(W, D, items, doors = [], windows = []) { return { room: { W, D }, items, doors, windows }; }
export const door = (wall, offset, width = 32, hinge = 'start', swing = 'in', extra = {}) => ({ id: 'd' + wall + offset, label: 'door', wall, offset, width, hinge, swing, entry: true, ...extra });
