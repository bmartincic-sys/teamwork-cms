// Locale manifest, written by tools/i18n/inject.js.
// Drives <html lang>, hreflang alternates, and the Netlify edge function that
// offers a visitor their own language. One source of truth for all three, so a
// page can never advertise a translation that was not actually built.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '..', 'tools', 'i18n', 'manifest.json');

module.exports = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : { locales: [], pages: {} };
