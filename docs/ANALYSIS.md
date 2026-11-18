# Analysis of the current site (baseline: `11-10 luke dark theme.zip`)
Audited 2026-11-17 from source (not rendered in a browser — visual findings are marked *inferred*).

## What it is
Static HTML/CSS/vanilla-JS, no build step, no framework, no package manager. 30 `.html` files, 1.3 MB total. Served from `public/`.
11 real pages (home, for-carriers, for-recruiters, for-agencies, how-it-works, apply, contact, about, privacy-policy, terms-of-service, sms-terms) +
19 `noindex` meta-refresh stubs (features/*, demo, glossary, compare, security, cookies, privacy, terms) + 404.

## Findings
| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | **Look differs from the target.** Site ships a *dark* theme (`dark.css`, loaded last, re-colours everything; white particles). The owner's GIF is a **light, red** design with a different header/nav ("How It Works · For Recruiters · For Carriers · Resources · Get Started") and different hero copy. | High | `index.html` head; `dark.css` header comment; GIF |
| 2 | **Forms have no endpoint.** `apply` and `contact` wizards have `data-endpoint=""`; `wizard.js` falls back to a `mailto:` link. Leads currently depend on the visitor's mail client. | **Critical for launch** | `apply/index.html`, `wizard.js:158-167` |
| 3 | **No analytics or consent tooling.** No GA/Plausible/GTM anywhere; cookies page is a stub. Can't measure conversions or SEO. | High | grep |
| 4 | **CSS cascade debt.** 8 stylesheets (~146 KB) layered `site → redesign → walk → stage → wizard → home → v3 → dark`; later files override earlier ones (`dark.css` says it only re-colours). Hard to maintain; large payload on every page. | Medium | `index.html` head |
| 5 | **JS weight.** 9–10 deferred scripts (~87 KB) incl. a 17 KB particle engine, loaded on every page whether used or not. | Medium | `assets/js/` |
| 6 | **Third-party fonts** (Google Fonts: Inter, Inter Tight, JetBrains Mono) — render-blocking stylesheet, privacy/GDPR-style exposure, extra DNS. | Medium | `index.html` head |
| 7 | **SEO structure thin.** Only Organization + WebSite JSON-LD (home); BreadcrumbList exists on 10 inner pages, but no FAQPage and no `sameAs` on Organization; meta descriptions on home/for-carriers/for-recruiters/for-agencies are 162–179 chars (limit ≈155) and for-recruiters' title is 68 chars (limit ≈60); all 11 pages share one OG image; sitemap has 11 URLs all with identical `lastmod` 2026-11-07; no guides/glossary content; 19 stubs rather than 301s. | Medium | `sitemap.xml`, stubs |
| 5b | `theme-color`/manifest are dark (`#141516`) — must follow the light theme. | Low | `site.webmanifest`, `<meta theme-color>` |
| 6b | Home is 1,333 words, 3 audience cards + 3 steps + several scroll "walkthroughs"; heavy for the fold the GIF shows (two routing cards + pipeline window). | Medium (*inferred*) | `index.html` h2 list |
| 7b | Existing animation set is complex: hero particle symbol → woven stream → regroup at "rules", My Day pinned board (`home.js`), Route walkthrough, dark stage. The GIF only needs the wave ↔ symbol. | Medium | `hero-particles.js`, `home.js` header comments |
| 8 | **Strengths to keep:** clean semantic markup, skip link, `prefers-reduced-motion` handled in 6 places, per-page canonical/OG, `llms.txt`, SMS terms page (needed for A2P), organized logo set (horizontal/symbol × full/duo/white/graphite), favicon set + 512 icon, sitemap/robots present. | — | repo |

## Risks
1. **Compliance/claims**: copy must not imply CDL System screens/hires drivers; SMS outreach (3CX/Make plans exist in the owner's workflow) needs recorded consent and A2P-registered numbers before any text is sent from the site's forms.
2. **Cold start**: a two-sided network with no public proof. Mitigation in `design/design-plan.md` (How it's held together; no fake logos/numbers).
3. **Repo/hosting not yet connected**: GitHub token in this environment is invalid; repo was initialised locally only (see `docs/DEPLOYMENT.md`).
4. **Single maintainer knowledge**: no tests beyond `npm run check`; keep docs current.

## Quick wins (≤ 1 day, no redesign)
1. Wire forms to an endpoint (Make webhook → CDL System / Google Sheet) and add a success state.
2. Replace stub redirects with `vercel.json` 301s; fix sitemap `lastmod`.
3. Self-host fonts (woff2 subsets) + preload display font.
4. Add privacy-friendly analytics (Plausible/GA4 with consent mode).
5. Fix `theme-color` / manifest after the light theme lands.

## Recommended build order
1. Light theme + new header/hero per GIF (retire `dark.css`).
2. Hero wave↔symbol animation (`design/ANIMATION-SPEC.md`).
3. Home sections per `design/design-plan.md` + `design/COPY.md`.
4. For Carriers / For Recruiters rewrites.
5. Forms + analytics.
6. Resources hub, glossary, first 3 guides.
7. Consolidate CSS (tokens + components + pages) and JS, Lighthouse pass.
