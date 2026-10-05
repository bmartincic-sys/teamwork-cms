# Go-live redirects

`redirect-map.csv` maps every URL the current WordPress site publishes in its
Yoast sitemaps (pulled 5 October 2026: `old-site-posts.txt`, `old-site-pages.txt`)
to the page on this site it should 301 to when teamworkcommerce.com moves here.

Columns: `old_path`, `new_path`, `rule`, `note`.

Rules: `post exact slug` (same slug under /blog/), `post near match` (slug
renamed slightly; checked by hand), `post renamed` (same story, new slug),
`post not migrated` (no equivalent here; routed by topic, else /blog/),
`page same path`, `page mapped` (hand-mapped).

Review the `post not migrated` rows before go-live: either accept the topic
routing, migrate the post, or point them at a legacy host. Nothing here is
wired into Netlify yet; a generator will turn this file into `src/_redirects`.
