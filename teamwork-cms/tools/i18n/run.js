#!/usr/bin/env node
/**
 * run.js - the whole pipeline for every target in targets.json.
 *
 *   npm run i18n              extract -> translate (needs a key) -> inject
 *   npm run i18n -- --no-api  extract -> inject, using the committed bundles
 *
 * The --no-api path is the normal one in CI and on Netlify: translations are
 * reviewed and committed, so a deploy never depends on an API call and never
 * silently changes approved copy. Only a writer re-running with a key produces
 * new Spanish, and only for sentences whose English actually changed.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const here = __dirname;
const targets = JSON.parse(fs.readFileSync(path.join(here, 'targets.json'), 'utf8'));
const useApi = !process.argv.includes('--no-api') && !!process.env.ANTHROPIC_API_KEY;

if (!useApi && !process.argv.includes('--no-api')) {
  console.log('ANTHROPIC_API_KEY not set - using the committed translation bundles.\n');
}

const node = (script, args) =>
  execFileSync(process.execPath, [path.join(here, script), ...args], { stdio: 'inherit' });

for (const t of targets.files) {
  const base = path.basename(t.source, '.njk');
  const enBundle = path.join(here, 'bundles', `${base}.en.json`);
  console.log(`\n== ${t.source}`);
  node('extract.js', [t.source, enBundle]);

  for (const locale of targets.locales) {
    const locBundle = path.join(here, 'bundles', `${base}.${locale}.json`);
    if (useApi) node('translate.js', [enBundle, locale, locBundle]);
    if (!fs.existsSync(locBundle)) {
      console.log(`   ${locale}: no bundle, skipped`);
      continue;
    }
    const out = t.out.replace('{locale}', locale);
    node('inject.js', [t.source, locBundle, locale, out]);
  }
}
console.log('\nDone. Run `npm run build` to render.');
