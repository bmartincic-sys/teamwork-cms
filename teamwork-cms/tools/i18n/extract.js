#!/usr/bin/env node
/**
 * extract.js - pull translatable strings out of a Nunjucks template.
 *
 * Emits a bundle of { id -> { source, kind, context } } plus a positional map so
 * inject.js can rebuild the file deterministically. Nothing is matched by
 * search-and-replace: every segment carries its own [start, end) byte offsets,
 * so a sentence that appears twice on the page stays two separate segments and
 * can never be substituted into the wrong place.
 *
 * Segments are whole sentences, not text nodes. A heading like
 *   <h1>Every unit, from the <span class="t-serif">dock</span> to the receipt.</h1>
 * is lifted to one segment with the inline tag left inline, because Spanish
 * reorders the clause and three separate fragments could not be reassembled.
 *
 * Deliberately NOT extracted:
 *   - anything inside {{ }} or {% %}      (Nunjucks - resolved at build time)
 *   - <script> bodies except JSON-LD      (behaviour, not copy)
 *   - <style> bodies, class/href/src/id   (markup contract)
 *   - frontmatter keys that are routing or data, not copy
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FM_TRANSLATE = ['title', 'description', 'navLabel', 'stickyText', 'stickyCta', 'heroEyebrow'];
const ATTR_TRANSLATE = ['alt', 'aria-label', 'title', 'placeholder', 'data-label'];
// JSON-LD keys whose string values are human-facing copy.
const LD_TRANSLATE = ['name', 'description', 'text', 'headline', 'alternateName'];

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);
// If one of these appears inside an element, the element is a container, not a
// sentence - never lift a segment across it.
const BLOCK = new Set(['div', 'section', 'article', 'aside', 'header', 'footer', 'main',
  'nav', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead',
  'tbody', 'tr', 'td', 'th', 'form', 'fieldset', 'figure', 'blockquote', 'dl', 'dt', 'dd']);

const id = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const translatable = (s) => /\p{L}/u.test(s) && s.trim().length > 1;

function extract(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const segments = [];

  // ---- 1. frontmatter -------------------------------------------------
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  let bodyStart = 0;
  if (fm) {
    bodyStart = fm[0].length;
    let off = 4; // past the opening "---\n"
    for (const line of fm[1].split('\n')) {
      const m = line.match(/^(\w+):\s*"([\s\S]*)"\s*$/);
      if (m && FM_TRANSLATE.includes(m[1])) {
        const s = off + line.indexOf('"' + m[2] + '"') + 1;
        segments.push({ start: s, end: s + m[2].length, text: m[2], kind: 'frontmatter', note: m[1] });
      }
      off += line.length + 1;
    }
  }

  // ---- 2. mask regions that must never be translated ------------------
  const body = raw.slice(bodyStart);
  const blank = (m) => '\0'.repeat(m.length);
  let masked = body
    .replace(/\{\{[\s\S]*?\}\}/g, blank)
    .replace(/\{%[\s\S]*?%\}/g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<style\b[\s\S]*?<\/style>/gi, blank);

  // JSON-LD gets its own pass; all script bodies leave the generic scan.
  const ldRanges = [];
  masked = masked.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, inner, offset) => {
    if (/application\/ld\+json/i.test(attrs)) ldRanges.push({ start: offset + m.indexOf(inner), text: inner });
    return blank(m);
  });

  // ---- 3. tag-stack walk: find sentence-level translation units -------
  // A unit is an element that holds real text directly and contains no block
  // element. Nested candidates are dropped in favour of the outermost one.
  const candidates = [];
  const stack = [];
  const tokenRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let t, cursor = 0;

  const sawText = (from, to) => {
    const txt = masked.slice(from, to);
    if (!txt.includes('\0') && translatable(txt) && stack.length) stack[stack.length - 1].text = true;
  };

  while ((t = tokenRe.exec(masked)) !== null) {
    sawText(cursor, t.index);
    cursor = t.index + t[0].length;
    const tag = t[1].toLowerCase();
    const closing = t[0][1] === '/';
    const selfClosing = VOID.has(tag) || /\/>$/.test(t[0]);

    if (closing) {
      // Unwind to the matching open tag; tolerate stray closers.
      let i = stack.length - 1;
      while (i >= 0 && stack[i].tag !== tag) i--;
      if (i < 0) continue;
      const el = stack[i];
      stack.length = i;
      if (el.text && !el.block) {
        candidates.push({ start: el.innerStart, end: t.index, tag: el.tag });
      }
      // Propagate upwards so ancestors know what they contain.
      if (stack.length) {
        const p = stack[stack.length - 1];
        if (BLOCK.has(tag) || el.block) p.block = true;
      }
    } else if (!selfClosing) {
      stack.push({ tag, innerStart: cursor, text: false, block: false });
    } else if (BLOCK.has(tag) && stack.length) {
      stack[stack.length - 1].block = true;
    }
  }
  sawText(cursor, masked.length);

  // Keep only the outermost candidate of each nest.
  const outermost = candidates.filter((c) =>
    !candidates.some((o) => o !== c && o.start <= c.start && o.end >= c.end &&
      (o.end - o.start) > (c.end - c.start)));

  for (const c of outermost) {
    const slice = masked.slice(c.start, c.end);
    const lead = slice.match(/^\s*/)[0].length;
    const inner = slice.trim();
    if (!translatable(inner) || inner.includes('\0')) continue;
    const s = bodyStart + c.start + lead;
    segments.push({ start: s, end: s + inner.length, text: inner, kind: 'text', note: c.tag });
  }

  // ---- 4. translatable attributes -------------------------------------
  const attrRe = new RegExp(`\\b(${ATTR_TRANSLATE.join('|')})="([^"]*)"`, 'gi');
  let m;
  while ((m = attrRe.exec(masked)) !== null) {
    if (m[2].includes('\0') || !translatable(m[2])) continue;
    const s = bodyStart + m.index + m[0].indexOf('"' + m[2] + '"') + 1;
    segments.push({ start: s, end: s + m[2].length, text: m[2], kind: 'attribute', note: m[1].toLowerCase() });
  }

  // ---- 5. JSON-LD copy keys -------------------------------------------
  for (const ld of ldRanges) {
    const keyRe = new RegExp(`"(${LD_TRANSLATE.join('|')})"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g');
    let k;
    while ((k = keyRe.exec(ld.text)) !== null) {
      if (k[2].includes('\0') || !translatable(k[2])) continue;
      const s = bodyStart + ld.start + k.index + k[0].lastIndexOf('"' + k[2] + '"') + 1;
      segments.push({ start: s, end: s + k[2].length, text: k[2], kind: 'jsonld', note: k[1] });
    }
  }

  segments.sort((a, b) => a.start - b.start);

  // An attribute inside a lifted sentence is already part of that segment.
  const kept = segments.filter((s, i) =>
    !(s.kind === 'attribute' && segments.some((o, j) =>
      j !== i && o.kind === 'text' && o.start <= s.start && o.end >= s.end)));

  for (let i = 1; i < kept.length; i++) {
    if (kept[i].start < kept[i - 1].end) {
      throw new Error(`overlapping segments at ${kept[i].start}: ` +
        `${JSON.stringify(kept[i - 1].text)} / ${JSON.stringify(kept[i].text)}`);
    }
  }
  for (const seg of kept) {
    const got = raw.slice(seg.start, seg.end);
    if (got !== seg.text) {
      throw new Error(`offset drift at ${seg.start}: expected ${JSON.stringify(seg.text)}, found ${JSON.stringify(got)}`);
    }
  }
  return { raw, segments: kept };
}

if (require.main === module) {
  const [file, out] = process.argv.slice(2);
  if (!file || !out) {
    console.error('usage: extract.js <template.njk> <bundle.json>');
    process.exit(1);
  }
  const { segments } = extract(file);
  const strings = {};
  for (const seg of segments) {
    const key = id(seg.text);
    if (!strings[key]) strings[key] = { source: seg.text, kind: seg.kind, context: [] };
    if (!strings[key].context.includes(seg.note)) strings[key].context.push(seg.note);
  }
  const bundle = {
    file: path.relative(process.cwd(), file),
    extractedAt: new Date().toISOString().slice(0, 10),
    segments: segments.length,
    unique: Object.keys(strings).length,
    words: segments.reduce((n, s) => n + s.text.split(/\s+/).length, 0),
    strings,
  };
  fs.writeFileSync(out, JSON.stringify(bundle, null, 2) + '\n');
  console.log(`${bundle.segments} segments, ${bundle.unique} unique, ${bundle.words} words -> ${out}`);
}

module.exports = { extract, id };
