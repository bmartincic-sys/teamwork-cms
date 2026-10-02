#!/usr/bin/env node
/**
 * check-images.js - after the build, fail on any image reference that points
 * at nothing, and list raster images that have no WebP yet.
 *
 * The build swaps <img> paths to WebP at output time, so a wrong path would
 * otherwise only show up as a broken picture on the live site.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SITE = path.join(ROOT, '_site');

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'lp') walk(p, out); }
    else if (/\.(html|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const broken = new Map(); const noWebp = new Set(); let refs = 0;
const pat = /(\/assets\/images\/[^"'\s)?,]+\.(?:jpe?g|png|webp|gif|svg))(?:\s+\d+w)?/gi;
for (const f of walk(SITE)) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(pat)) {
    refs++;
    const u = m[1];
    if (!fs.existsSync(path.join(SITE, u))) { if (!broken.has(u)) broken.set(u, path.relative(SITE, f)); continue; }
    if (/\.(jpe?g|png)$/i.test(u) && /<img|url\(/.test(s.slice(Math.max(0, m.index - 300), m.index))) {
      if (!fs.existsSync(path.join(SITE, u.replace(/\.(jpe?g|png)$/i, '.webp')))) noWebp.add(u);
    }
  }
}
if (noWebp.size) console.log(`[images] ${noWebp.size} raster image(s) still served without a WebP; run tools/images/optimize.py`);
if (broken.size) {
  console.error('\n[images] references to images that do not exist:');
  for (const [u, f] of broken) console.error(`  ${u}   (first seen in ${f})`);
  process.exit(1);
}
console.log(`[images] ${refs} image references, none broken`);
