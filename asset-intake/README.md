# Asset intake

Not published. Netlify builds from `teamwork-cms/`, so nothing here reaches the
live site.

These folders used to sit under `src/assets/images/`, where the build copied
them to the public site even though no page used them:

- `images-incoming/`, `logos-incoming/`, `hero-incoming/`: raw screenshots,
  AI-generated images, photo sidecar files, and a ZIP of the June draft site.
- `team-originals/`: full-resolution employee headshots. The site uses the
  compressed copies in `src/assets/images/company/team/`.

To use an image from here, copy it into `src/assets/images/`, reference it, and
run `tools/images/optimize.py`.
