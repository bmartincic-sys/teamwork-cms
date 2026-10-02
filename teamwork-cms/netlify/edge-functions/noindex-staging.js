// Keep review deploys out of search results.
//
// The same Netlify site will later serve the production domain, so a blanket
// X-Robots-Tag in netlify.toml would deindex production too. This checks the
// host on every request instead: *.netlify.app (the review site and deploy
// previews) gets noindex, any custom domain is left alone. Nothing to change
// or redeploy when the production domain goes live.
export default async (request, context) => {
  const response = await context.next();
  if (new URL(request.url).hostname.endsWith(".netlify.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
};

export const config = { path: "/*", excludedPath: ["/assets/*"] };
