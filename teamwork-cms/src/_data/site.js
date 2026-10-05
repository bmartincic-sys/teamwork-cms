// The origin the site is being served from. Netlify sets URL at build time (the
// review site now, the production domain once it moves), so share previews and
// og:url always point at a page that exists. Falls back to production.
module.exports = {
  url: (process.env.URL || 'https://www.teamworkcommerce.com').replace(/\/$/, '')
};
