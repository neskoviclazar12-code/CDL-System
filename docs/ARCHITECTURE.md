# Architecture
Last updated: 2026-11-17

## Overview
Static marketing site for **cdlsystem.com** (CDL System LLC). No framework, no bundler: hand-authored HTML, CSS and vanilla JS, served as-is.
GitHub (source of truth) → Vercel (auto-deploy on push to `main`, preview deploys on branches/PRs) → cdlsystem.com.

```
cdl-system-site/
├─ CLAUDE.md                # agent instructions (read first)
├─ README.md                # human summary (Serbian)
├─ package.json             # scripts only; no runtime deps
├─ vercel.json              # outputDirectory=public, trailingSlash, headers, redirects
├─ scripts/check.mjs        # link/SEO sanity check  (npm run check)
├─ public/                  # ← deployed root
│  ├─ index.html, <page>/index.html …   # one folder per route, trailing-slash URLs
│  ├─ 404.html, robots.txt, sitemap.xml, llms.txt, site.webmanifest, favicon.ico
│  └─ assets/
│     ├─ css/   site.css (tokens+base) · redesign · walk · stage · wizard · home · v3 · dark (archive target)
│     ├─ js/    site.js (nav/drawer) · motion · rise (reveal) · hero-particles · particle-logo · crop-particles
│     │         home.js (walkthroughs) · stage.js · walk.js · wizard.js (apply/contact forms)
│     ├─ brand/ logo/*.svg (horizontal|symbol × full|duo|white|graphite) · pattern/
│     ├─ icons/ favicon-32…512.png
│     └─ marketing/og-default.png
├─ design/                  # design-plan.md, COPY.md, SITE-STRUCTURE.md, ANIMATION-SPEC.md, reference-hero-wave.gif
├─ research/                # MARKET-RESEARCH.md, SEO-STRATEGY.md
├─ docs/                    # ARCHITECTURE, ANALYSIS, DECISIONS, DEPLOYMENT, HANDOFF
└─ archive/                 # retired code kept for reference (e.g. dark.css once removed from the load path)
```

## Runtime model
- **Routing**: folder-per-route (`/for-carriers/index.html`), `trailingSlash: true`. Redirects live in `vercel.json` (not meta-refresh stubs).
- **CSS**: token layer in `site.css` (`--firebrick`, `--graphite`, `--ink`, `--chalk`, `--stone`, `--hivis`, spacing, type). Target state: `tokens.css` + `base.css` + `components.css` + per-page files, no override layers.
- **JS**: progressive enhancement. `<html class="js">` is set inline; every reveal/animation must leave content visible without JS. Modules are IIFEs, no dependencies.
- **Animation**: canvas 2D particle engine (`hero-particles.js`, `particle-logo.js`) — see `design/ANIMATION-SPEC.md`. Reduced-motion is respected.
- **Forms**: `wizard.js` handles `apply` and `contact`. It POSTs JSON to `data-endpoint`; with an empty endpoint it falls back to `mailto:`. **Production needs an endpoint** (proposed: Make.com webhook → CDL System / Sheet; the owner already runs Make).
- **Fonts**: Google Fonts (Inter, Inter Tight, JetBrains Mono) — planned self-hosting.
- **No analytics yet.** Add consent-aware analytics before launch.

## Conventions
- One `<h1>`, canonical, meta description, OG tags on every page; JSON-LD in `<head>`.
- Internal URLs are absolute-path (`/for-carriers/`), never relative.
- Brand colours only via tokens; no raw hex in components. Action red is derived (see `design/design-plan.md`).
- Copy comes from `design/COPY.md`; if copy changes, update the doc in the same commit.
- Commits: conventional (`feat:`, `fix:`, `docs:`, `chore:`), small and separate for animation vs layout vs copy.
- Quality gate before every push: `npm run check` (0 problems) and a manual look at 375 / 768 / 1280 px.

## Build / run / test
```bash
npm run dev      # static preview on http://localhost:3000 (npx serve public)
npm run check    # internal links, title/description/canonical/h1, sitemap coverage
```
Vercel needs **no build command**; Framework Preset "Other", Output Directory `public` (already in `vercel.json`).

## Future architecture options (not needed for launch)
- Move to a static generator (Astro/Eleventy) when guides/glossary pass ~15 pages, to share header/footer and generate sitemap/JSON-LD. Keep URLs identical.
- Serverless function (`/api/lead`) on Vercel to validate + forward leads instead of a direct Make webhook (hides the webhook URL, adds spam protection).
