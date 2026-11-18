# Site structure & information architecture
Status: proposed v1. "Live" = exists in `public/` with real content. "Stub" = redirect stub (noindex). "New" = to build.

## Sitemap
| URL | Purpose | Intent | State |
|---|---|---|---|
| `/` | Route visitors to carrier / recruiter; demonstrate pipeline | navigational + commercial | Live (rewrite to new design/copy) |
| `/for-carriers/` | Carrier value, process, FAQ | commercial (B2B) | Live (rewrite) |
| `/for-recruiters/` | Recruiter value, offers, payouts | commercial | Live (rewrite) |
| `/for-agencies/` | Agency roster/team view | commercial | Live (keep, light rewrite) |
| `/how-it-works/` | The pipeline, step by step | informational | Live |
| `/apply/` | Wizard: carrier / recruiter / agency | conversion | Live — **form has no endpoint** |
| `/contact/` | Contact form | conversion | Live — **no endpoint** |
| `/about/` | Who runs it, facts, entity | trust | Live |
| `/resources/` | Hub for guides/glossary/compare | informational | **New** |
| `/resources/<guide>/` | SEO guides (see `research/SEO-STRATEGY.md`) | informational | **New** |
| `/glossary/` | CDL recruiting terms (DQ file, MVR, PSP, DOT physical, OTR…) | informational / GEO | Stub → **New** |
| `/compare/spreadsheets/` | "Spreadsheet vs. a recruiting pipeline" | commercial investigation | Stub → **New** |
| `/features/*` (9 pages) | Currently redirect to `/` | — | Stubs; **decision D5**: keep as redirects until copy exists, then promote the 3–4 with search value |
| `/security/` | Data handling, access | trust | Stub → New (needed for carriers' vendor review) |
| `/privacy-policy/`, `/terms-of-service/`, `/sms-terms/`, `/cookies/` | Legal (SMS terms matter for A2P compliance) | legal | Live (`/cookies/` stub) |
| `/404.html` | Not-found | — | Live |

Redirect stubs (`/privacy/`, `/terms/`, `/features/`, `/demo/`, `/glossary/`, `/security/`, `/compare/…`) are `noindex` meta-refresh pages. On Vercel replace
them with real 301s in `vercel.json` (two are already there: `/privacy`, `/terms`) and delete the stub files.

## Navigation (matches the GIF)
Header: logo · How It Works · For Recruiters ▾ · For Carriers ▾ · Resources ▾ · **Get Started** (red, right). Sticky; shrinks on scroll.
Mobile: drawer with the same groups; one primary action pinned.
Footer (composed, unequal columns): Network (For Carriers, For Recruiters, For Agencies, How It Works) · Resources · Company (About, Contact, Security) · Legal · logo particle (existing `particle-logo.js`).

## Home — section map
Hero (wave + two routes) → Pipeline demonstration → Audience rows (×3) → Sequence (sticky) → Statement break → How it's held together → FAQ → CTA/footer.
See `design/design-plan.md` § Page-level sequence and `design/COPY.md`.

## Conversion paths
1. Carrier: Home card / `For Carriers` → `/apply/?role=carrier` → confirmation → (human follow-up).
2. Recruiter: Home card / `For Recruiters` → `/apply/?role=recruiter` → confirmation.
3. Agency: `/for-agencies/` → `/apply/?role=agency`.
4. Question: `/contact/`.
Tracking (to add, consent-aware): event on card click, wizard step, submit success. Nothing is tracked today.

## Technical IA rules
- One `<h1>` per page; canonical on every page; trailing-slash URLs (`vercel.json: trailingSlash: true`).
- Every indexable page in `sitemap.xml` (`npm run check` enforces).
- JSON-LD: Organization + WebSite (home, exists), FAQPage (home, carriers, recruiters), BreadcrumbList (inner pages), Article (guides). Keep `llms.txt` current.
