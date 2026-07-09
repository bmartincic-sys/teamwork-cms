# Teamwork Commerce Website — Eleventy + Decap CMS

This is your website, refactored so your team can add and edit pages through a
simple dashboard (no code) while keeping your existing design exactly as-is.

## What changed from your original files

- Your 17 pages' shared header, footer, and ~1,100-line CSS block (which were
  copy-pasted into every file) now live in ONE place each. Edit them once,
  every page updates.
- Every page is now a small content file with a "Title," "Meta Description,"
  and "Page Content" field — this is what the CMS dashboard edits.
- New pages (a new industry/solution page, or a new platform feature page)
  can be created directly from the dashboard, and will automatically get your
  site's real header, footer, and styling — no developer needed.
- **Placeholder logo/OG images were generated** since the original image
  files weren't in your upload. Replace these before going live — see
  "Missing images" below.

## One-time setup (about 20–30 minutes)

### 1. Push this project to GitHub
```
cd teamwork-cms
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```
(Replace the URL with a new empty repo you create on GitHub first.)

### 2. Connect the repo to Netlify
- Go to netlify.com → **Add new site → Import an existing project**
- Pick your GitHub repo
- Build settings should auto-detect from `netlify.toml`:
  - Build command: `npm run build`
  - Publish directory: `_site`
- Click **Deploy** — your site goes live on a temporary `.netlify.app` URL

### 3. Turn on Netlify Identity + Git Gateway (this powers the login/CMS)
- In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**
- Under Identity settings, set registration to **Invite only** (so random
  people can't sign up)
- Still under Identity: scroll to **Services → Git Gateway → Enable Git Gateway**
- Go to **Identity → Invite users**, and invite each teammate's email —
  they'll get an email to set a password

### 4. Connect your GoDaddy domain
- In Netlify: **Domain management → Add a domain** → enter your domain
- Netlify shows you DNS records (or nameservers)
- In GoDaddy: **My Products → DNS** for your domain → add what Netlify gave you
- Free HTTPS is issued automatically once it's connected

### 5. Missing images
Your upload didn't include an images folder, so these are currently
placeholders. Add the real files at these exact paths (matching what your
original pages referenced) and the CMS media picker will pick them up:
- `src/assets/images/teamwork-logo-color.png`
- `src/assets/images/teamwork-logo-white.png`
- `src/assets/images/blog/rfid-2026.jpg`
- `src/assets/images/customers/city-beach.jpg`
- `src/assets/images/customers/colorado-rockies.jpg`
- `src/assets/images/customers/sports-basement.jpg`
- `src/assets/images/logos/brand.svg`
- `src/assets/images/og-image.jpg` (social share preview image)

## Day-to-day: how your team edits the site

1. Go to `yoursite.com/admin`
2. Log in with the email/password from the invite
3. Three sections in the dashboard:
   - **Simple Pages** — Homepage, About, Contact, Careers
   - **Platform Pages** — Mobile POS, OMS, Inventory Control, RFID, 121
     Commerce, Analytics
   - **Solution / Industry Pages** — Footwear, Jewelry, Luxury, Pet Goods,
     Fashion, Museums, Stadiums
4. Click any page → edit Title, Meta Description, or the Page Content field →
   **Publish**
5. Site rebuilds and goes live automatically within about a minute

### Adding a brand-new page (e.g. a new industry vertical)
1. Go to **Platform Pages** or **Solution / Industry Pages** → click **New**
2. Fill in:
   - Title, Meta Description
   - Nav / Footer Label (what shows in the menu)
   - URL Path — e.g. `/solutions/electronics/` (must start and end with `/`)
   - Page Content — this is raw HTML. Easiest approach: open an existing
     similar page, copy its Page Content, paste it into the new page, and
     edit the text/copy. It'll automatically inherit your site's header,
     footer, and styling.
3. Publish — the new page appears in the site nav and footer automatically

### A note on "Page Content"
Because your original pages are richly designed (custom layouts, stat
callouts, icons — not just plain paragraphs), the content field is edited as
raw HTML rather than a fully visual drag-and-drop editor. This keeps your
exact design intact. Text and image edits are simple copy/paste; layout
changes (rearranging sections) require basic comfort editing HTML, or a
quick ask to a developer/me for bigger structural changes.

## Local preview (optional, for testing before publishing)
```
npm install
npm run start
```
Opens a local preview at `http://localhost:8080`.
