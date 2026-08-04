module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addGlobalData("buildVersion", String(Date.now()));
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");

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
