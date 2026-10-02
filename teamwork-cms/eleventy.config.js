module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addGlobalData("buildVersion", String(Date.now()));
  // Footer copyright: derived at build time so it cannot go stale in January.
  eleventyConfig.addGlobalData("buildYear", String(new Date().getFullYear()));
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  // Standalone landing pages: copied verbatim, never templated, and invisible to
  // collections, so nothing under src/lp can ever appear in the nav or the sitemap.
  eleventyConfig.addPassthroughCopy("src/lp");
  eleventyConfig.ignores.add("src/lp/**");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  // RFC 9116 security contact. Renew the Expires line yearly.
  eleventyConfig.addPassthroughCopy("src/.well-known");

  // Images at output time. Templates keep their readable .jpg/.png paths; here
  // each <img> is pointed at its WebP (tools/images/manifest.json, made by
  // tools/images/optimize.py), given a phone-sized option when one exists, and
  // lazy-loaded unless it is in the hero. An image with no WebP is left as is.
  const fs = require("fs");
  const manifestPath = "tools/images/manifest.json";
  const images = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  eleventyConfig.addTransform("images", function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;

    // The hero is everything from <main> to the end of its first section. Images
    // there are the largest paint, so they load eagerly; the first one is
    // prioritised. Everything else, the nav dropdowns included, waits until near.
    const main = html.indexOf("<main");
    const firstSection = main > -1 ? html.indexOf("<section", main) : -1;
    const heroEnd = firstSection > -1 ? html.indexOf("</section>", firstSection) : -1;
    let prioritised = false;

    return html.replace(/<img\b[^>]*>/gi, (tag, offset) => {
      let out = tag;
      const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
      const entry = src && images[src];
      if (entry) {
        out = out.replace(`src="${src}"`, `src="${entry.webp}"`);
        if (entry.small && !/\ssrcset=/.test(out)) {
          out = out.replace(/^<img/i, `<img srcset="${entry.small} 1200w, ${entry.webp} ${entry.w}w" sizes="100vw"`);
        }
      }
      if (/\.svg(\?|$)/i.test(src || "")) return out;   // logos and icons: tiny, leave alone

      const inHero = main > -1 && offset > main && heroEnd > -1 && offset < heroEnd;
      if (inHero) {
        out = out.replace(/\sloading="lazy"/i, "");
        if (!prioritised) { out = out.replace(/^<img/i, '<img fetchpriority="high"'); prioritised = true; }
      } else if (!/\sloading=/i.test(out)) {
        out = out.replace(/^<img/i, '<img loading="lazy"');
      }
      if (!/\sdecoding=/i.test(out)) out = out.replace(/^<img/i, '<img decoding="async"');
      return out;
    });
  });

  eleventyConfig.addFilter("readingTime", (html) => {
    const text = (html || "").replace(/<[^>]*>/g, " ");
    const words = (text.match(/\S+/g) || []).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("formatDate", (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[month - 1]} ${day}, ${year}`;
  });

  eleventyConfig.addFilter("slugify", (str) =>
    (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("uniqueCategories", (posts) => {
    const cats = (posts || []).map((p) => p.data.category || "Blog");
    return [...new Set(cats)];
  });

  // Posts in a given category, newest first
  eleventyConfig.addFilter("inCategory", (posts, cat) => {
    if (!Array.isArray(posts)) return [];
    return posts
      .filter((p) => p.data.category === cat)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Most recent N posts by date (used for the "latest from the blog" nav dropdown)
  eleventyConfig.addFilter("recentPosts", (posts, n) => {
    if (!Array.isArray(posts)) return [];
    return [...posts]
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .slice(0, n);
  });

  // First N items of a list (used for the "latest stories" nav dropdown)
  eleventyConfig.addFilter("take", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []));

  eleventyConfig.addFilter("sortByNavOrder", (items) => {
    return [...(items || [])].sort((a, b) => (a.data.navOrder ?? 999) - (b.data.navOrder ?? 999));
  });

  eleventyConfig.addFilter("relatedPosts", (posts, currentUrl, currentCategory, limit) => {
    limit = limit || 4;
    const others = (posts || []).filter((p) => p.url !== currentUrl);
    const sameCategory = others
      .filter((p) => (p.data.category || "Blog") === currentCategory)
      .sort((a, b) => (b.data.date || "").localeCompare(a.data.date || ""));
    const rest = others
      .filter((p) => (p.data.category || "Blog") !== currentCategory)
      .sort((a, b) => (b.data.date || "").localeCompare(a.data.date || ""));
    return [...sameCategory, ...rest].slice(0, limit);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
