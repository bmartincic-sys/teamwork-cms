/* Last-commit date per source file, for <lastmod> in the sitemap.
 *
 * One `git log` pass rather than a call per file: the log is newest-first, so
 * the first time a path appears is its most recent commit.
 *
 * Keyed by the inputPath Eleventy reports ("./src/index.njk"), so the sitemap
 * can look a page up directly. Files git does not know about (newly added and
 * not yet committed) are simply absent, and the sitemap omits lastmod for
 * them rather than inventing a date.
 */
const { execSync } = require("child_process");

function gitDates() {
  let prefix = "";
  let log = "";
  try {
    prefix = execSync("git rev-parse --show-prefix", { encoding: "utf8" }).trim();
    log = execSync("git log --name-only --pretty=format:%cI", {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    // Not a git checkout, or git unavailable. Build still succeeds.
    console.warn("[gitDates] no git history available, sitemap will omit lastmod");
    return {};
  }

  const isDate = /^\d{4}-\d{2}-\d{2}T/;
  const map = {};
  let current = null;

  for (const line of log.split("\n")) {
    const l = line.trim();
    if (!l) continue;
    if (isDate.test(l)) { current = l; continue; }
    if (!current) continue;
    // git reports paths from the repo root; Eleventy's inputPath is relative
    // to this package, so strip the prefix when there is one.
    if (prefix && !l.startsWith(prefix)) continue;
    const rel = prefix ? l.slice(prefix.length) : l;
    const key = "./" + rel;
    if (!(key in map)) map[key] = current;   // newest-first, so keep the first
  }
  return map;
}

module.exports = gitDates();
