#!/usr/bin/env node
/**
 * migrate-wp.js - bring posts from the old WordPress site into src/blog/.
 *
 * Reads the go-live redirect map (tools/redirects/redirect-map.csv) and takes
 * every old post marked "post not migrated", fetches it from the old site's
 * REST API, keeps only the article itself (text, image and video modules of the
 * page builder, in order), and writes a post in the same shape as the hand-made
 * ones: front matter, then body HTML with the site's paragraph styling.
 *
 * Dropped on the way: the builder's title module, every form (newsletter and
 * contact), buttons and CTAs, related-post and social widgets, scripts, inline
 * styles and classes. Images are downloaded into the repo so nothing depends on
 * the old host. Internal links are rewritten through the redirect map.
 *
 *   node tools/blog/migrate-wp.js            fetch from the API and migrate
 *   node tools/blog/migrate-wp.js --cache f  use a saved API dump (JSON array)
 *   node tools/blog/migrate-wp.js --dry      report only, write nothing
 *
 * Idempotent: a post whose file already exists is skipped. Writes a report to
 * tools/blog/migrate-report.json.
 */
const fs = require('fs');
const path = require('path');
const { parseDocument, DomUtils } = require('htmlparser2');
const render = require('dom-serializer').default;
const { decodeHTML } = require('entities');

const ROOT = path.join(__dirname, '..', '..');
const BLOG = path.join(ROOT, 'src', 'blog');
const HERO_DIR = path.join(ROOT, 'src', 'assets', 'images', 'blog', 'real');
const INLINE_DIR = path.join(ROOT, 'src', 'assets', 'images', 'blog', 'posts');
const MAP = path.join(ROOT, 'tools', 'redirects', 'redirect-map.csv');
const API = 'https://www.teamworkcommerce.com/wp-json/wp/v2/posts?per_page=100&_embed=1&page=';
const SITE = /^https?:\/\/(www\.)?teamworkcommerce\.com/;

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const NO_IMAGES = args.includes('--no-images');
const cacheIdx = args.indexOf('--cache');
const CACHE = cacheIdx >= 0 ? args[cacheIdx + 1] : null;
const outIdx = args.indexOf('--out');           // write posts somewhere else to inspect them first
const OUT = outIdx >= 0 ? args[outIdx + 1] : BLOG;

// Not articles: job postings, flipbook/PDF shells, an empty draft.
// not articles: landing pages, forms, and job postings that the JOB regex missed
const SKIP = new Set(['marketing-specialist', 'job-application', 'moma-design-store-to-reopen-next-month', 'french-pos-flipbook', 'spanish-pos-flipbook', '245862-2',
  'airtag', 'nrf', 'client-sign-up',
  'account-executive', 'application-specialist-clearwater', 'application-specialist-dublin', 'application-specialist-ukraine', 'branding-and-events-manager', 'business-development-executive', 'communications-manager', 'l2-support-engineer', 'partner-manager-north-america', 'partner-marketing-specialist', 'presales-engineer', 'project-manager-ireland', 'sales-director-eu', 'senior-design-team-technical-product-and-ux-writer']);
const SKIP_CATEGORIES = new Set(['Careers']);
// most specific first: a post tagged Blog and Case Study is a case study
const CATEGORY_ORDER = [['Case Study', 'Case Study'], ['TeamworkCares', 'Teamwork Cares'], ['Podcast', 'Podcast'], ['Partner', 'Partner'], ['News', 'News'], ['Blog', 'Blog'], ['Uncategorized', 'Blog']];
const pickCategory = (terms) => (CATEGORY_ORDER.find(([t]) => terms.includes(t)) || [null, 'Blog'])[1];
const PRODUCTS = [
  [/rfid|self-checkout/i, { title: 'RFID Solution', url: '/platform/rfid/' }],
  [/teamwork cares|donat|volunteer|charit/i, { title: 'Teamwork Cares', url: '/teamwork-cares/' }],
  [/order management|\boms\b|fulfil|bopis|ship from store/i, { title: 'Order Management System', url: '/platform/oms/' }],
  [/inventory|stock count/i, { title: 'Inventory Control', url: '/platform/inventory-control/' }],
  [/analytic|report|dashboard|data/i, { title: 'Analytics & Reporting', url: '/platform/analytics/' }],
  [/stadium|arena|game day|fans?\b/i, { title: 'Stadiums & Venues', url: '/solutions/stadiums-venues/' }],
  [/point of sale|\bpos\b|checkout|mobile/i, { title: 'Mobile POS', url: '/platform/mobile-pos/' }],
];
const P_STYLE = 'color: var(--text-muted); line-height: 1.7; margin-bottom: 16px;';

// ---- small helpers -------------------------------------------------------
const cls = (el) => (el.attribs && el.attribs.class ? el.attribs.class.split(/\s+/) : []);
const has = (el, c) => cls(el).includes(c);
const text = (el) => DomUtils.textContent(el).replace(/\s+/g, ' ').trim();
const yaml = (s) => JSON.stringify(String(s));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readMap() {
  const rows = fs.readFileSync(MAP, 'utf8').trim().split('\n').slice(1).map((line) => {
    const cells = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === ',' && !q) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return { old: cells[0], target: cells[1], rule: cells[2], note: cells[3] };
  });
  return rows;
}

async function fetchAll() {
  if (CACHE) return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  const all = [];
  for (let page = 1; page < 20; page++) {
    const r = await fetch(API + page);
    if (r.status === 400) break;            // past the last page
    if (!r.ok) throw new Error('API ' + r.status + ' on page ' + page);
    const batch = await r.json();
    all.push(...batch);
    if (batch.length < 100) break;
    await sleep(1500);
  }
  return all;
}

// Video embeds the layout can show at the top of the post.
function videoFrom(src) {
  if (!src) return null;
  let m = src.match(/youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/);
  if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1];
  if (/player\.vimeo\.com\/video\/\d+/.test(src)) return src.split('?')[0];
  if (/anchor\.fm\/.+\/embed/.test(src) || /podcasters\.spotify\.com\/.+\/embed/.test(src)) return src;
  return null;
}

// ---- image downloads -----------------------------------------------------
const downloads = [];     // {url, dest}
const seenDest = new Set();
function queueImage(url, dest) {
  if (!url || seenDest.has(dest)) return;
  seenDest.add(dest); downloads.push({ url, dest });
}
async function runDownloads(report) {
  let ok = 0, failed = 0;
  for (const d of downloads) {
    if (fs.existsSync(d.dest)) { ok++; continue; }
    fs.mkdirSync(path.dirname(d.dest), { recursive: true });
    // prefer the original over a WordPress size variant, fall back if it 404s
    const candidates = [d.url.replace(/-\d+x\d+(\.\w+)$/, '$1'), d.url];
    let done = false;
    for (const u of [...new Set(candidates)]) {
      try {
        const r = await fetch(u);
        if (!r.ok) continue;
        fs.writeFileSync(d.dest, Buffer.from(await r.arrayBuffer()));
        done = true; break;
      } catch (e) { /* try the next candidate */ }
    }
    if (done) ok++; else { failed++; report.imageFailures.push(d.url); }
    await sleep(250);
  }
  return { ok, failed };
}

// ---- cleaning ------------------------------------------------------------
const DROP = new Set(['form', 'script', 'style', 'noscript', 'svg', 'button', 'input', 'select', 'textarea', 'label', 'hr', 'br']);
const UNWRAP = new Set(['span', 'div', 'font', 'section', 'article', 'center', 'header', 'footer', 'main', 'aside', 'table', 'tbody', 'tr', 'td', 'th']);
const DROP_CLASS = /(^|\s)(et_pb_button|et_pb_cta|sharedaddy|et_social|jp-relatedposts|wp-block-buttons|et_pb_contact|et_pb_signup|et_pb_blog|et_pb_post_title|et_pb_sidebar|wp-caption-text)/;

function cleanNodes(nodes, ctx) {
  const out = [];
  for (const n of nodes) {
    if (n.type === 'comment') continue;
    if (n.type === 'text') { out.push(n); continue; }
    if (n.type !== 'tag') continue;
    const name = n.name.toLowerCase();
    if (n.attribs && n.attribs.class && DROP_CLASS.test(n.attribs.class)) continue;
    if (name === 'iframe') { if (!ctx.video) ctx.video = videoFrom(n.attribs.src); continue; }
    if (DROP.has(name)) continue;
    if (name === 'img') {
      const src = n.attribs['data-src'] || n.attribs.src || '';
      if (!/^https?:/.test(src) || !SITE.test(src) && !/wp-content\/uploads/.test(src)) continue;
      // ASCII-only local name: accented letters differ between Unicode spellings and only resolve on macOS
      const base = decodeURIComponent(path.basename(src.split('?')[0])).replace(/-\d+x\d+(\.\w+)$/, '$1')
        .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-');
      const local = '/assets/images/blog/posts/' + ctx.slug + '/' + base;
      queueImage(src, path.join(INLINE_DIR, ctx.slug, base));
      out.push({ type: 'tag', name: 'figure', attribs: { class: 'blog-figure' }, children: [{ type: 'tag', name: 'img', attribs: { src: local, alt: n.attribs.alt || '', loading: 'lazy' }, children: [] }] });
      continue;
    }
    const kids = cleanNodes(n.children || [], ctx);
    if (name === 'a') {
      // a link that only wraps an image: keep the image, drop the lightbox link
      if (kids.length === 1 && kids[0].type === 'tag' && kids[0].name === 'figure') { out.push(kids[0]); continue; }
      let href = n.attribs.href || '';
      if (SITE.test(href)) {
        const p = href.replace(SITE, '').split(/[?#]/)[0].replace(/\/?$/, '/');
        href = ctx.linkMap.get(p) || href;
      }
      if (!href) { out.push(...kids); continue; }
      const attribs = { href };
      if (/^https?:/.test(href) && !href.startsWith('/')) { attribs.target = '_blank'; attribs.rel = 'noopener'; }
      out.push({ type: 'tag', name: 'a', attribs, children: kids });
      continue;
    }
    if (UNWRAP.has(name)) { out.push(...kids); continue; }
    if (name === 'p' && !kids.some((k) => k.type === 'tag' && k.name === 'figure') && !kids.some((k) => (k.type === 'text' ? k.data.replace(/ /g, ' ').trim() : text(k)))) continue;
    if (name === 'p' && kids.length === 1 && kids[0].type === 'tag' && kids[0].name === 'figure') { out.push(kids[0]); continue; }
    const keep = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'strong', 'b', 'em', 'i', 'u', 'figure', 'figcaption', 'code', 'pre', 'sup', 'sub'].includes(name);
    if (!keep) { out.push(...kids); continue; }
    const tag = name === 'h1' ? 'h2' : name === 'h5' || name === 'h6' ? 'h4' : name === 'b' ? 'strong' : name === 'i' ? 'em' : name;
    const hasText = kids.some((k) => (k.type === 'text' ? k.data.replace(/ /g, ' ').trim() : text(k) || (k.type === 'tag' && k.name === 'figure')));
    // empty emphasis (<strong><em></em></strong>) is editor residue
    if (['strong', 'em', 'u', 'sup', 'sub', 'code'].includes(tag) && !hasText) continue;
    if (['h2', 'h3', 'h4'].includes(tag)) {
      if (!hasText) continue;
      // headings are already bold: unwrap emphasis inside them
      const flat = []; const walk = (ns) => ns.forEach((k) => (k.type === 'tag' && ['strong', 'em', 'u'].includes(k.name) ? walk(k.children) : flat.push(k)));
      walk(kids); out.push({ type: 'tag', name: tag, attribs: {}, children: flat }); continue;
    }
    out.push({ type: 'tag', name: tag, attribs: {}, children: kids });
  }
  // merge adjacent text nodes, trim stray whitespace between blocks
  return out;
}

// Headings the old theme printed around its sidebar widgets, not article content.
const RESIDUE_HEADING = /^(success stories|sign up for the newsletter|new posts|related posts|recent posts|latest posts|share this|follow us|news)$/i;

function serialize(nodes) {
  let html = nodes.map((n) => render(n, { decodeEntities: false })).join('\n');
  html = html.replace(/<p>/g, '<p style="' + P_STYLE + '">').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n');
  // paragraphs of nothing but non-breaking spaces survive the empty check above
  html = html.replace(/<p style="[^"]*">(?:\s|&nbsp;| )*<\/p>\n?/g, '');
  // widget residue: their headings, and the newsletter consent line
  html = html.replace(/<h[2-4]>([^<]*)<\/h[2-4]>\n?/g, (m, t) => (RESIDUE_HEADING.test(decodeHTML(t).trim()) ? '' : m));
  html = html.replace(/<p style="[^"]*">\s*By submitting this form[\s\S]*?<\/p>\n?/g, '');
  // the newsletter consent line sat beside its form as loose text, link included
  html = html.replace(/By submitting this form[\s\S]*?therewith\.?/g, '');
  // a heading with nothing after it introduced a widget, not a section
  html = html.replace(/(?:<h[2-4]>[^<]*<\/h[2-4]>\s*)+$/, '');
  return html.replace(/\n{3,}/g, '\n\n').trim();
}

// Old "News" items that were only a link to coverage elsewhere: no page here,
// the redirect goes straight to the article.
function externalLink(body) {
  const m = body.match(/href="(https?:\/\/(?!(www\.)?teamworkcommerce\.com)[^"]+)"/);
  return m ? m[1] : null;
}

// Text and inline tags that ended up between blocks (the old editor allowed it)
// become paragraphs, so every sentence sits inside a block.
const INLINE = new Set(['a', 'strong', 'em', 'u', 'code', 'sup', 'sub']);
function wrapInline(nodes) {
  const out = []; let run = [];
  const flush = () => { if (run.some((n) => (n.type === 'text' ? n.data.replace(/ /g, ' ').trim() : true))) out.push({ type: 'tag', name: 'p', attribs: {}, children: run }); run = []; };
  for (const n of nodes) {
    if (n.type === 'text' || (n.type === 'tag' && INLINE.has(n.name))) run.push(n);
    else { flush(); out.push(n); }
  }
  flush();
  return out;
}

// Job postings were published as posts without a Careers tag; they are not articles.
const JOB = /not exhaustive of your tasks|(responsibilities|duties)[\s\S]{0,2000}(requirements|qualifications)[\s\S]{0,2000}(apply|cv|resume|résumé)/i;

function extractBody(content, ctx) {
  const doc = parseDocument(content);
  const all = DomUtils.findAll((el) => has(el, 'et_pb_module'), doc.children);
  // builder modules only, outermost (a blog widget nests modules of its own)
  const modules = all.filter((m) => { let p = m.parent; while (p) { if (p.type === 'tag' && has(p, 'et_pb_module')) return false; p = p.parent; } return true; });
  const parts = [];
  if (modules.length) {
    for (const m of modules) {
      const c = cls(m);
      if (c.some((x) => /^(et_pb_post_title|et_pb_fullwidth_post_title|et_pb_blog|et_pb_cta|et_pb_contact_form|et_pb_signup|et_pb_social|et_pb_divider|dsm_button|dsm_lottie|et_pb_sidebar|et_pb_comments|et_pb_video_slider)/.test(x))) continue;
      if (c.includes('et_pb_text')) {
        const inner = DomUtils.findOne((el) => has(el, 'et_pb_text_inner'), m.children) || m;
        parts.push(...cleanNodes(inner.children, ctx));
      } else if (c.includes('et_pb_image') || c.includes('et_pb_gallery') || c.includes('dsm_image_carousel')) {
        parts.push(...cleanNodes(DomUtils.findAll((el) => el.name === 'img', m.children), ctx));
      } else if (c.includes('et_pb_video')) {
        const f = DomUtils.findOne((el) => el.name === 'iframe' || el.name === 'video', m.children);
        if (f && !ctx.video) ctx.video = videoFrom(f.attribs.src || (f.children.find((k) => k.name === 'source') || { attribs: {} }).attribs.src);
      } else if (c.includes('et_pb_code')) {
        parts.push(...cleanNodes(m.children, ctx));
      } else if (c.includes('et_pb_blurb')) {
        const h = DomUtils.findOne((el) => /^h\d$/.test(el.name), m.children);
        const d = DomUtils.findOne((el) => has(el, 'et_pb_blurb_description'), m.children);
        if (h) parts.push({ type: 'tag', name: 'h3', attribs: {}, children: cleanNodes(h.children, ctx) });
        if (d) parts.push(...cleanNodes(d.children, ctx));
        parts.push(...cleanNodes(DomUtils.findAll((el) => el.name === 'img', m.children), ctx));
      }
    }
  } else {
    // no builder structure: the content is the article (sometimes with raw shortcodes)
    const stripped = decodeHTML(content).replace(/\[\/?(et_pb|dsm)_[^\]]*\]/g, '');
    parts.push(...cleanNodes(parseDocument(stripped).children, ctx));
  }
  return serialize(wrapInline(parts));
}

function navLabel(title) {
  if (title.length <= 33) return title;
  const cut = title.slice(0, 33);
  return cut.slice(0, cut.lastIndexOf(' ') > 12 ? cut.lastIndexOf(' ') : 33).replace(/[\s:,;-]+$/, '');
}
const firstSentence = (s) => { const m = s.match(/^.{20,220}?[.!?](?=\s|$)/); return (m ? m[0] : s.slice(0, 180)).trim(); };

// ---- main ----------------------------------------------------------------
(async () => {
  const rows = readMap();
  const todo = rows.filter((r) => r.rule === 'post not migrated').map((r) => r.old.replace(/^\/|\/$/g, ''));
  const linkMap = new Map(rows.map((r) => [r.old, r.target]));
  const posts = await fetchAll();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const existing = new Set(fs.readdirSync(BLOG).filter((f) => f.endsWith('.njk')).map((f) => f.slice(0, -4)));
  // every post that will exist after this run resolves to /blog/<slug>/
  for (const s of todo) if (bySlug.has(s) && !SKIP.has(s)) linkMap.set('/' + s + '/', '/blog/' + s + '/');
  for (const s of existing) linkMap.set('/' + s + '/', '/blog/' + s + '/');

  const report = { written: [], skipped: [], notInApi: [], noBody: [], imageFailures: [], categories: {}, external: {} };
  for (const slug of todo) {
    const p = bySlug.get(slug);
    if (!p) { report.notInApi.push(slug); continue; }
    if (SKIP.has(slug)) { report.skipped.push([slug, 'not an article']); continue; }
    if (existing.has(slug)) { report.skipped.push([slug, 'exists']); continue; }
    const terms = ((p._embedded && p._embedded['wp:term']) || [[]])[0].map((t) => t.name);
    if (terms.some((t) => SKIP_CATEGORIES.has(t))) { report.skipped.push([slug, 'careers post']); continue; }
    const title = decodeHTML(p.title.rendered).replace(/\s+/g, ' ').trim();
    const date = p.date.slice(0, 10);
    const category = pickCategory(terms);
    report.categories[category] = (report.categories[category] || 0) + 1;
    const ctx = { slug, video: null, linkMap };
    const body = extractBody(p.content.rendered, ctx);
    const plain = decodeHTML(body.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (JOB.test(plain)) { report.skipped.push([slug, 'careers post']); continue; }
    if (plain.length < 350) {
      const ext = externalLink(body);
      if (ext) { report.external[slug] = ext; report.skipped.push([slug, 'press mention, redirects to ' + ext]); }
      else report.noBody.push([slug, plain.length]);
      continue;
    }
    const yo = p.yoast_head_json || {};
    const excerpt = decodeHTML(p.excerpt.rendered.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\[&hellip;\]|…|\[\.\.\.\]/g, '').trim();
    let description = (yo.description || excerpt || plain).trim();
    if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, '') + '...';
    // the dek is the opening line of the article itself, not the excerpt (which
    // often starts with a heading or a guest bio)
    const firstPara = (body.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || []).map((p) => decodeHTML(p.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()).find((t) => t.length > 60) || '';
    let dek = firstSentence(firstPara || excerpt || plain);
    if (dek === description || dek.length < 20 || description.startsWith(dek.slice(0, 60))) dek = '';
    const fm = ((p._embedded && p._embedded['wp:featuredmedia']) || [])[0];
    if (fm && fm.source_url) {
      const ext = path.extname(fm.source_url.split('?')[0]).toLowerCase() || '.jpg';
      queueImage(fm.source_url, path.join(HERO_DIR, slug + ext));
    }
    const product = (PRODUCTS.find(([re]) => re.test(title + ' ' + description)) || [])[1];
    const lines = ['---', 'layout: "blog-post.njk"', 'title: ' + yaml(title), 'description: ' + yaml(description)];
    if (dek) lines.push('dek: ' + yaml(dek));
    lines.push('category: ' + yaml(category), 'date: ' + yaml(date), 'navLabel: ' + yaml(navLabel(title)), 'tags: "blogpost"', 'permalink: ' + yaml('/blog/' + slug + '/'));
    if (ctx.video) lines.push('video: ' + yaml(ctx.video));
    if (product) lines.push('relatedProduct:', '  title: ' + yaml(product.title), '  url: ' + yaml(product.url));
    lines.push('---', body, '');
    if (!DRY) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, slug + '.njk'), lines.join('\n')); }
    report.written.push(slug);
  }
  const dl = DRY || NO_IMAGES ? { ok: 0, failed: 0 } : await runDownloads(report);
  report.images = dl;
  fs.writeFileSync(path.join(__dirname, 'migrate-report.json'), JSON.stringify(report, null, 1));
  console.log(`written ${report.written.length} | skipped ${report.skipped.length} | not in API ${report.notInApi.length} | no body ${report.noBody.length} | images ok ${dl.ok}, failed ${dl.failed}`);
  console.log('categories', report.categories);
  if (report.noBody.length) console.log('no body:', report.noBody.map((x) => x[0]).join(', '));
})().catch((e) => { console.error(e); process.exit(1); });
