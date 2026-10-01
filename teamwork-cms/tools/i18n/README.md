# Build-time translation

Translates page templates into real, indexable pages at build time. Nothing is
translated in the visitor's browser.

Currently a prototype covering one page: `/platform/rfid/` into Spanish, at
`/es/platform/rfid/`.

## Why build-time and not a runtime widget

- Runtime-translated text is not indexed, which defeats most of the reason to
  translate a marketing site at all.
- There is no review artifact. On this site a mistranslated negation would
  invert a deliberate denial, for example "there are no certified EAS gates on
  the list today". Here the Spanish is a committed file somebody can read.
- Runtime translation rewrites the visible FAQ text but not the JSON-LD
  `acceptedAnswer`, breaking the visible/structured-data parity the build
  enforces on all 19 FAQ pages.

## Running it

```bash
npm run i18n      # extract -> translate -> inject
npm run build     # render
```

Without `ANTHROPIC_API_KEY` the translate step is skipped and the committed
bundles are used. That is the intended behaviour on Netlify: a deploy never
depends on an API call and never silently changes approved copy.

## The pieces

| File | Does |
| --- | --- |
| `glossary.json` | Locked terms, preferred renderings, protected claims |
| `extract.js` | Pulls translatable strings out of a `.njk` with byte offsets |
| `translate.js` | Calls Claude in batches, then audits the result |
| `inject.js` | Rebuilds the template in the target locale |
| `run.js` | Runs all three over `targets.json` |
| `manifest.json` | Which pages exist in which locale (written by `inject.js`) |
| `bundles/*.json` | The translations, committed and reviewable |

## Things worth knowing

**Segments are sentences, not text nodes.** A heading that contains inline
markup is lifted whole, because Spanish reorders the clause:

```
Every unit, from the <span class="t-serif">dock</span> to the receipt.
Cada unidad, del <span class="t-serif">muelle</span> al recibo.
```

**Replacement is positional, not search-and-replace.** Every segment carries
its own `[start, end)` offsets, so a sentence appearing twice stays two
segments and can never be substituted into the wrong place. `extract.js`
throws if offsets overlap or drift.

**FAQ twin parity is structural.** The visible answer and its JSON-LD
`acceptedAnswer` are byte-identical in the source, so they hash to one key and
get one translation. They cannot diverge.

**Caching is by content hash.** Editing one English sentence re-translates one
sentence; the other 140 are served from the reviewed bundle and the approved
Spanish never moves.

**The audit is not advisory.** `translate.js` fails the run if a locked term
did not survive, the inline tag count changed, or a protected claim lost the
per-locale pattern it is required to keep. Each protected claim records *why*
it is protected.

**Shared includes are translated once.** `security.njk` and `logos.njk` live in
`src/_includes/es/`; `inject.js` rewrites a page's `{% include %}` only when
the locale version exists, so a half-built locale still renders.

**Untranslated strings fall back to English** rather than breaking the page.

## Not done yet

- `nav.njk` and `footer.njk` are still English on `/es/` pages.
- Internal links on `/es/` point at English pages, because none of them have a
  Spanish version yet. `inject.js` already rewrites links for pages that do.
- Spanish has no nav entry anywhere; `/es/platform/rfid/` is reachable by URL
  and by the language banner only.
- The footer's `English (US)` control is still static and does nothing.
- Only `es` is defined in the glossary's per-locale claim assertions. Adding
  `fr` or `de` means writing those patterns.
