#!/usr/bin/env node
/**
 * inject.js - rebuild a template in a target locale.
 *
 * Replaces each extracted segment at its recorded offset, walking backwards so
 * earlier offsets stay valid. Any segment with no translation keeps its English
 * source, so a partial translation file degrades to a partly-English page
 * rather than a broken one.
 *
 * Also rewrites the permalink into the locale prefix and rewrites internal
 * links, but only to pages that actually exist in this locale - a link to an
 * untranslated page keeps pointing at the English original rather than 404ing.
 */

const fs = require('fs');
const path = require('path');
const { extract, id } = require('./extract.js');

function localizeLinks(html, locale, exists) {
  return html.replace(/href="(\/[^"#?]*)"/g, (m, href) =>
    exists.has(href) ? `href="/${locale}${href}"` : m);
}

// Shared includes (security band, logo rail, nav, footer) are translated once
// into src/_includes/<locale>/ and reused by every page in that locale. A page
// only switches to the translated include if it exists, so a half-built locale
// still renders.
function localizeIncludes(html, locale, includeDir) {
  return html.replace(/\{%\s*include\s+"([^"]+)"\s*%\}/g, (m, name) =>
    fs.existsSync(path.join(includeDir, locale, name))
      ? `{% include "${locale}/${name}" %}`
      : m);
}

function inject({ source, translations, locale, out, existing = [], includeDir = 'src/_includes' }) {
  const { raw, segments } = extract(source);
  const dict = translations.strings || translations;

  let result = raw;
  let translated = 0, missing = [];

  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    const entry = dict[id(seg.text)];
    const value = typeof entry === 'string' ? entry : entry && entry.target;
    if (!value) { missing.push(seg.text); continue; }
    result = result.slice(0, seg.start) + value + result.slice(seg.end);
    translated++;
  }

  // A shared include has no frontmatter and no URL of its own: it is translated
  // once and pulled in by every page in the locale, so it skips all the
  // permalink and manifest handling below.
  const srcPermalink = (raw.match(/^permalink:\s*"([^"]+)"/m) || [])[1];

  if (srcPermalink) {
    result = result.replace(/^permalink:\s*"([^"]+)"/m, (m, p) => `permalink: "/${locale}${p}"`);
    // Namespace the collection tag, or the translated page joins the English
    // nav and footer collections and every solution appears twice.
    result = result.replace(/^tags:\s*"([^"]+)"/m, (m, t) => `tags: "${t}-${locale}"`);
    result = result.replace(/^---\n/, `---\nlocale: "${locale}"\ntranslatedFrom: "${srcPermalink}"\n`);
  }

  result = localizeLinks(result, locale, new Set(existing));
  result = localizeIncludes(result, locale, includeDir);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, result);

  if (srcPermalink) {
    // Record the pair so base.njk can emit hreflang and the banner knows which
    // URLs actually have a translation.
    const mf = path.join(__dirname, 'manifest.json');
    const manifest = fs.existsSync(mf)
      ? JSON.parse(fs.readFileSync(mf, 'utf8'))
      : { defaultLocale: 'en', locales: [], localeNames: {}, pages: {} };
    if (!manifest.locales.includes(locale)) manifest.locales.push(locale);
    manifest.pages[srcPermalink] = { ...(manifest.pages[srcPermalink] || {}), [locale]: `/${locale}${srcPermalink}` };
    fs.writeFileSync(mf, JSON.stringify(manifest, null, 2) + '\n');
  }

  return { out, segments: segments.length, translated, missing, permalink: srcPermalink ? `/${locale}${srcPermalink}` : '(include)' };
}

if (require.main === module) {
  const [source, transFile, locale, out] = process.argv.slice(2);
  if (!source || !transFile || !locale || !out) {
    console.error('usage: inject.js <template.njk> <translations.json> <locale> <out.njk>');
    process.exit(1);
  }
  const translations = JSON.parse(fs.readFileSync(transFile, 'utf8'));
  // Pages already translated into this locale, so internal links can be mapped.
  const existing = translations.localePages || [];
  const r = inject({ source, translations, locale, out, existing });
  console.log(`${r.translated}/${r.segments} segments -> ${r.out}  (${r.permalink})`);
  if (r.missing.length) {
    console.log(`\n${r.missing.length} untranslated, left in English:`);
    r.missing.slice(0, 20).forEach((s) => console.log('  - ' + s.slice(0, 90)));
  }
}

module.exports = { inject };
