#!/usr/bin/env node
/**
 * search-index.js - build the client-side search index from the rendered site.
 *
 * Runs after eleventy, against _site, so it indexes exactly what a visitor
 * sees: shared includes are already expanded and Nunjucks is already resolved.
 * Parsing the output rather than the templates also means nothing has to be
 * kept in step by hand when a page is restructured.
 *
 * Two kinds of record:
 *   page - one per page, from title, description, headings and an excerpt
 *   faq  - one per FAQ question, carrying its own answer and deep link
 *
 * FAQ entries exist because a visitor usually types a question, and landing on
 * the answer beats landing on the page that contains it.
 *
 * Nav, footer, script and style are stripped: they repeat on every page and
 * would make every query match everything.
 */

const fs = require('fs');
const path = require('path');

const SITE = '_site';
const OUT = path.join(SITE, 'search-index.json');

const strip = (s) => s
  .replace(/<!--[\s\S]*?-->/g, ' ')   // comments first: several are long prose
  .replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#183;/g, '·')
  .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…').replace(/&mdash;/g, '—');

const clean = (s) => decode(strip(s)).replace(/\s+/g, ' ').trim();

// Which part of the site a URL belongs to, for grouping results.
function sectionOf(url) {
  if (url.startsWith('/blog/')) return 'Blog';
  if (url.startsWith('/platform/')) return 'Platform';
  if (url.startsWith('/solutions/')) return 'Solutions';
  if (url.startsWith('/features/')) return 'Features';
  if (/^\/(privacy-policy|terms-and-conditions|data-processing-agreement)\//.test(url)) return 'Legal';
  return 'Company';
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name === 'index.html') out.push(p);
  }
  return out;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

const records = [];
const files = walk(SITE).sort();

for (const file of files) {
  const url = '/' + path.relative(SITE, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  // Spanish pages have their own locale and would pollute an English index.
  if (url.startsWith('/es/')) continue;
  // Thank-you and other dead-end pages are not worth surfacing.
  if (url === '/thanks/') continue;

  const html = fs.readFileSync(file, 'utf8');

  const title = clean((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1])
    .replace(/\s*\|\s*Teamwork Commerce$/, '');
  const description = decode((html.match(/<meta name="description" content="([^"]*)"/i) || [, ''])[1]).trim();

  // Body only: <main> if the layout has one, so <head> never reaches an
  // excerpt, then drop the chrome that repeats sitewide.
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
  let body = (main ? main[1] : html).replace(/<!--[\s\S]*?-->/g, ' ');
  body = body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  body = body.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ').replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');

  const headings = [...body.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/gi)]
    .map((m) => clean(m[1]))
    .filter((h) => h && h.length < 120);

  // FAQ pairs become their own records, deep-linked by a generated anchor.
  const faqs = [...body.matchAll(
    /<button class="faq-question"[^>]*>([\s\S]*?)<\/button>[\s\S]{0,80}?<div class="faq-answer">([\s\S]*?)<\/div>/gi
  )];
  for (const [, q, a] of faqs) {
    const question = clean(q);
    const answer = clean(a);
    if (!question || !answer) continue;
    records.push({
      t: question,
      u: url + '#faq-' + slugify(question),
      s: 'FAQ',
      p: title,
      x: answer.slice(0, 220),
      k: 'faq',
    });
  }

  // Remove FAQ blocks before taking the page excerpt, or the excerpt is just
  // the first FAQ answer repeated.
  const withoutFaq = body.replace(/<div class="faq-item">[\s\S]*?<\/button>/gi, ' ');
  const text = clean(withoutFaq);

  records.push({
    t: title,
    u: url,
    s: sectionOf(url),
    d: description,
    h: headings.slice(0, 18).join(' · '),
    x: text.slice(0, 260),
    k: 'page',
  });
}

// The shared faq-sections include mirrors page FAQs onto the FAQ hub, so the
// same question can exist on several URLs, sometimes twice on the hub itself.
// Keep one record per question, preferring the page it belongs to over the
// hub: the product page answers it in context.
const HUB = '/frequently-asked-questions/';
const byQuestion = new Map();
for (const r of records) {
  if (r.k !== 'faq') continue;
  const key = r.t.toLowerCase().replace(/\s+/g, ' ').trim();
  const prev = byQuestion.get(key);
  const isHub = r.u.startsWith(HUB);
  if (!prev || (prev.u.startsWith(HUB) && !isHub)) byQuestion.set(key, r);
}
const deduped = records.filter((r) => r.k !== 'faq').concat([...byQuestion.values()]);
records.length = 0;
records.push(...deduped);

fs.writeFileSync(OUT, JSON.stringify(records));
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
const pages = records.filter((r) => r.k === 'page').length;
const faq = records.filter((r) => r.k === 'faq').length;
console.log(`[search] ${records.length} records (${pages} pages, ${faq} FAQ) -> ${OUT}, ${kb} KB`);
