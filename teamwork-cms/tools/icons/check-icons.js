#!/usr/bin/env node
/**
 * check-icons.js - fail the build if a page uses an icon the subset lacks.
 *
 * The icon font is subset to the icons in use (tools/icons/build-subset.py).
 * An icon added later would otherwise render as an empty box with no error
 * anywhere, so this runs after every build and stops it instead.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SITE = path.join(ROOT, '_site');
const css = fs.readFileSync(path.join(ROOT, 'src/assets/css/tabler-icons-subset.css'), 'utf8');
const have = new Set([...css.matchAll(/\.ti-([a-z0-9-]+):before/g)].map((m) => m[1]));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const missing = new Map();
for (const f of walk(SITE)) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/class="[^"]*\bti ti-([a-z0-9-]+)/g)) {
    if (!have.has(m[1]) && !missing.has(m[1])) missing.set(m[1], path.relative(SITE, f));
  }
}

if (missing.size) {
  console.error('\n[icons] used but not in the icon subset, so they would render blank:');
  for (const [name, file] of missing) console.error(`  ti-${name}   (first seen in ${file})`);
  console.error('\nFix: python3 tools/icons/build-subset.py   (needs: pip install fonttools brotli)\n');
  process.exit(1);
}
console.log(`[icons] ${have.size} icons in subset, all used icons present`);
