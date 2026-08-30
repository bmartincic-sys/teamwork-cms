/* Which blog slugs have a hero image on disk. The post layout builds the hero src
   from the slug, so without this a post added before its image lands renders a
   broken image rather than simply going without one. */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "assets", "images", "blog", "real");

module.exports = () => {
  const map = {};
  let files = [];
  try { files = fs.readdirSync(dir); } catch (e) { return map; }
  files.forEach(function (f) {
    const ext = path.extname(f).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
      map[path.basename(f, path.extname(f))] = f;
    }
  });
  return map;
};
