module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
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
