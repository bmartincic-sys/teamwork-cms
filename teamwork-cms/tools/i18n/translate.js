#!/usr/bin/env node
/**
 * translate.js - turn an extracted bundle into a locale bundle via Claude.
 *
 * Caching is by content hash, so a page can be edited and rebuilt and only the
 * sentences that actually changed are re-translated. Everything else is read
 * from the existing locale file. That keeps the cost of a copy tweak at one
 * sentence rather than a whole page, and keeps already-reviewed Spanish stable.
 *
 * Every batch is checked after the fact: locked glossary terms must survive
 * untranslated, and the protected claims (the deliberate statements of what the
 * product does NOT do) must still be negative. A failed check is reported, not
 * silently accepted.
 *
 *   ANTHROPIC_API_KEY=... node tools/i18n/translate.js \
 *     tools/i18n/bundles/rfid.en.json es tools/i18n/bundles/rfid.es.json
 */

const fs = require('fs');

const MODEL = 'claude-opus-5';
const BATCH = 25;

const LOCALE_NAMES = {
  es: 'Spanish for Latin America (es-419)',
  fr: 'French for France (fr-FR)',
  de: 'German for Germany (de-DE)',
};

function buildPrompt(glossary, locale, items) {
  return [
    `Translate the following strings from a B2B retail software website into ${LOCALE_NAMES[locale] || locale}.`,
    '',
    glossary.styleBrief,
    '',
    'NEVER translate these terms. Copy them through exactly as written:',
    glossary.doNotTranslate.join(', '),
    '',
    'Use these renderings where the concept appears:',
    Object.entries(glossary.preferredTerms).map(([k, v]) => `  ${k} -> ${v}`).join('\n'),
    '',
    'These source sentences state something the product does NOT do. They are',
    'deliberate and legally meaningful. Keep them negative and keep their scope.',
    'Do not soften them, do not strengthen them, do not drop the negation:',
    glossary.protectedClaims.map((c) => `  - ${c}`).join('\n'),
    '',
    'Some strings contain inline HTML tags. Reproduce every tag exactly, with the',
    'same attributes, moved to wherever the translated wording needs them. Do not',
    'add, drop or renumber tags. Leave URLs, class names and numerals alone.',
    '',
    'Return ONLY a JSON object mapping each id to its translation. No prose.',
    '',
    JSON.stringify(Object.fromEntries(items.map(([k, v]) => [k, v.source])), null, 2),
  ].join('\n');
}

async function callClaude(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  const res = await fetch((process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content.map((c) => c.text || '').join('');
  const json = text.match(/\{[\s\S]*\}/);
  if (!json) throw new Error('no JSON object in response');
  return JSON.parse(json[0]);
}

// Post-hoc checks. These catch the failure modes that matter on this site:
// a locked product name getting "helpfully" translated, a tag count changing,
// or a deliberate denial losing its negation.
function audit(glossary, strings, locale = 'es') {
  const issues = [];

  for (const [key, v] of Object.entries(strings)) {
    if (!v.target) continue;

    for (const term of glossary.doNotTranslate) {
      if (v.source.includes(term) && !v.target.includes(term)) {
        issues.push({ key, type: 'glossary', detail: `"${term}" did not survive`, source: v.source });
      }
    }
    const tags = (s) => (s.match(/<[^>]+>/g) || []).length;
    if (tags(v.source) !== tags(v.target)) {
      issues.push({ key, type: 'markup', detail: `${tags(v.source)} tags in, ${tags(v.target)} out`, source: v.source });
    }
    // Protected claims: deliberate statements of what the product does NOT do,
    // or of the limits on what it does. Each carries a per-locale pattern that
    // an approved translation has to contain.
    for (const claim of glossary.protectedClaims) {
      if (!v.source.toLowerCase().includes(claim.source.toLowerCase())) continue;
      const pattern = claim.requires && claim.requires[locale];
      if (!pattern) {
        issues.push({ key, type: 'claim', detail: `no ${locale} assertion defined for "${claim.source}"`, source: v.source });
      } else if (!new RegExp(pattern, 'i').test(v.target)) {
        issues.push({ key, type: 'claim', detail: `"${claim.source}" -> ${claim.why}`, source: v.target });
      }
    }
    // Length drift beyond normal Romance-language expansion usually means
    // content was invented or dropped. Short labels swing wildly for innocent
    // reasons ("Checkout" -> "Pago"), so only judge real sentences.
    const ratio = v.target.length / v.source.length;
    if (v.source.length > 40 && (ratio > 1.8 || ratio < 0.6)) {
      issues.push({ key, type: 'length', detail: `length ratio ${ratio.toFixed(2)}`, source: v.source });
    }
  }
  return issues;
}

async function main() {
  const [bundleFile, locale, outFile] = process.argv.slice(2);
  if (!bundleFile || !locale || !outFile) {
    console.error('usage: translate.js <bundle.en.json> <locale> <out.json>');
    process.exit(1);
  }
  const glossary = JSON.parse(fs.readFileSync(__dirname + '/glossary.json', 'utf8'));
  const bundle = JSON.parse(fs.readFileSync(bundleFile, 'utf8'));
  const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : { strings: {} };

  const out = { file: bundle.file, locale, model: MODEL, strings: {} };
  const todo = [];

  for (const [key, v] of Object.entries(bundle.strings)) {
    const cached = prev.strings[key];
    if (cached && cached.source === v.source && cached.target) {
      out.strings[key] = cached;           // unchanged source, reuse reviewed copy
    } else {
      out.strings[key] = { source: v.source, kind: v.kind, target: null };
      todo.push([key, v]);
    }
  }

  console.log(`${Object.keys(out.strings).length} strings, ${todo.length} need translation, ` +
    `${Object.keys(out.strings).length - todo.length} from cache`);

  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    process.stdout.write(`  batch ${i / BATCH + 1}/${Math.ceil(todo.length / BATCH)}... `);
    const result = await callClaude(buildPrompt(glossary, locale, batch));
    for (const [key] of batch) {
      if (result[key]) out.strings[key].target = result[key];
    }
    console.log('ok');
  }

  const issues = audit(glossary, out.strings);
  out.audit = issues;
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  const done = Object.values(out.strings).filter((v) => v.target).length;
  console.log(`\n${done}/${Object.keys(out.strings).length} translated -> ${outFile}`);
  if (issues.length) {
    console.log(`\n${issues.length} issue(s) for review:`);
    issues.forEach((it) => console.log(`  [${it.type}] ${it.detail}\n      ${it.source.slice(0, 80)}`));
    process.exitCode = 2;
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });

module.exports = { audit, buildPrompt };
