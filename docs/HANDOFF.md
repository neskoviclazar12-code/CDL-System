# Handoff — where the last agent stopped
Last updated: 2026-11-17 (session `019gbVsNJd5hJYTU9eguwKzS`). Read `CLAUDE.md` first, then this file.

## Done
- Imported the owner's latest site snapshot (`11-10 luke dark theme.zip`) into `public/` as the baseline commit.
- Project scaffolding: `package.json`, `vercel.json`, `.gitignore`, `scripts/check.mjs` (passes: 30 pages, 0 problems), local git repo on `main`.
- Analysis of the existing site → `docs/ANALYSIS.md`.
- Market, competitor, audience, idea and SEO/GEO research → `research/`.
- Design direction, colour/type/layout/motion plan (bol-design plugin), copy deck, site structure, animation spec → `design/`.
- Architecture, deployment and decision log → `docs/`.

## SEO quick wins applied 2026-11-17 (live pages, still dark theme)
- Titles/meta descriptions fixed to ≤60/≤155 on home, for-carriers, for-recruiters, for-agencies, about, contact (og/twitter descriptions synced); sitemap `lastmod` updated for those pages.
- 301 redirects for all 19 meta-refresh stubs added to `vercel.json` (stub files kept as fallback).
- Still TODO: FAQPage JSON-LD (needs a visible FAQ section first), Organization `sameAs` (needs real profile URLs), per-page OG images, analytics, self-hosted fonts, content hub.

## Disclosure cleanup still needed on live pages (D10)
- Home `#stage` sample screen shows a "Recruiting fees · Admin only · Sample $18,400 · 6 starts invoiced" panel — **remove before any public launch**.
- Review the "Eight things", `stage`, My Day and Route sections for module/field-level detail; replace with outcome-level copy per `design/COPY.md`.
- `llms.txt` stays minimal (company, audience, not a job board); do not expand it with product detail.

## NOT done (page copy/design not rebuilt)
1. **Nothing is built from the new design.** `public/` is still the dark-theme baseline.
2. **Hero animation not reworked** — spec only (`design/ANIMATION-SPEC.md`).
3. **Not pushed to GitHub / not on Vercel** (invalid token; see `docs/DEPLOYMENT.md`).
4. Contrast values for action/deep red are *candidates*, not frozen.
5. Not rendered/visually tested in a browser (audit was from source).

## Next steps, in order
1. Confirm open questions below with the owner (Lazar / "Mike").
2. Push repo to GitHub, connect Vercel (docs/DEPLOYMENT.md).
3. **Theme**: stop loading `dark.css`, move to `archive/`, rebuild header (red bar, new nav, "Get Started"), tokens (action red, deep red), `theme-color`/manifest.
4. **Hero**: layout per `design/design-plan.md`; implement animation items 1→3 of `design/ANIMATION-SPEC.md`; compare against the GIF frames.
5. **Home sections** per plan + `design/COPY.md`; simplify/remove walkthroughs that don't serve the plan (`home.js` My Day/Route, `stage`).
6. Rewrite For Carriers / For Recruiters / For Agencies / How It Works.
7. Forms → endpoint + success states; analytics + consent.
8. Resources hub, glossary, first guides (`research/SEO-STRATEGY.md`).
9. Run the bol-design `design-critique` skill on the built page against `design/design-plan.md` (once, batched), fix once, stop.
10. Pre-launch checklist in `docs/DEPLOYMENT.md`.

## Open questions for the owner
1. **GitHub**: org/repo name and a way to authenticate (token or add the repo to the Claude GitHub app)?
2. **Light vs dark**: confirm light/red per the GIF (assumption D2) — should a dark theme ship at all?
3. ~~Fees and payouts~~ **Decided 2026-11-17: nothing public** (D10). Remaining question: is the GIF's dashboard window OK as a *stylized* board, or should it go entirely?
4. **Proof**: any carrier or recruiter willing to be named? Any real number (with unit, period, source) we can publish?
5. **Guarantee window** for "Retained" step and the reply SLA ("within 1 business day"?).
6. **Lead endpoint**: Make webhook, CDL System API, or Google Sheet? Who receives leads, and in what format?
7. **Analytics** preference (Plausible vs GA4) and cookie banner needs.
8. **Photography/brand assets**: any rights-cleared images, or stay with halftone + product window only?
9. Contact details on site (info@cdlsystem.com, +1 224 765 8049) — still correct? Entity name/address for About/legal.
10. "Resources" scope: OK to publish guides under the CDL System brand with a named author?

## Gotchas
- `dark.css` re-colours by override; removing it exposes any light styles that were never updated — expect a visual pass.
- `hero-particles.js` hard-codes colours for the dark theme and a cross-page "stream" that depends on `#rules-slot` and `#stage`; changing the layout can break it silently (it bails out if elements are missing).
- `privacy/` and `terms/` are meta-refresh stubs; Vercel 301s now cover them — delete stubs when convenient.
- GIF is a dithered 6-frame sample; do not colour-pick from it for final tokens.

## Carrier intake form (added 2026-11-17)
`/hire-drivers/` = 9-step carrier form copied in structure from nexusdrivers.com/hire-drivers (FMCSA lookup, fleet size, pay type, pay rate, trailers, escrow, truck year, drivers wanted + count, call day/time + contact + consents). Script: `assets/js/carrier-intake.js`. Differences from the original: brand/consent text is CDL System LLC; call consent is required; no backend yet (`data-endpoint` empty), so the last step opens a prefilled e-mail to info@cdlsystem.com. Wire a real endpoint before launch (see DEPLOYMENT checklist). The FMCSA search calls the public data.transportation.gov census directly from the browser.

## Status 2026-11-17 (evening): light/red design is now LIVE in `public/`
- `assets/css/light.css` replaces `dark.css` on every page; header is red (`#9C1E1A`), action buttons use `#C22114`.
- Home: new hero (`assets/js/hero-wave.js`, ribbon -> CDL symbol -> ribbon), two cards, red-framed pipeline window (sample data, no fees).
- `/for-carriers/#request` embeds the 9-step carrier form (FMCSA lookup first). Delivery is mailto to info@cdlsystem.com until a backend exists.
- Still to do: remove unused JS/CSS (stage.js, home.js, hero-particles.js, particle-logo.js, stage.css, home.css, walk.css are no longer used by the home page), self-host fonts, consent-aware analytics, FAQ + FAQPage JSON-LD, per-page OG images, mobile pass on inner pages, a lawyer-drafted anti-scraping clause for the Terms.
- Reconsider: the pipeline window shows status names and sample rows. The disclosure policy (D10) recommends keeping it stylised; the owner chose to keep it.
